import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  Ban,
  Clock,
  Globe,
  Lock,
  CheckCircle,
  Pin,
  Car,
  Bus,
  Bike,
  Footprints,
  Link2,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Megaphone,
  Star,
  Share2,
  CalendarPlus,
  Timer,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  useEvent,
  usePublishEvent,
  useCancelEvent,
  usePostponeEvent,
  useDeleteEvent,
  useAnnouncements,
  usePostAnnouncement,
  useGenerateInviteCode,
  useRevokeInviteCode,
  useRelatedEvents,
} from '@/api/events'
import { useMineBookings, useCreateBooking, useCancelBooking, bookingsApi } from '@/api/bookings'
import {
  useReviews,
  useCreateReview,
  useDeleteReview,
  usePinReview,
  useReplyToReview,
  useVoteReview,
} from '@/api/reviews'
import {
  useFollowHost,
  useUnfollowHost,
  useSubscriptions,
} from '@/api/subscriptions'
import { useAuthStore } from '@/stores/authStore'
import {
  formatDateRange,
  formatCurrency,
  formatRelative,
  getInitials,
} from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { StarRating } from '@/components/StarRating'
import { EventCard } from '@/components/EventCard'

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
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds}s`
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const eventId = parseInt(id ?? '0')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteCodeParam = searchParams.get('code') ?? undefined
  const { user, isAdmin } = useAuthStore()

  const { data: event, isPending, error } = useEvent(eventId, inviteCodeParam)
  const { data: announcements = [] } = useAnnouncements(eventId)
  const { data: reviews = [] } = useReviews(eventId)
  const { data: myBookings = [] } = useMineBookings()
  const { data: subscriptions = [] } = useSubscriptions()

  const isOwner = user?.userId === event?.createdById
  const canManage = isOwner || isAdmin()

  const myBooking = myBookings.find(
    (b) => b.eventId === eventId && b.status === 'Confirmed'
  )
  const isFollowing = subscriptions.some((s) => s.hostId === event?.createdById)

  const createBooking = useCreateBooking()
  const cancelBooking = useCancelBooking()
  const publishEvent = usePublishEvent()
  const cancelEvent = useCancelEvent()
  const deleteEvent = useDeleteEvent()
  const postponeEvent = usePostponeEvent(eventId)
  const postAnnouncement = usePostAnnouncement(eventId)
  const createReview = useCreateReview(eventId)
  const deleteReview = useDeleteReview(eventId)
  const pinReview = usePinReview(eventId)
  const replyToReview = useReplyToReview(eventId)
  const voteReview = useVoteReview(eventId)
  const follow = useFollowHost()
  const unfollow = useUnfollowHost()
  const generateInviteCode = useGenerateInviteCode(eventId)
  const revokeInviteCode = useRevokeInviteCode(eventId)
  const { data: relatedEvents = [] } = useRelatedEvents(event?.categoryId, eventId)

  const [cancelBookingConfirm, setCancelBookingConfirm] = useState(false)
  const [cancelEventConfirm, setCancelEventConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [postponeOpen, setPostponeOpen] = useState(false)
  const [replyTarget, setReplyTarget] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  const announcementForm = useForm<{ title: string; message: string }>({
    resolver: zodResolver(
      z.object({ title: z.string().min(1), message: z.string().min(1) })
    ),
  })

  const reviewForm = useForm({
    resolver: zodResolver(
      z.object({
        rating: z.coerce.number().min(1).max(5),
        comment: z.string().min(5, 'Comment must be at least 5 characters'),
      })
    ),
    defaultValues: { rating: 5, comment: '' },
  })

  const postponeForm = useForm({
    resolver: zodResolver(
      z.object({
        newStartDate: z.string().min(1),
        newEndDate: z.string().min(1),
      })
    ),
  })

  // Must be called before any conditional returns (Rules of Hooks)
  const countdown = useCountdown(event?.startDate)

  if (isPending) return <LoadingSpinner />
  if (error || !event) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Event not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
          Go back
        </Button>
      </div>
    )
  }

  const spotsLeft = event.capacity - event.bookingCount
  const capacityPct = Math.min((event.bookingCount / event.capacity) * 100, 100)
  const isUpcoming =
    event.displayStatus === 'Published' ||
    event.displayStatus === 'Live' ||
    event.displayStatus === 'Postponed'
  const isHappeningNow =
    Date.now() >= new Date(event.startDate).getTime() &&
    Date.now() <= new Date(event.endDate).getTime()
  const isBookable =
    (event.displayStatus === 'Published' || event.displayStatus === 'Live') &&
    !myBooking &&
    !!user
  const canReview =
    !!myBooking &&
    event.displayStatus === 'Completed' &&
    !reviews.find((r) => r.userId === user?.userId)

  // Rating summary computed from reviews
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  // ── Booking panel (shared between sidebar and mobile) ──────────────
  function BookingPanel() {
    if (!event) return null
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {/* Price */}
        <div className="mb-4">
          <span className="text-3xl font-bold text-foreground">
            {event.price > 0 ? formatCurrency(event.price) : 'Free'}
          </span>
          {event.price > 0 && (
            <span className="ml-1.5 text-sm text-muted-foreground">per person</span>
          )}
        </div>

        {/* Capacity progress */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{event.bookingCount} attending</span>
            <span>{event.capacity} capacity</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                capacityPct >= 90
                  ? 'bg-red-500'
                  : capacityPct >= 70
                    ? 'bg-orange-400'
                    : 'bg-amber-500'
              }`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
          {spotsLeft <= 20 && spotsLeft > 0 && event.displayStatus !== 'Cancelled' && (
            <div className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${spotsLeft <= 10 ? 'text-red-600' : 'text-orange-600'}`}>
              {spotsLeft <= 10 && <Flame className="h-3.5 w-3.5" />}
              Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
            </div>
          )}
        </div>

        {/* Countdown timer */}
        {isUpcoming && (
          <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            isHappeningNow
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
          }`}>
            <Timer className="h-4 w-4 shrink-0" />
            {isHappeningNow ? (
              <span className="font-medium">Happening Now</span>
            ) : countdown ? (
              <span>Starts in <span className="font-semibold">{countdown}</span></span>
            ) : (
              <span className="font-medium">Starting soon</span>
            )}
          </div>
        )}

        {/* CTA */}
        {!canManage && (
          <>
            {!user ? (
              <Button className="w-full" onClick={() => navigate('/login')}>
                Sign in to Book
              </Button>
            ) : myBooking ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  You&apos;re booked!
                  {myBooking.isCheckedIn && ' · Checked in'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={async () => {
                    try {
                      const blob = await bookingsApi.downloadIcs(myBooking.id)
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${event.title.replace(/\s+/g, '-')}.ics`
                      a.click()
                      URL.revokeObjectURL(url)
                    } catch {
                      toast.error('Failed to download calendar file.')
                    }
                  }}
                >
                  <CalendarPlus className="mr-1.5 h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => setCancelBookingConfirm(true)}
                >
                  Cancel Booking
                </Button>
              </div>
            ) : event.displayStatus === 'SoldOut' ? (
              <Button disabled variant="outline" className="w-full">
                Sold Out
              </Button>
            ) : event.displayStatus === 'Cancelled' ? (
              <Button disabled variant="outline" className="w-full">
                Event Cancelled
              </Button>
            ) : isBookable ? (
              <Button
                className="w-full"
                onClick={() => createBooking.mutate(eventId)}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending
                  ? 'Booking…'
                  : `Book Now${event.price > 0 ? ` · ${formatCurrency(event.price)}` : ' · Free'}`}
              </Button>
            ) : null}
          </>
        )}

        {canManage && (
          <p className="text-center text-xs text-muted-foreground">
            You are managing this event
          </p>
        )}

        {/* Social share */}
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Share this event</p>
          <div className="flex items-center gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-sky-400 hover:text-sky-600"
            >
              <Share2 className="h-3.5 w-3.5" />
              X / Twitter
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied!')
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-amber-400 hover:text-amber-600"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy link
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Organizer card ─────────────────────────────────────────────────
  function OrganizerCard() {
    if (!event) return null
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Organizer
        </p>
        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/organizers/${event.createdById}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-amber-100 text-sm font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                {getInitials(event.createdByName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{event.createdByName}</p>
              <p className="text-xs text-muted-foreground">View profile →</p>
            </div>
          </Link>
          {user && user?.userId !== event.createdById && (
            <Button
              size="sm"
              variant={isFollowing ? 'outline' : 'default'}
              onClick={() =>
                isFollowing
                  ? unfollow.mutate(event.createdById)
                  : follow.mutate(event.createdById)
              }
              disabled={follow.isPending || unfollow.isPending}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // ── Invite link card ───────────────────────────────────────────────
  function InviteLinkCard() {
    if (!event || !isOwner || event.isPublic) return null
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
          <Link2 className="h-4 w-4" />
          Private Event — Invite Link
        </div>
        {event.inviteCode ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-white px-2 py-1 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {`${window.location.origin}/events/${event.id}?code=${event.inviteCode}`}
              </code>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/events/${event.id}?code=${event.inviteCode}`
                  )
                  toast.success('Invite link copied!')
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                title="Generate a new link (invalidates the current one)"
                onClick={() => generateInviteCode.mutate()}
                disabled={generateInviteCode.isPending}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-red-600 hover:text-red-700"
                onClick={() => revokeInviteCode.mutate()}
                disabled={revokeInviteCode.isPending}
              >
                Revoke
              </Button>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Anyone with this link can view and book this event.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              No invite link yet. Generate one to share this private event.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateInviteCode.mutate()}
              disabled={generateInviteCode.isPending}
            >
              Generate Invite Link
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden bg-stone-950">
        {/* Background image or gradient fallback */}
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950" />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Manage dropdown */}
        {canManage && (
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 hover:text-white"
                >
                  Manage Event
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {event.displayStatus === 'Draft' && (
                  <DropdownMenuItem onClick={() => publishEvent.mutate(eventId)}>
                    <Globe className="mr-2 h-4 w-4" /> Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate(`/events/${eventId}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                {event.displayStatus !== 'Cancelled' && (
                  <DropdownMenuItem onClick={() => setPostponeOpen(true)}>
                    <Clock className="mr-2 h-4 w-4" /> Postpone
                  </DropdownMenuItem>
                )}
                {event.displayStatus !== 'Cancelled' && (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => setCancelEventConfirm(true)}
                  >
                    <Ban className="mr-2 h-4 w-4" /> Cancel Event
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setDeleteConfirm(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Hero content — pinned to bottom-left */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {/* Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="border-amber-400/60 bg-amber-500/20 text-amber-300 backdrop-blur-sm">
                {event.categoryName}
              </Badge>
              <StatusBadge status={event.displayStatus} showDot />
              {!event.isPublic && (
                <span className="flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-xs text-white/80 backdrop-blur-sm">
                  <Lock className="h-3 w-3" /> Private
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-amber-400" />
                {formatDateRange(event.startDate, event.endDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-400" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-white">
                  {formatCurrency(event.price)}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-amber-400" />
                {event.bookingCount}/{event.capacity} attending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">

          {/* ── LEFT: tabs ─────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">

            {/* Mobile-only booking block (above tabs) */}
            <div className="mb-6 space-y-4 lg:hidden">
              <BookingPanel />
              <OrganizerCard />
              <InviteLinkCard />
            </div>

            <Tabs defaultValue="about">
              <TabsList className="mb-5 w-full justify-start gap-1 rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="about" className="rounded-lg px-4 py-2 text-sm font-medium">
                  About
                </TabsTrigger>
                <TabsTrigger value="announcements" className="rounded-lg px-4 py-2 text-sm font-medium">
                  Announcements
                  {announcements.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-600">
                      {announcements.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-4 py-2 text-sm font-medium">
                  Reviews
                  {reviews.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-600">
                      {reviews.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── About ─────────────────────────────────────────── */}
              <TabsContent value="about" className="rounded-2xl border border-border bg-card p-6">
                {/* Tags */}
                {event.tags.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="prose prose-sm dark:prose-invert max-w-none
                  prose-headings:text-foreground prose-headings:font-semibold
                  prose-p:text-foreground prose-p:leading-relaxed
                  prose-strong:text-foreground prose-em:text-foreground
                  prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-muted prose-pre:text-foreground
                  prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground
                  prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-border prose-blockquote:text-muted-foreground
                  prose-hr:border-border
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.description}</ReactMarkdown>
                </div>

                {/* Location & Map */}
                <div className="mt-6 border-t border-border pt-6">
                  <h2 className="mb-4 text-lg font-bold text-foreground">Location</h2>
                  {(() => {
                    const commaIdx = event.location.indexOf(',')
                    const venueName =
                      commaIdx !== -1
                        ? event.location.slice(0, commaIdx).trim()
                        : event.location
                    const address =
                      commaIdx !== -1
                        ? event.location.slice(commaIdx + 1).trim()
                        : null
                    return (
                      <div className="mb-4">
                        <p className="font-semibold text-foreground">{venueName}</p>
                        {address && (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {address.replace(/,\s*/g, '\n')}
                          </p>
                        )}
                      </div>
                    )
                  })()}

                  <div className="mb-6 overflow-hidden rounded-xl border border-border">
                    <iframe
                      title="Event location on Google Maps"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
                      className="h-64 w-full"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="border-t border-border pt-5">
                    <h3 className="mb-4 text-sm font-bold text-foreground">Get directions</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(
                        [
                          { label: 'Driving',    mode: 'driving',   Icon: Car        },
                          { label: 'Transit',    mode: 'transit',   Icon: Bus        },
                          { label: 'Cycling',    mode: 'bicycling', Icon: Bike       },
                          { label: 'Walking',    mode: 'walking',   Icon: Footprints },
                        ] as const
                      ).map(({ label, mode, Icon }) => (
                        <a
                          key={mode}
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location)}&travelmode=${mode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-400"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── Announcements ──────────────────────────────────── */}
              <TabsContent value="announcements" className="space-y-4">
                {canManage && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-semibold">Post Announcement</h3>
                    </div>
                    <form
                      onSubmit={announcementForm.handleSubmit((d) =>
                        postAnnouncement.mutate(d, {
                          onSuccess: () => announcementForm.reset(),
                        })
                      )}
                      className="space-y-3"
                    >
                      <Input
                        placeholder="Title"
                        {...announcementForm.register('title')}
                      />
                      <Textarea
                        placeholder="Message…"
                        rows={3}
                        {...announcementForm.register('message')}
                      />
                      <Button type="submit" size="sm" disabled={postAnnouncement.isPending}>
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        Post
                      </Button>
                    </form>
                  </div>
                )}
                {announcements.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
                    <Megaphone className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No announcements yet.</p>
                  </div>
                ) : (
                  announcements.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-border bg-card p-5 pl-5 shadow-sm"
                      style={{ borderLeft: '3px solid rgb(251 191 36)' }}
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground">{a.title}</h4>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelative(a.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.message}</p>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* ── Reviews ────────────────────────────────────────── */}
              <TabsContent value="reviews" className="space-y-4">
                {/* Rating summary */}
                {reviews.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex gap-6">
                      {/* Average score */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-5xl font-bold text-foreground">
                          {avgRating.toFixed(1)}
                        </span>
                        <div className="my-1 flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(avgRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-muted text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Bar chart */}
                      <div className="flex flex-1 flex-col justify-center gap-1.5">
                        {ratingCounts.map(({ star, count }) => (
                          <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="w-3 shrink-0 text-right">{star}</span>
                            <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-amber-400 transition-all"
                                style={{
                                  width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%',
                                }}
                              />
                            </div>
                            <span className="w-4 shrink-0">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Write review form */}
                {canReview && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-3 text-sm font-semibold">Write a Review</h3>
                    <form
                      onSubmit={reviewForm.handleSubmit((d) =>
                        createReview.mutate(d, {
                          onSuccess: () => reviewForm.reset({ rating: 5, comment: '' }),
                        })
                      )}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <Label className="text-sm">Rating</Label>
                        <StarRating
                          value={reviewForm.watch('rating')}
                          onChange={(v) => reviewForm.setValue('rating', v)}
                        />
                      </div>
                      <Textarea
                        placeholder="Share your experience…"
                        rows={3}
                        {...reviewForm.register('comment')}
                      />
                      {reviewForm.formState.errors.comment && (
                        <p className="text-xs text-red-500">
                          {reviewForm.formState.errors.comment.message}
                        </p>
                      )}
                      <Button type="submit" size="sm" disabled={createReview.isPending}>
                        Submit Review
                      </Button>
                    </form>
                  </div>
                )}

                {/* Review list */}
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
                    <Star className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className={`rounded-2xl border p-5 shadow-sm transition ${
                        review.isPinned
                          ? 'border-amber-200 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20'
                          : 'border-border bg-card'
                      }`}
                    >
                      {/* Review header */}
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-muted text-xs font-semibold">
                              {getInitials(review.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{review.userName}</p>
                              {review.isPinned && (
                                <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                                  <Pin className="h-2.5 w-2.5" /> Pinned
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-muted text-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatRelative(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {canManage && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => pinReview.mutate(review.id)}
                            >
                              {review.isPinned ? 'Unpin' : 'Pin'}
                            </Button>
                          )}
                          {(user?.userId === review.userId || canManage) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                              onClick={() => deleteReview.mutate(review.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="mb-3 text-sm leading-relaxed text-foreground">{review.comment}</p>

                      {/* Vote + Reply */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <button
                          onClick={() =>
                            user && voteReview.mutate({ reviewId: review.id, isLike: true })
                          }
                          className="flex items-center gap-1.5 rounded-md px-2 py-1 transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" /> {review.likes}
                        </button>
                        <button
                          onClick={() =>
                            user && voteReview.mutate({ reviewId: review.id, isLike: false })
                          }
                          className="flex items-center gap-1.5 rounded-md px-2 py-1 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" /> {review.dislikes}
                        </button>
                        {isOwner && (
                          <button
                            onClick={() =>
                              setReplyTarget(replyTarget === review.id ? null : review.id)
                            }
                            className="rounded-md px-2 py-1 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30"
                          >
                            Reply
                          </button>
                        )}
                      </div>

                      {/* Replies */}
                      {review.replies.length > 0 && (
                        <div className="mt-3 ml-3 space-y-2 border-l-2 border-amber-200 pl-4 dark:border-amber-800">
                          {review.replies.map((reply) => (
                            <div key={reply.id}>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-foreground">
                                  {reply.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelative(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{reply.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {replyTarget === review.id && (
                        <div className="mt-3 flex gap-2">
                          <Input
                            placeholder="Write a reply…"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            disabled={!replyText.trim()}
                            onClick={() => {
                              replyToReview.mutate(
                                { reviewId: review.id, comment: replyText },
                                {
                                  onSuccess: () => {
                                    setReplyTarget(null)
                                    setReplyText('')
                                  },
                                }
                              )
                            }}
                          >
                            Send
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* ── RIGHT: sticky sidebar (desktop only) ───────────────── */}
          <div className="hidden w-72 shrink-0 lg:block xl:w-80">
            <div className="sticky top-20 space-y-4">
              <BookingPanel />
              <OrganizerCard />
              <InviteLinkCard />
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Events ─────────────────────────────────────────── */}
      {relatedEvents.length > 0 && (
        <div className="container mx-auto max-w-5xl px-4 pb-12">
          <h2 className="mb-5 text-xl font-bold text-foreground">More Events Like This</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}

      <Separator className="my-2" />

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={cancelBookingConfirm}
        onOpenChange={setCancelBookingConfirm}
        title="Cancel Booking"
        description="Are you sure you want to cancel your booking? This may not be possible within 7 days of the event."
        confirmLabel="Cancel Booking"
        onConfirm={() =>
          myBooking &&
          cancelBooking.mutate(myBooking.id, {
            onSettled: () => setCancelBookingConfirm(false),
          })
        }
        loading={cancelBooking.isPending}
      />

      <ConfirmDialog
        open={cancelEventConfirm}
        onOpenChange={setCancelEventConfirm}
        title="Cancel Event"
        description="This will cancel the event and notify all attendees. This cannot be undone."
        confirmLabel="Cancel Event"
        onConfirm={() =>
          cancelEvent.mutate(eventId, {
            onSettled: () => setCancelEventConfirm(false),
          })
        }
        loading={cancelEvent.isPending}
      />

      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="Delete Event"
        description="This will permanently delete the event and all associated data."
        confirmLabel="Delete"
        onConfirm={() =>
          deleteEvent.mutate(eventId, {
            onSuccess: () => navigate('/'),
            onSettled: () => setDeleteConfirm(false),
          })
        }
        loading={deleteEvent.isPending}
      />

      <Dialog open={postponeOpen} onOpenChange={setPostponeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Postpone Event</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={postponeForm.handleSubmit((d) =>
              postponeEvent.mutate(
                {
                  newStartDate: new Date(d.newStartDate).toISOString(),
                  newEndDate: new Date(d.newEndDate).toISOString(),
                },
                { onSuccess: () => setPostponeOpen(false) }
              )
            )}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <Label>New Start Date</Label>
              <Input type="datetime-local" {...postponeForm.register('newStartDate')} />
            </div>
            <div className="space-y-1.5">
              <Label>New End Date</Label>
              <Input type="datetime-local" {...postponeForm.register('newEndDate')} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setPostponeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={postponeEvent.isPending}>
                {postponeEvent.isPending ? 'Postponing…' : 'Confirm'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
