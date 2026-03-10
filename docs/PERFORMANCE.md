# Performance Report

## Baseline Metrics (PageSpeed Insights / Lighthouse — Mobile, Cold Load)

| Metric | Score | Threshold (Good) | Status |
|--------|-------|-----------------|--------|
| **First Contentful Paint (FCP)** | 4.6 s | ≤ 1.8 s | 🔴 Poor |
| **Largest Contentful Paint (LCP)** | 9.5 s | ≤ 2.5 s | 🔴 Poor |
| **Total Blocking Time (TBT)** | 0 ms | ≤ 200 ms | 🟢 Good |
| **Cumulative Layout Shift (CLS)** | 0.045 | ≤ 0.1 | 🟢 Good |
| **Speed Index** | 4.7 s | ≤ 3.4 s | 🔴 Poor |

**Measurement context:** Production build served from S3/CloudFront, tested on simulated mobile (Moto G Power, 4× CPU slowdown, Fast 3G). FCP and LCP are the primary concerns.

---

## Root Cause Analysis

### Why FCP is 4.6 s

This is a **Client-Side Rendered (CSR) SPA**. Before the browser can paint a single pixel of content it must complete this sequential waterfall:

```
1. Download HTML (tiny — just a shell div)
2. Parse HTML → discover index.css and main.[hash].js
3. Download + parse index.css
   └── @import url('fonts.googleapis.com/...')  ← render-blocking extra round-trip
4. Download + execute main.[hash].js             ← entire app in one chunk
5. React boots, Amplify initialises
6. App.tsx runs fetchAuthSession() (Cognito network call)
7. React renders skeleton / loading state         ← FCP happens here
```

Step 3 adds a **render-blocking external CSS import** (Google Fonts `@import` inside `index.css`). The browser cannot build the CSSOM — and therefore cannot paint anything — until the fonts stylesheet resolves. This alone adds 200–600 ms on a cold connection.

Step 4 loads the entire application bundle in a single file because **no code splitting is configured** in `vite.config.ts` and all pages are statically `import`-ed in `routes/index.tsx`.

### Why LCP is 9.5 s

The LCP element is the **hero background image** on the home page (`featuredEvent.imageUrl` from S3). Its discovery chain is extremely deep:

```
HTML → JS bundle → React renders → useQuery fires → GET /api/events
     → API responds → React re-renders → <img src={url}> inserted into DOM
     → Browser fetches image from S3
     → Image decodes + paints                          ← LCP
```

Every step is sequential. The image URL is **unknown at HTML parse time**, so the browser cannot begin fetching it early. Even with `fetchPriority="high"` (added in the semantic HTML fixes), the image request cannot start until several seconds of JS execution and an API round-trip have already elapsed.

### Why TBT is 0 ms

TBT is excellent because the JS bundle, while large, does not contain any **synchronous long tasks** (>50 ms). Framer Motion, React Query, and Zustand all execute quickly. The Cognito session check is fully async and does not block the main thread.

### Why CLS is 0.045

Below the 0.1 threshold and therefore passing, but not perfect. Sources of minor shift:
- The hero image has no explicit `width`/`height` (fixed in the semantic HTML update — adds `width={1280} height={720}`).
- The notification bell badge appears asynchronously after auth hydration.
- The sticky category pill bar shifts the layout below it when it changes from `relative` to `sticky`.

---

## Identified Issues and Fixes

### Issue 1 — Render-blocking Google Fonts import 🔴 High Impact

**File:** [frontend/src/index.css](../frontend/src/index.css) line 1

```css
/* CURRENT — render-blocking @import */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:...');
```

**The problem:** A CSS `@import` is blocking — the browser cannot process the rest of the stylesheet until the remote font sheet resolves. This stalls CSSOM construction and delays FCP.

**Fix:** Move font loading to the `<head>` in [index.html](../frontend/index.html) with `preconnect` + `<link>` (non-blocking):

```html
<!-- In <head>, before any stylesheet -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
/>
```

Remove the `@import` line from `index.css`.

**Expected improvement:** FCP −200 to −500 ms.

---

### Issue 2 — No code splitting (all pages in one bundle) 🔴 High Impact

**File:** [frontend/src/routes/index.tsx](../frontend/src/routes/index.tsx)

All 20 pages are statically imported:

```tsx
import { AdminPage }          from '@/pages/AdminPage'
import { EventInsightsPage }  from '@/pages/EventInsightsPage'
import { CheckInScannerPage } from '@/pages/CheckInScannerPage'
// ... 17 more
```

Every user downloads `AdminPage`, `CheckInScannerPage`, `EventInsightsPage`, etc. on the first visit to the home page, even though they will never visit those pages in that session.

**Fix:** Convert low-traffic pages to `React.lazy()`. High-traffic pages (`HomePage`, `EventDetailPage`, `LoginPage`) stay eagerly loaded:

```tsx
import { lazy, Suspense } from 'react'
import { LoadingSpinner }   from '@/components/LoadingSpinner'

// Keep eager (hot path)
import { HomePage }       from '@/pages/HomePage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { LoginPage }       from '@/pages/LoginPage'
import { RegisterPage }    from '@/pages/RegisterPage'

// Lazy (cold path)
const AdminPage          = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })))
const EventInsightsPage  = lazy(() => import('@/pages/EventInsightsPage').then(m => ({ default: m.EventInsightsPage })))
const CheckInScannerPage = lazy(() => import('@/pages/CheckInScannerPage').then(m => ({ default: m.CheckInScannerPage })))
const OrganizerDashboardPage = lazy(() => import('@/pages/OrganizerDashboardPage').then(m => ({ default: m.OrganizerDashboardPage })))
const StorePage          = lazy(() => import('@/pages/StorePage').then(m => ({ default: m.StorePage })))
const FavoritesPage      = lazy(() => import('@/pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })))
const ProfilePage        = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const MyBookingsPage     = lazy(() => import('@/pages/MyBookingsPage').then(m => ({ default: m.MyBookingsPage })))
const EditEventPage      = lazy(() => import('@/pages/EditEventPage').then(m => ({ default: m.EditEventPage })))
const CreateEventPage    = lazy(() => import('@/pages/CreateEventPage').then(m => ({ default: m.CreateEventPage })))
```

Wrap the router with `<Suspense fallback={<LoadingSpinner />}>` in `main.tsx` or `App.tsx`.

Vite automatically splits each dynamic `import()` into its own chunk.

**Expected improvement:** Main bundle size reduced by ~40–60%. FCP −0.5 to −1.5 s (less JS to parse and execute before first render).

---

### Issue 3 — LCP hero image discovered too late 🔴 High Impact

**File:** [frontend/src/pages/HomePage.tsx](../frontend/src/pages/HomePage.tsx)

The hero image URL comes from an API response (`/api/events`). At HTML parse time the browser has no idea this image exists, so it cannot be preloaded. The image fetch begins only after:
JS bundle executes → React Query fires → API responds → React re-renders → `<img>` is inserted.

This is a fundamental CSR constraint. The most impactful long-term solution is **Server-Side Rendering** (see Issue 5). Short-term mitigations:

**a) Reduce API response time** — if the `/api/events` call is slow (cold DB connection, no index), optimise the query. The events listing endpoint should respond in < 200 ms.

**b) Cache the featured event URL** — store the most recent featured event URL in `localStorage` and render it immediately on the next visit while the fresh API call is in flight (stale-while-revalidate pattern at the application level):

```ts
// On API success, persist the hero URL
const HERO_KEY = 'eventhub-hero-url'
const cachedUrl = localStorage.getItem(HERO_KEY)

// Render cachedUrl immediately, replace when fresh data arrives
```

**c) `fetchPriority="high"` is now set** (added in semantic HTML fixes) — ensures the image is fetched with high priority once the `<img>` element is inserted.

**Expected improvement:** With caching, returning-visitor LCP reduced by 2–4 s (image known before API round-trip). New-visitor LCP improvement requires SSR (see below).

---

### Issue 4 — AWS Amplify adds latency to every page load 🟡 Medium Impact

**File:** [frontend/src/App.tsx](../frontend/src/App.tsx)

```tsx
useEffect(() => {
  fetchAuthSession()   // ← Cognito network call on every page load
    .then(fetchAppProfile)
    ...
    .finally(setHydrated)
}, [])
```

`fetchAuthSession()` contacts Cognito to validate and potentially rotate the JWT. On a cold connection this can take 200–800 ms. While this is async (doesn't block paint), it delays the `setHydrated()` call, which causes `ProtectedRoute` to show a `<LoadingSpinner>` on auth-required pages.

The current `authStore` already persists `user` to `localStorage` and `ProtectedRoute` was updated to render immediately when a cached user exists:

```tsx
// ProtectedRoute.tsx — already correct
if (isHydrating && !user) return <LoadingSpinner />  // only blocks if no cache
```

**Remaining opportunity:** Use `staleTime` on the app profile query so that repeated navigations within the same session don't re-fetch.

---

### Issue 5 — CSR architecture ceiling 🟡 Medium Impact (architectural)

The 4.6 s FCP has a structural floor: the browser must download, parse, and execute the JS bundle before React can render anything. On slow 3G mobile this is unavoidable in a pure CSR app.

**Long-term fix: Adopt SSR or SSG via a framework migration.**

| Option | Effort | FCP gain | Notes |
|--------|--------|----------|-------|
| Vite SSR (manual) | High | ~2–3 s | Full control, complex setup |
| **Remix** | Medium | ~2–3 s | File-based routing, native data loading, replaces React Router |
| **Next.js App Router** | Medium | ~2–3 s | RSC, image optimisation built-in |
| Static pre-render (`vite-plugin-ssg`) | Low | ~1–2 s | Pre-renders shell HTML; API data still client-fetched |

For this project, **`vite-plugin-ssg`** is the lowest-effort first step: it pre-renders the shell HTML and critical CSS at build time, giving the browser something to paint immediately before JS loads.

---

### Issue 6 — Google Fonts adds a third-party dependency to the critical path 🟡 Medium Impact

Even after moving to `<link>` (Issue 1), the font is still a third-party request. Consider **self-hosting** the font:

1. Download the variable font files from [fontsource.org](https://fontsource.org/fonts/plus-jakarta-sans).
2. Place in `frontend/public/fonts/`.
3. Declare `@font-face` in `index.css` with `font-display: swap`.

Self-hosting eliminates the DNS lookup, TCP connection, and TLS handshake for `fonts.googleapis.com` and `fonts.gstatic.com`.

**Expected improvement:** −100 to −300 ms FCP.

---

### Issue 7 — Bundle includes heavy libraries on all pages 🟡 Medium Impact

The following packages are large and only needed on specific pages. Code splitting (Issue 2) will extract them automatically once those pages are lazily imported:

| Package | Approx. size (gzip) | Used on |
|---------|---------------------|---------|
| `recharts` | ~55 KB | `EventInsightsPage` only |
| `react-markdown` + `remark-gfm` | ~35 KB | `EventDetailPage` only |
| `@aws-amplify/auth` | ~80 KB | Every page (auth layer — cannot split) |
| `framer-motion` | ~45 KB | `HomePage`, `EventCard`, `Navbar` (hot path — cannot split) |

After lazy-loading `EventInsightsPage`, Recharts will only be downloaded when a host visits their analytics page.

---

### Issue 8 — No `<link rel="preconnect">` for API origin 🟢 Low Impact

The app makes API calls to the backend origin. Adding a preconnect hint in `index.html` warms up the TCP/TLS connection before JS executes:

```html
<!-- If the backend is on a different origin in production -->
<link rel="preconnect" href="https://api.eventhub.app" />
```

Not applicable in development (same origin via Vite proxy), but relevant in production if the API is on a subdomain.

---

## Optimisation Priority Roadmap

| # | Fix | Effort | Expected FCP Δ | Expected LCP Δ |
|---|-----|--------|----------------|----------------|
| 1 | Move Google Fonts to `<link>` in `<head>` | 5 min | −0.3 to −0.5 s | −0.3 s |
| 2 | Route-level code splitting (`React.lazy`) | 1 hour | −0.5 to −1.5 s | −0.5 s |
| 3 | Self-host Plus Jakarta Sans font | 30 min | −0.1 to −0.3 s | — |
| 4 | Cache featured event URL in `localStorage` | 2 hours | — | −2 to −4 s (returning visitors) |
| 5 | Reduce API response time (DB query optimisation) | varies | — | −0.5 to −2 s |
| 6 | `vite-plugin-ssg` static pre-render | 1–2 days | −1 to −2 s | −0.5 s |
| 7 | Full SSR (Remix / Next.js) | weeks | −2 to −3 s | −4 to −6 s |

**Recommended immediate actions (< 2 hours total):** Issues 1, 2, and 3. These require no architectural changes and are entirely frontend fixes.

---

## What Is Already Good

- **TBT = 0 ms** — No long tasks. JS execution is well-structured and async. No synchronous blocking in the critical path.
- **CLS = 0.045** — Below the 0.1 threshold. Skeleton loaders (`EventCardSkeleton`, hero loading state) prevent major layout shifts. The hero image now has explicit `width`/`height` (recent fix) which will further improve this score.
- **Infinite scroll** — `IntersectionObserver` with `rootMargin: '200px'` preloads next pages before the user reaches the bottom, preventing janky pagination loads.
- **React Query caching** — Server state is cached in memory; navigating back to a page shows instant cached data while a background refetch runs silently.
- **Zustand `persist` middleware** — Auth state survives page refresh. `ProtectedRoute` shows content immediately from cache rather than waiting for the Cognito round-trip.
- **Framer Motion `transform`-only animations** — All hover and entrance animations use `transform` and `opacity`, which are compositor-only (no reflow/repaint).
- **`fetchPriority="high"` on hero image** — Ensures the LCP image is fetched with the highest browser priority once the `<img>` element is inserted (recent fix).

---

## Measuring After Each Fix

Run Lighthouse in an **incognito window** against the production build (`vite build && vite preview`) to eliminate extension interference and ensure you test the optimised bundle, not the dev server.

```bash
# Build and preview locally
cd frontend
pnpm build
pnpm preview

# Then open Chrome → DevTools → Lighthouse → Mobile → Performance
```

For real-user monitoring, add the `web-vitals` library and report to your analytics endpoint:

```ts
import { onFCP, onLCP, onCLS, onINP, onTTFB } from 'web-vitals'

function report(metric) {
  navigator.sendBeacon('/api/analytics/vitals', JSON.stringify({
    name: metric.name, value: metric.value, url: location.href,
  }))
}

onFCP(report); onLCP(report); onCLS(report); onINP(report); onTTFB(report)
```
