import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  MapPin,
  ChevronRight,
  Navigation,
  Loader2,
  Music,
  Trophy,
  Utensils,
  Palette,
  Cpu,
  Users,
  Mic2,
  Dumbbell,
  Ticket,
  Info,
  Calendar,
  Tag,
} from 'lucide-react'
import { useInfiniteEvents, eventsApi } from '@/api/events'
import { EventCard } from '@/components/EventCard'
import { EventFilters } from '@/components/EventFilters'
import { useUserLocation } from '@/hooks/useUserLocation'
import type { EventFilters as Filters } from '@/types'

// Category quick-filters for the hero pill row.
// Each filter maps to actual DB IDs:
//   Categories: Conference(1) Workshop(2) Concert(3) Sports(4) Networking(5) Other(6)
//   Tags: Music(1) Technology(2) Business(3) Arts(4) Food&Drink(5) Health&Wellness(6)
const CATEGORIES: { label: string; icon: React.ElementType; filter: Partial<Filters> }[] = [
  { label: 'Music',      icon: Music,    filter: { tagIds: [1] } },
  { label: 'Sports',     icon: Trophy,   filter: { categoryId: 4 } },
  { label: 'Food',       icon: Utensils, filter: { tagIds: [5] } },
  { label: 'Arts',       icon: Palette,  filter: { tagIds: [4] } },
  { label: 'Tech',       icon: Cpu,      filter: { tagIds: [2] } },
  { label: 'Networking', icon: Users,    filter: { categoryId: 5 } },
  { label: 'Concerts',   icon: Mic2,     filter: { categoryId: 3 } },
  { label: 'Fitness',    icon: Dumbbell, filter: { tagIds: [6] } },
]

function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
      <div className="h-48 w-full animate-shimmer bg-gradient-to-r from-muted via-secondary to-muted bg-[length:200%_100%]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-full animate-shimmer bg-gradient-to-r from-muted via-secondary to-muted bg-[length:200%_100%]" />
        <div className="h-3 w-1/2 rounded-full animate-shimmer bg-gradient-to-r from-muted via-secondary to-muted bg-[length:200%_100%]" />
        <div className="h-3 w-2/3 rounded-full animate-shimmer bg-gradient-to-r from-muted via-secondary to-muted bg-[length:200%_100%]" />
        <div className="h-5 w-1/4 rounded-full animate-shimmer bg-gradient-to-r from-muted via-secondary to-muted bg-[length:200%_100%]" />
      </div>
    </div>
  )
}

export function HomePage() {
  const [filters, setFilters] = useState<Filters>({})
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const allEventsRef = useRef<HTMLElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const { city, loading: locationLoading, source } = useUserLocation()

  // Parallax for hero text
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, 80])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  // Featured hero event — first upcoming published event that has a real image
  const { data: featuredData } = useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => eventsApi.list({ sortBy: 'popularity' }),
  })
  const featuredEvent = featuredData?.find((e) => e.imageUrl) ?? featuredData?.[0] ?? null

  // Nearby events
  const { data: nearbyEvents = [], isPending: nearbyPending } = useQuery({
    queryKey: ['events', 'nearby', city],
    queryFn: () => eventsApi.list({ location: city! }),
    enabled: city !== null,
  })

  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteEvents(filters)

  const events = data?.pages.flatMap((p) => p.items) ?? []
  const totalCount = data?.pages[0]?.totalCount ?? 0

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function scrollToAll() {
    allEventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function seeAllNearby() {
    if (city) setFilters((f) => ({ ...f, location: city }))
    scrollToAll()
  }

  // Sync activeCategory with filters: clear pill highlight when EventFilters
  // removes the relevant categoryId / tagIds (e.g. via "Clear all")
  useEffect(() => {
    if (!filters.categoryId && !filters.tagIds?.length) {
      setActiveCategory(null)
    }
  }, [filters.categoryId, filters.tagIds])

  function handleCategoryClick(label: string, filter: Partial<Filters>) {
    if (activeCategory === label) {
      // Deselect: strip the category/tag filter the pill added
      setActiveCategory(null)
      setFilters((f) => {
        const { categoryId: _c, tagIds: _t, ...rest } = f
        return rest
      })
    } else {
      setActiveCategory(label)
      setFilters((f) => {
        // Remove any previously active pill filter before applying the new one
        const { categoryId: _c, tagIds: _t, ...rest } = f
        return { ...rest, ...filter }
      })
      scrollToAll()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-stone-950 min-h-[76vh]"
      >
        {/* Real event image */}
        {featuredEvent?.imageUrl ? (
          <img
            src={featuredEvent.imageUrl}
            alt={featuredEvent.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          /* Fallback warm gradient while loading */
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400" />
        )}

        {/* Left-to-right dark gradient — keeps text legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/10" />
        {/* Top vignette — blends navbar */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        {/* Bottom fade — transitions into the section below */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

        {/* Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, minHeight: '76vh', paddingTop: '8rem', paddingBottom: '6rem' }}
          className="relative z-10 container mx-auto max-w-7xl px-6 flex flex-col justify-center"
        >
          {featuredEvent ? (
            <motion.div
              key={featuredEvent.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="max-w-xl"
            >
              {/* Category badge */}
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-sm bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
                <Tag className="h-3 w-3" />
                {featuredEvent.categoryName}
              </span>

              {/* Title */}
              <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl line-clamp-2">
                {featuredEvent.title}
              </h1>

              {/* Metadata row */}
              <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  {format(new Date(featuredEvent.startDate), 'MMM d, yyyy')}
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  {featuredEvent.location.split(',')[0]}
                </span>
                <span className="text-white/30">•</span>
                <span className="font-semibold text-amber-400">
                  {featuredEvent.price > 0 ? `$${featuredEvent.price}` : 'Free'}
                </span>
              </div>

              {/* Description */}
              <p className="mb-8 max-w-md text-sm leading-relaxed text-white/60 line-clamp-2">
                {featuredEvent.description}
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-3">
                <Link
                  to={`/events/${featuredEvent.id}`}
                  className="flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-400 hover:scale-105 active:scale-100"
                >
                  <Ticket className="h-4 w-4" />
                  Book Now
                </Link>
                <Link
                  to={`/events/${featuredEvent.id}`}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <Info className="h-4 w-4" />
                  More Info
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Loading skeleton */
            <div className="max-w-xl space-y-4">
              <div className="h-5 w-24 rounded-sm bg-white/10 animate-pulse" />
              <div className="h-14 w-96 max-w-full rounded bg-white/10 animate-pulse" />
              <div className="h-4 w-64 rounded bg-white/10 animate-pulse" />
              <div className="h-10 w-80 max-w-full rounded bg-white/10 animate-pulse" />
              <div className="flex gap-3">
                <div className="h-12 w-32 rounded-full bg-white/10 animate-pulse" />
                <div className="h-12 w-32 rounded-full bg-white/10 animate-pulse" />
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ── Category pills + location ───────────────────────────────────── */}
      <section className="sticky top-14 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-3 overflow-x-auto py-3 scrollbar-hide">
            {/* Location chip */}
            {!locationLoading && (
              <span
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  source === 'gps'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'text-muted-foreground'
                }`}
              >
                {source === 'gps' ? (
                  <Navigation className="h-3 w-3" />
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                {city}
              </span>
            )}
            {!locationLoading && <span className="h-4 w-px shrink-0 bg-border" />}

            {/* Category pills */}
            {CATEGORIES.map(({ label, icon: Icon, filter }) => (
              <button
                key={label}
                onClick={() => handleCategoryClick(label, filter)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === label
                    ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/30'
                    : 'border border-border text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nearby Events ──────────────────────────────────────────────── */}
      {!locationLoading && (
        <section className="border-b border-border bg-muted/40 py-8 sm:py-10">
          <div className="container mx-auto max-w-7xl px-4">
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-amber-500" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  <h2 className="text-base font-bold text-foreground">
                    Events near {city}
                  </h2>
                  {source === 'default' && (
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      — enable location for local results
                    </span>
                  )}
                </div>
              </div>
              {nearbyEvents.length > 0 && (
                <button
                  onClick={seeAllNearby}
                  className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  See all <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Cards */}
            {nearbyPending ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
              </div>
            ) : nearbyEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming events found near {city}.
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
                {nearbyEvents.slice(0, 8).map((event) => (
                  <div key={event.id} className="w-64 shrink-0 sm:w-auto">
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── All Events ─────────────────────────────────────────────────── */}
      <section ref={allEventsRef} className="container mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="mb-5 flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-amber-500" />
          <h2 className="text-base font-bold text-foreground">All Events</h2>
        </div>

        <div className="mb-4">
          <EventFilters filters={filters} onChange={setFilters} />
        </div>

        {!isPending && (
          <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
            {totalCount === 0
              ? 'No events found.'
              : `${totalCount} event${totalCount !== 1 ? 's' : ''} found`}
          </p>
        )}

        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="py-16 text-center text-muted-foreground">
            Failed to load events. Please try again.
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-amber-50 p-6 dark:bg-amber-950/30">
              <svg
                className="h-8 w-8 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-base font-bold text-foreground">
              No events found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="mt-6" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
