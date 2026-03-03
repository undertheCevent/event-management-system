import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import {
  Globe,
  X,
  Users,
  Calendar,
  ArrowLeft,
  Star,
  CalendarDays,
  MapPin,
  Instagram,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useOrganizerProfile } from '@/api/organizers'
import { reviewsApi } from '@/api/reviews'
import { useFollowHost, useUnfollowHost, useSubscriptions } from '@/api/subscriptions'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, formatRelative, getInitials } from '@/lib/utils'

// Fallback gradient palette for events without images
const EVENT_GRADIENTS = [
  'from-amber-800 to-stone-900',
  'from-blue-900 to-stone-900',
  'from-emerald-900 to-stone-900',
  'from-purple-900 to-stone-900',
  'from-rose-900 to-stone-900',
  'from-cyan-900 to-stone-900',
]

export function OrganizerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const organizerId = parseInt(id ?? '0')
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: profile, isPending, error } = useOrganizerProfile(organizerId)
  const { data: subscriptions = [] } = useSubscriptions()
  const follow = useFollowHost()
  const unfollow = useUnfollowHost()

  const isFollowing = subscriptions.some((s) => s.hostId === organizerId)
  const isSelf = user?.userId === organizerId

  // Fetch reviews for completed events (called before early returns — hooks must be unconditional)
  const completedEvents = (profile?.events ?? []).filter(
    (e) => e.displayStatus === 'Completed'
  )

  const reviewQueries = useQueries({
    queries: completedEvents.map((ev) => ({
      queryKey: ['reviews', ev.id],
      queryFn: () => reviewsApi.list(ev.id),
      enabled: !!profile,
    })),
  })

  if (isPending) return <LoadingSpinner />
  if (error || !profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">
        Organizer not found.
      </div>
    )
  }

  // Flatten reviews with event title attached, newest first
  const allReviews = reviewQueries
    .flatMap((q, i) =>
      (q.data ?? []).map((r) => ({
        ...r,
        eventTitle: completedEvents[i]?.title ?? '',
        eventId: completedEvents[i]?.id ?? 0,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : null

  const reviewsLoading = reviewQueries.some((q) => q.isPending)

  return (
    <>
      {/* ── PROFILE BANNER ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-background pb-10 pt-6 dark:from-stone-950 dark:to-background">
        {/* Decorative amber glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-500/10" />
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />

        <div className="container relative mx-auto max-w-4xl px-4">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl" />
              <Avatar className="relative h-24 w-24 ring-4 ring-amber-500/30 sm:h-28 sm:w-28">
                <AvatarFallback className="bg-amber-100 text-3xl font-bold text-amber-700 dark:bg-amber-900/60 dark:text-amber-200">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="mb-1 text-2xl font-bold text-foreground sm:text-3xl">
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-amber-500" />
                  {profile.followerCount.toLocaleString()} followers
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-amber-500" />
                  {profile.events.length} events
                </span>
                {avgRating !== null && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {avgRating.toFixed(1)} avg rating
                  </span>
                )}
                <span className="text-muted-foreground/70">
                  Member since {formatDate(profile.memberSince, 'MMMM yyyy')}
                </span>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              )}

              {/* Social links */}
              {(profile.website || profile.twitterHandle || profile.instagramHandle) && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground transition hover:border-amber-400 hover:text-amber-600"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Website
                    </a>
                  )}
                  {profile.twitterHandle && (
                    <a
                      href={`https://x.com/${profile.twitterHandle.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground transition hover:border-amber-400 hover:text-amber-600"
                    >
                      <X className="h-3.5 w-3.5" />
                      {profile.twitterHandle}
                    </a>
                  )}
                  {profile.instagramHandle && (
                    <a
                      href={`https://instagram.com/${profile.instagramHandle.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground transition hover:border-amber-400 hover:text-amber-600"
                    >
                      <Instagram className="h-3.5 w-3.5" />
                      {profile.instagramHandle}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Follow button */}
            {user && !isSelf && (
              <div className="shrink-0">
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={() =>
                    isFollowing ? unfollow.mutate(organizerId) : follow.mutate(organizerId)
                  }
                  disabled={follow.isPending || unfollow.isPending}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Tabs defaultValue="events">
          <TabsList className="mb-6 w-full justify-start gap-1 rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="events" className="rounded-lg px-4 py-2 text-sm font-medium">
              Events
              <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-600">
                {profile.events.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg px-4 py-2 text-sm font-medium">
              Reviews
              {allReviews.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-600">
                  {allReviews.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Events tab ────────────────────────────────────────── */}
          <TabsContent value="events">
            {profile.events.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card py-16 text-center">
                <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No events yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.events.map((ev, i) => (
                  <Link
                    key={ev.id}
                    to={`/events/${ev.id}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                  >
                    {/* Image or gradient banner */}
                    <div className="relative h-36 w-full overflow-hidden">
                      {ev.imageUrl ? (
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={`h-full w-full bg-gradient-to-br ${EVENT_GRADIENTS[i % EVENT_GRADIENTS.length]}`}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <StatusBadge status={ev.displayStatus} />
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="mb-2 font-semibold leading-snug text-foreground group-hover:text-amber-600 transition-colors line-clamp-2">
                        {ev.title}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-500" />
                          {formatDate(ev.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-amber-500" />
                          {ev.confirmedBookings}/{ev.capacity}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Reviews tab ───────────────────────────────────────── */}
          <TabsContent value="reviews" className="space-y-4">
            {/* Summary header */}
            {allReviews.length > 0 && avgRating !== null && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                    <div className="my-1 flex justify-center gap-0.5">
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
                    <p className="text-xs text-muted-foreground">
                      {allReviews.length} review{allReviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = allReviews.filter((r) => r.rating === star).length
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-3 text-right">{star}</span>
                          <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all"
                              style={{ width: `${(count / allReviews.length) * 100}%` }}
                            />
                          </div>
                          <span className="w-4">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {reviewsLoading && completedEvents.length > 0 && (
              <div className="py-8 text-center">
                <LoadingSpinner />
              </div>
            )}

            {/* Empty state */}
            {!reviewsLoading && allReviews.length === 0 && (
              <div className="rounded-2xl border border-border bg-card py-16 text-center">
                <Star className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {completedEvents.length === 0
                    ? 'No completed events to review yet.'
                    : 'No reviews yet.'}
                </p>
              </div>
            )}

            {/* Review cards */}
            {allReviews.map((review) => (
              <div
                key={`${review.eventId}-${review.id}`}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                {/* Event label */}
                <Link
                  to={`/events/${review.eventId}`}
                  className="mb-3 flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:underline"
                >
                  <MapPin className="h-3 w-3" />
                  {review.eventTitle}
                </Link>

                {/* Reviewer */}
                <div className="mb-3 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {getInitials(review.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.userName}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
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

                <p className="text-sm leading-relaxed text-foreground">{review.comment}</p>

                {/* Replies */}
                {review.replies.length > 0 && (
                  <div className="mt-3 ml-3 space-y-2 border-l-2 border-amber-200 pl-4 dark:border-amber-800">
                    {review.replies.map((reply) => (
                      <div key={reply.id}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">
                            {reply.userName}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-4 border-amber-200 bg-amber-50 px-1.5 text-[10px] text-amber-600 dark:bg-amber-950/30"
                          >
                            Organizer
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelative(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{reply.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
