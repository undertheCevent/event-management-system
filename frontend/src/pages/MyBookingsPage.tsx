import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  QrCode,
  CalendarPlus,
  Printer,
  Ticket,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Star,
  Search,
  Zap,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useMineBookings, useCancelBooking, bookingsApi } from '@/api/bookings'
import { formatDate, formatCurrency } from '@/lib/utils'
import { QRCodeSVG } from 'qrcode.react'
import type { Booking } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function getLabel(b: Booking): string {
  if (b.status === 'Cancelled') return 'Cancelled'
  const now = Date.now()
  if (new Date(b.eventEndDate).getTime() < now) return 'Completed'
  if (new Date(b.eventStartDate).getTime() <= now) return 'Happening Now'
  return 'Upcoming'
}

/** Returns "2d 4h", "3h 12m", "45m 20s" until targetDate, or null if past. Updates every second. */
function useCountdown(targetDate: string | undefined): string | null {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!targetDate) return
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!targetDate) return null
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return null

  const days    = Math.floor(diff / 86_400_000)
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000)  / 60_000)
  const seconds = Math.floor((diff % 60_000)      / 1_000)

  if (days > 0)  return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds}s`
}

const CARD_ACCENTS = [
  'border-l-amber-400',
  'border-l-purple-500',
  'border-l-blue-500',
  'border-l-emerald-400',
  'border-l-rose-400',
  'border-l-cyan-400',
]

type TabKey = 'upcoming' | 'past' | 'cancelled'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'upcoming',  label: 'Upcoming',  icon: Clock        },
  { key: 'past',      label: 'Past',      icon: CheckCircle2 },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle      },
]

// ── Next-event countdown banner ───────────────────────────────────────────────

function NextEventBanner({ booking }: { booking: Booking }) {
  const countdown = useCountdown(booking.eventStartDate)
  if (!countdown) return null

  return (
    <div className="mb-5 flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-500 p-2 shrink-0">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Next Event</p>
          <p className="mt-0.5 text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug line-clamp-1">
            {booking.eventTitle}
          </p>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            {formatDate(booking.eventStartDate, 'EEE, MMM d · h:mm a')} · {booking.eventLocation}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-2xl font-black tabular-nums text-amber-600 dark:text-amber-400 leading-none">{countdown}</p>
        <p className="mt-0.5 text-[10px] text-stone-400">until doors open</p>
      </div>
    </div>
  )
}

// ── Booking card ──────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  isPast = false,
  onQr,
  onCancel,
}: {
  booking: Booking
  isPast?: boolean
  onQr: (b: Booking) => void
  onCancel: (b: Booking) => void
}) {
  const now = Date.now()
  const isLive = booking.status === 'Confirmed'
    && new Date(booking.eventStartDate).getTime() <= now
    && new Date(booking.eventEndDate).getTime() > now
  const labelText = getLabel(booking)
  const canCancel = !isPast && booking.status !== 'Cancelled'

  // Warn when within 7 days of start
  const hoursUntil = (new Date(booking.eventStartDate).getTime() - now) / 3_600_000
  const nearCancelDeadline = canCancel && hoursUntil > 0 && hoursUntil < 168

  const accent = isLive
    ? 'border-l-emerald-500'
    : CARD_ACCENTS[booking.eventId % CARD_ACCENTS.length]

  return (
    <div className={`group overflow-hidden rounded-2xl border bg-white dark:bg-stone-900 shadow-sm transition-shadow hover:shadow-md
      ${isLive
        ? 'border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-900'
        : 'border-stone-200 dark:border-stone-800'
      }`}
    >
      {/* Image banner */}
      {booking.eventImageUrl && (
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={booking.eventImageUrl}
            alt={booking.eventTitle}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm
            ${isLive ? 'bg-emerald-500/90' : 'bg-black/50'}`}
          >
            {isLive && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
            {labelText}
          </span>
        </div>
      )}

      <div className={`p-5 ${!booking.eventImageUrl ? `border-l-4 ${accent}` : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/events/${booking.eventId}`}
            className="text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors leading-snug"
          >
            {booking.eventTitle}
          </Link>
          {!booking.eventImageUrl && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold
              ${isLive
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
              }`}
            >
              {isLive && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />}
              {labelText}
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            {formatDate(booking.eventStartDate, 'EEE, MMM d yyyy · h:mm a')}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            {booking.eventLocation}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {booking.eventPrice === 0 ? 'Free' : formatCurrency(booking.eventPrice)}
            </span>
            {booking.pointsEarned > 0 && booking.status !== 'Cancelled' && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <Star className="h-2.5 w-2.5" />
                +{booking.pointsEarned} pts
              </span>
            )}
          </div>
          {booking.isCheckedIn && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Checked in
            </span>
          )}
        </div>

        {/* 7-day cancellation warning */}
        {nearCancelDeadline && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Cancellations close in {Math.ceil(hoursUntil)}h — cancel by {formatDate(
                new Date(new Date(booking.eventStartDate).getTime() - 7 * 24 * 3600 * 1000).toISOString(),
                'MMM d'
              )}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 dark:border-stone-800 pt-4">
          {canCancel && (
            <>
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={() => onQr(booking)}>
                <QrCode className="h-3.5 w-3.5" />
                QR Ticket
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={() =>
                  bookingsApi.downloadIcs(booking.id).then((blob) =>
                    downloadBlob(blob, `event-${booking.eventId}.ics`)
                  )
                }
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Add to Calendar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                onClick={() => onCancel(booking)}
              >
                Cancel
              </Button>
            </>
          )}
          {(isPast || booking.status === 'Cancelled') && (
            <Link
              to={`/events/${booking.eventId}`}
              className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
            >
              {booking.status === 'Cancelled' ? 'View Event' : 'View & Review'}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab, hasSearch }: { tab: TabKey; hasSearch: boolean }) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 py-16 text-center">
        <div className="mb-3 rounded-full bg-stone-100 dark:bg-stone-800 p-4">
          <Search className="h-6 w-6 text-stone-400" />
        </div>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No events match your search.</p>
      </div>
    )
  }

  const msgs: Record<TabKey, string> = {
    upcoming:  'No upcoming bookings.',
    past:      'No past events yet.',
    cancelled: 'No cancelled bookings.',
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 py-16 text-center">
      <div className="mb-3 rounded-full bg-stone-100 dark:bg-stone-800 p-4">
        <Ticket className="h-6 w-6 text-stone-400" />
      </div>
      <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{msgs[tab]}</p>
      {tab === 'upcoming' && (
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link to="/">Browse Events</Link>
        </Button>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function MyBookingsPage() {
  const { data: bookings = [], isPending } = useMineBookings()
  const cancel = useCancelBooking()
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')
  const [qrBooking, setQrBooking] = useState<Booking | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const ticketRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    const content = ticketRef.current
    if (!content) return
    const win = window.open('', '_blank', 'width=480,height=700')
    if (!win) return
    win.document.write(`
      <html><head><title>Event Ticket</title>
      <style>
        body { font-family: sans-serif; padding: 24px; color: #111; }
        .logo { font-size: 18px; font-weight: 800; color: #d97706; margin-bottom: 16px; }
        .title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .meta { font-size: 13px; color: #555; margin: 2px 0; }
        .divider { border: none; border-top: 1px dashed #ccc; margin: 16px 0; }
        .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: .05em; }
        .value { font-size: 14px; font-weight: 600; margin-top: 2px; }
        .qr { text-align: center; margin: 20px 0; }
        .token { font-family: monospace; font-size: 10px; color: #888; word-break: break-all; text-align: center; }
        .footer { font-size: 11px; color: #aaa; text-align: center; margin-top: 24px; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const now = Date.now()
  const confirmed = bookings.filter((b) => b.status === 'Confirmed')

  // Sorted lists: upcoming soonest-first, past most-recent-first
  const upcoming = confirmed
    .filter((b) => new Date(b.eventEndDate).getTime() >= now)
    .sort((a, b) => new Date(a.eventStartDate).getTime() - new Date(b.eventStartDate).getTime())
  const past = confirmed
    .filter((b) => new Date(b.eventEndDate).getTime() < now)
    .sort((a, b) => new Date(b.eventStartDate).getTime() - new Date(a.eventStartDate).getTime())
  const cancelled = bookings
    .filter((b) => b.status === 'Cancelled')
    .sort((a, b) => new Date(b.eventStartDate).getTime() - new Date(a.eventStartDate).getTime())

  const tabLists: Record<TabKey, Booking[]> = { upcoming, past, cancelled }

  // Total loyalty points earned across all confirmed bookings
  const totalPoints = confirmed.reduce((sum, b) => sum + b.pointsEarned, 0)

  // Apply search filter
  const q = searchQuery.trim().toLowerCase()
  const displayed = q
    ? tabLists[activeTab].filter((b) => b.eventTitle.toLowerCase().includes(q))
    : tabLists[activeTab]

  // Next upcoming event (for countdown banner — skip "Happening Now" events)
  const nextFuture = upcoming.find(
    (b) => new Date(b.eventStartDate).getTime() > now,
  )

  if (isPending) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">

      {/* ── Header ── */}
      <div className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">My Tickets</h1>
          <p className="mt-1 text-xs text-stone-400 sm:text-sm">All your event tickets in one place</p>

          {/* ── 4 KPI cards ── */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Upcoming',  value: upcoming.length,  icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30'     },
              { label: 'Attended',  value: past.length,      icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30'  },
              { label: 'Cancelled', value: cancelled.length, icon: XCircle,      color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-950/30'        },
              { label: 'Pts Earned',value: totalPoints.toLocaleString(), icon: Star, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`rounded-2xl ${bg} border border-stone-100 dark:border-stone-800 p-4`}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</span>
                </div>
                <p className="mt-1.5 text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6">

        {/* ── Countdown banner ── */}
        {nextFuture && <NextEventBanner booking={nextFuture} />}

        {/* ── Search bar ── */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search events…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-stone-900 rounded-xl border-stone-200 dark:border-stone-700 text-sm"
          />
        </div>

        {/* ── Tabs ── */}
        <div className="mb-5 flex gap-1 rounded-xl bg-stone-100 dark:bg-stone-800/60 p-1">
          {TABS.map(({ key, label, icon: Icon }) => {
            const count = tabLists[key].length
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setSearchQuery('') }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTab === key
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    activeTab === key
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Card list ── */}
        <div className="space-y-3">
          {displayed.length === 0 ? (
            <EmptyState tab={activeTab} hasSearch={q.length > 0} />
          ) : (
            displayed.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                isPast={activeTab === 'past'}
                onQr={setQrBooking}
                onCancel={setCancelTarget}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Ticket / QR modal ── */}
      <Dialog open={!!qrBooking} onOpenChange={() => setQrBooking(null)}>
        <DialogContent className="max-w-sm p-0">
          <DialogHeader className="px-6 pt-5">
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-amber-500" />
              Your Ticket
            </DialogTitle>
          </DialogHeader>

          <div ref={ticketRef} className="px-6 pb-2">
            <p className="logo mb-3 text-lg font-extrabold text-amber-600">EventHub</p>
            <p className="title text-base font-bold leading-snug">{qrBooking?.eventTitle}</p>
            <div className="mt-2 space-y-1">
              <p className="meta flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {qrBooking && formatDate(qrBooking.eventStartDate, 'EEE, MMM d yyyy · h:mm a')}
              </p>
              <p className="meta flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {qrBooking?.eventLocation}
              </p>
            </div>

            <Separator className="divider my-4 border-dashed" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="label text-[10px] uppercase tracking-wide text-muted-foreground">Booking ID</p>
                <p className="value font-semibold">#{qrBooking?.id}</p>
              </div>
              <div>
                <p className="label text-[10px] uppercase tracking-wide text-muted-foreground">Amount Paid</p>
                <p className="value font-semibold">
                  {qrBooking
                    ? qrBooking.eventPrice === 0
                      ? 'Free'
                      : formatCurrency(qrBooking.eventPrice)
                    : ''}
                </p>
              </div>
              {(qrBooking?.pointsEarned ?? 0) > 0 && (
                <div>
                  <p className="label text-[10px] uppercase tracking-wide text-muted-foreground">Points Earned</p>
                  <p className="value font-semibold text-amber-600">+{qrBooking?.pointsEarned}</p>
                </div>
              )}
              {qrBooking?.isCheckedIn && (
                <div>
                  <p className="label text-[10px] uppercase tracking-wide text-muted-foreground">Checked In</p>
                  <p className="value font-semibold text-emerald-600">Yes</p>
                </div>
              )}
            </div>

            <Separator className="divider my-4 border-dashed" />

            <div className="qr flex flex-col items-center gap-3">
              <QRCodeSVG value={qrBooking?.checkInToken ?? ''} size={180} />
              <p className="token break-all text-center font-mono text-[10px] text-muted-foreground">
                {qrBooking?.checkInToken}
              </p>
            </div>

            <p className="footer mt-4 text-center text-[10px] text-muted-foreground">
              Present this QR code at the door for check-in.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button size="sm" onClick={() => setQrBooking(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={() => setCancelTarget(null)}
        title="Cancel Booking"
        description="Are you sure? Cancellations within 7 days of the event are not allowed."
        confirmLabel="Cancel Booking"
        onConfirm={() => {
          if (cancelTarget) {
            cancel.mutate(cancelTarget.id, {
              onSettled: () => setCancelTarget(null),
            })
          }
        }}
        loading={cancel.isPending}
      />
    </div>
  )
}
