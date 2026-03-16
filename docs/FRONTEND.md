# Frontend Architecture

A single-page application built with **Vite + React 18 + TypeScript** that consumes the .NET REST API. The frontend lives in the `frontend/` directory at the repository root.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Routing & Access Control](#routing--access-control)
5. [State Management](#state-management)
6. [Data Fetching](#data-fetching)
7. [API Layer](#api-layer)
8. [Component Architecture](#component-architecture)
9. [Styling](#styling)
10. [Key Design Decisions](#key-design-decisions)

---

## Tech Stack

| Concern | Library / Tool | Notes |
|---|---|---|
| Build tool | Vite 6 | HMR, `@/` path alias, dev proxy |
| UI framework | React 18 | Strict mode enabled |
| Language | TypeScript 5 (strict) | `noImplicitAny`, `strictNullChecks` |
| Routing | React Router DOM v6 | `createBrowserRouter` + `RouterProvider` |
| Server state | TanStack Query v5 | `useQuery` / `useMutation`, 5-min stale time |
| Client state | Zustand v5 | Auth token + user persisted to `localStorage` |
| HTTP client | Axios | Singleton instance; request/response interceptors |
| Forms | react-hook-form + Zod | `zodResolver` on every form |
| UI components | shadcn/ui | 18 Radix-based components, CSS variable theming |
| Visual effects | Aceternity UI | Spotlight, BackgroundBeams, HoverBorderGradient (inlined) |
| Charts | Recharts | Organiser dashboard BarChart; Admin PieChart + BarChart |
| QR codes | qrcode.react | `QRCodeSVG` on check-in tokens |
| QR scanning | @zxing/browser | `BrowserQRCodeReader` for live camera scanning on `CheckInScannerPage` |
| Auth (cloud) | AWS Amplify (aws-amplify) | Cognito session management; lazy-loaded off the critical path |
| Animations | framer-motion | Page animations on select pages (lazy-loaded with those chunks) |
| Date utilities | date-fns | Formatting, relative time |
| Notifications | Sonner | `toast.success` / `toast.error` |
| Dev tools | React Query Devtools | Mounted only in development (`import.meta.env.DEV` guard) |

---

## Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- The .NET backend running on `http://localhost:5266` (see main [README](../README.md))

### Install and run

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on `http://localhost:5173`. All `/api/*` requests are proxied to `http://localhost:5266` — no CORS configuration is needed.

### Build for production

```bash
npm run build      # outputs to frontend/dist/
npm run preview    # serve the production build locally on :4173
```

### Lighthouse CI (local)

```bash
npm run lhci       # build → preview → run @lhci/cli against / and /events
```

### Type-check without building

```bash
npx tsc --noEmit
```

---

## Project Structure

```
frontend/
├── index.html
├── vite.config.ts          # @/ alias + /api proxy
├── tailwind.config.js
├── components.json         # shadcn/ui configuration
└── src/
    ├── main.tsx            # ReactDOM.createRoot entry point
    ├── App.tsx             # QueryClientProvider + RouterProvider + Toaster + lazy Amplify init
    ├── index.css           # Tailwind directives + shadcn CSS variables + CSS keyframe animations
    │
    ├── types/
    │   └── index.ts        # All TypeScript interfaces mirroring API DTOs
    │
    ├── lib/
    │   ├── utils.ts        # cn(), formatDate/Time/Currency/Range, STATUS_CONFIG, getInitials
    │   ├── queryClient.ts  # Singleton QueryClient (staleTime 5min, retry 1)
    │   └── amplify.ts      # Amplify.configure() — dynamically imported, not in entry bundle
    │
    ├── stores/
    │   └── authStore.ts    # Zustand store: user, isHydrating, setUser(), logout(), isAdmin()
    │
    ├── api/                # One file per backend domain
    │   ├── axios.ts        # Axios instance + interceptors
    │   ├── auth.ts
    │   ├── events.ts
    │   ├── bookings.ts     # Includes downloadIcs (blob response)
    │   ├── reviews.ts
    │   ├── subscriptions.ts
    │   ├── organizers.ts
    │   ├── admin.ts
    │   ├── notifications.ts  # useNotifications, useUnreadCount, useMarkRead, useMarkAllRead
    │   ├── waitlist.ts       # useWaitlistPosition, useJoinWaitlist, useLeaveWaitlist
    │   ├── analytics.ts      # useEventAnalytics(eventId, enabled)
    │   └── tagsCategories.ts
    │
    ├── hooks/
    │   └── useDebounce.ts  # Generic debounce hook (default 400ms)
    │
    ├── routes/
    │   ├── index.tsx       # createBrowserRouter with all route definitions
    │   └── ProtectedRoute.tsx  # Auth + role guard wrapper
    │
    ├── layouts/
    │   ├── RootLayout.tsx  # Navbar + <Outlet /> + scroll restoration
    │   └── AuthLayout.tsx  # Dark full-screen layout for login/register
    │
    ├── components/
    │   ├── aceternity/     # Inlined Aceternity UI effects
    │   │   ├── Spotlight.tsx
    │   │   ├── BackgroundBeams.tsx
    │   │   └── HoverBorderGradient.tsx
    │   ├── ui/             # shadcn/ui generated components (do not edit directly)
    │   │   └── *.tsx
    │   ├── EventCard.tsx
    │   ├── EventFilters.tsx
    │   ├── Navbar.tsx
    │   ├── NotificationBell.tsx  # Bell icon + unread badge + dropdown (polls every 30 s); lazy-loaded
    │   ├── PageLoader.tsx        # Minimal CSS spinner used as React.lazy Suspense fallback
    │   ├── StatusBadge.tsx
    │   ├── LoadingSpinner.tsx
    │   └── ConfirmDialog.tsx
    │
    ├── features/           # Domain-specific composite components
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   └── RegisterForm.tsx
    │   ├── events/
    │   │   └── EventForm.tsx   # Shared create/edit form
    │   └── organizer/
    │       └── AttendeeTable.tsx
    │
    └── pages/              # One file per route — all lazy-loaded via React.lazy()
        ├── HomePage.tsx
        ├── LoginPage.tsx
        ├── RegisterPage.tsx
        ├── ForgotPasswordPage.tsx
        ├── ResetPasswordPage.tsx
        ├── ConfirmEmailPage.tsx
        ├── OAuthCallbackPage.tsx      # Handles Cognito OAuth redirect; exchanges code → session
        ├── EventDetailPage.tsx        # Waitlist join/leave UI for SoldOut events
        ├── CreateEventPage.tsx
        ├── EditEventPage.tsx
        ├── EventInsightsPage.tsx      # Per-event analytics (organiser only)
        ├── MyBookingsPage.tsx         # "Add to Calendar" .ics download button
        ├── FavoritesPage.tsx
        ├── StorePage.tsx              # Loyalty points redemption store
        ├── ProfilePage.tsx
        ├── OrganizerDashboardPage.tsx # Analytics charts per event
        ├── OrganizerProfilePage.tsx
        ├── CheckInScannerPage.tsx     # Live camera QR scanner + manual token input
        ├── AdminPage.tsx
        ├── TermsPage.tsx
        ├── PrivacyPage.tsx
        └── NotFoundPage.tsx
```

---

## Routing & Access Control

Routes are defined with `createBrowserRouter` in `src/routes/index.tsx`.

### Route Map

| Path | Page | Access |
|---|---|---|
| `/` | `HomePage` | Public |
| `/events/:id` | `EventDetailPage` | Public |
| `/organizers/:id` | `OrganizerProfilePage` | Public |
| `/terms` | `TermsPage` | Public |
| `/privacy` | `PrivacyPage` | Public |
| `/login` | `LoginPage` | Unauthenticated only |
| `/register` | `RegisterPage` | Unauthenticated only |
| `/forgot-password` | `ForgotPasswordPage` | Unauthenticated only |
| `/reset-password` | `ResetPasswordPage` | Unauthenticated only |
| `/confirm-email` | `ConfirmEmailPage` | Public |
| `/auth/callback` | `OAuthCallbackPage` | Public — Cognito OAuth redirect target |
| `/profile` | `ProfilePage` | Authenticated |
| `/my-bookings` | `MyBookingsPage` | Authenticated |
| `/favorites` | `FavoritesPage` | Authenticated |
| `/store` | `StorePage` | Authenticated |
| `/events/create` | `CreateEventPage` | Authenticated |
| `/events/:id/edit` | `EditEventPage` | Authenticated (owner or Admin) |
| `/events/:id/insights` | `EventInsightsPage` | Authenticated (organiser or Admin) |
| `/dashboard` | `OrganizerDashboardPage` | Authenticated |
| `/checkin` | `CheckInScannerPage` | Authenticated |
| `/admin` | `AdminPage` | Admin or SuperAdmin |
| `*` | `NotFoundPage` | — |

### `ProtectedRoute`

`src/routes/ProtectedRoute.tsx` reads `user` and `isHydrating` from the Zustand auth store:

1. Amplify session still loading (`isHydrating`) and no cached user → renders `<PageLoader />`.
2. No user after hydration → redirect to `/login` (preserves `from` location for post-login redirect).
3. User present + `allowedRoles` specified → checks `user.role`; redirects to `/` on mismatch.
4. User present + no role restriction → renders `<Outlet />`.

---

## State Management

### Auth Store (`src/stores/authStore.ts`)

Zustand store with `persist` middleware backed by `localStorage` under the key `event-hub-auth`. Only `user` is persisted — `isHydrating` is always initialised to `true` so the Cognito session is validated on every page load.

```
State
  user         AppUser | null  — { userId, name, email, role, loyaltyPoints, ... }
  isHydrating  boolean         — true while Amplify session check is in flight

Actions
  setUser(u)     — sets or clears the user profile
  setHydrated()  — marks the session check complete (isHydrating → false)
  logout()       — clears user
  isAdmin()      — true if role is Admin or SuperAdmin
  isSuperAdmin() — true if role is SuperAdmin
```

`App.tsx` dynamically imports Amplify, calls `fetchAuthSession()`, and on success calls `fetchAppProfile()` then `setUser()`. `setHydrated()` is always called in `.finally()` so `ProtectedRoute` knows when it's safe to redirect.

The store is accessed **outside React** (in the Axios response interceptor) via `useAuthStore.getState().logout()`, which is a Zustand first-class pattern.

### Server State (TanStack Query)

All remote data is managed by TanStack Query. No `useState` + `useEffect` for data fetching anywhere in the codebase.

- Singleton `QueryClient` is exported from `src/lib/queryClient.ts` for use in mutation callbacks outside hooks (e.g., cache invalidation inside Axios error handlers).
- `staleTime: 5 * 60 * 1000` — data is considered fresh for 5 minutes; avoids unnecessary refetches on tab focus.
- `retry: 1` — failed requests are retried once before erroring.
- `refetchOnWindowFocus: false` — avoids noisy refetches during development.

---

## Data Fetching

Each API file exports both **raw async functions** (for use outside hooks) and **React Query hooks**. Example pattern from `src/api/events.ts`:

```typescript
// Raw function — usable anywhere
export const eventsApi = {
  list: (filters?: EventFilters) =>
    api.get<Event[]>('/events', { params: filters }).then(r => r.data),
}

// React Query hook — used in components
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.list(filters),
  })
}

// Mutation hook with cache invalidation
export function useCreateEvent() {
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event created.')
    },
  })
}
```

### Optimistic Updates

Review voting (`src/api/reviews.ts` → `useVoteReview`) uses TanStack Query's optimistic update pattern:
- `onMutate` — snapshot current data, apply optimistic change
- `onError` — roll back to snapshot
- `onSettled` — invalidate to sync with server

---

## API Layer

### Axios Instance (`src/api/axios.ts`)

```
baseURL: '/api'   (relative — resolved by Vite dev proxy in dev, web server in prod)
```

**Request interceptor** — dynamically imports `fetchAuthSession` from `aws-amplify/auth` and attaches the Cognito ID token:
```
Authorization: Bearer <cognito-id-token>
```
Using a dynamic import (rather than a static one) ensures `aws-amplify/auth` stays out of the entry bundle and that `Amplify.configure()` has already run before the first session call.

**Response interceptor** — on `401 Unauthorized` **only when an `Authorization` header was sent**, calls `useAuthStore.getState().logout()` and redirects to `/login`. Skipping the logout when no token was sent prevents a race condition (Amplify not yet configured → no token attached → 401) from wiping a valid session.

### Vite Dev Proxy

`vite.config.ts` forwards all requests from `/api` to `http://localhost:5266`:

```typescript
server: {
  proxy: {
    '/api': { target: 'http://localhost:5266', changeOrigin: true }
  }
}
```

In production, the reverse proxy (Nginx, Caddy, etc.) should forward `/api` to the .NET backend.

---

## Component Architecture

### Layers

```
Pages           — One per route; orchestrate data + layout
  └── Features  — Domain composites (LoginForm, EventForm, AttendeeTable)
        └── Components  — Reusable UI building blocks (EventCard, StatusBadge, ConfirmDialog)
              └── ui/   — shadcn/ui primitives (Button, Dialog, Table …)
```

### Key Components

| Component | Purpose |
|---|---|
| `Navbar` | Sticky header with logo, nav links, `NotificationBell`, and avatar dropdown; mobile Sheet |
| `NotificationBell` | Bell icon with red unread badge; dropdown showing last 8 notifications with `formatDistanceToNow` timestamps; polls unread count every 30 s via `refetchInterval` |
| `EventCard` | Displays event summary with `HoverBorderGradient` border effect |
| `EventFilters` | Debounced search + category/tag/sort/date-range controls |
| `StatusBadge` | Maps `EventStatus` → coloured pill; `Live` status shows animated ping dot |
| `ConfirmDialog` | Reusable destructive-action dialog with loading state |
| `LoadingSpinner` | Centred `Loader2` spinner for full-page loading states |
| `EventForm` | Shared create/edit form; pre-populates tag checkboxes on edit via `useEffect` |
| `AttendeeTable` | Searchable attendee list with check-in button, QR modal, and CSV export |

### Aceternity UI

Three Aceternity UI components are inlined in `src/components/aceternity/` (not installed from npm):

| Component | Used in |
|---|---|
| `Spotlight` | `HomePage` hero section |
| `BackgroundBeams` | `AuthLayout` (login/register backgrounds) |
| `HoverBorderGradient` | `EventCard` animated border on hover |

---

## Styling

- **Tailwind CSS v3** with the `tailwindcss-animate` plugin.
- **shadcn/ui CSS variables** — HSL tokens defined in `src/index.css` under `:root` and `.dark` selectors. The primary/ring colour is amber (`--ring: 32 95% 44%`); `--muted-foreground` is set to 40% lightness to meet WCAG AA contrast.
- Custom CSS keyframes in `src/index.css`: `page-in` (route-level fade), `navbar-in` (header entrance). These replace what was previously done with framer-motion in the app shell, keeping the animation library out of the critical-path bundle.
- Custom Tailwind keyframes in `tailwind.config.js`: `spotlight`, `shimmer`, `border-spin` (Aceternity UI effects).
- All component styling is utility-class based; no CSS modules or styled-components.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Relative `/api` base URL | Works with Vite dev proxy in development and a reverse proxy in production without code changes |
| Axios interceptors for auth | Centralises token injection and 401 handling; no per-request boilerplate |
| Dynamic import of `aws-amplify/auth` in Axios | Keeps the library out of the entry bundle; guarantees `Amplify.configure()` has run before the first `fetchAuthSession()` call |
| 401 logout only when `Authorization` was sent | Prevents race-condition 401s (no token attached yet) from wiping a valid Cognito session |
| Amplify initialised lazily in `App.tsx` useEffect | The entire `aws-amplify` ecosystem is excluded from the critical-path entry bundle; deferred until after first paint |
| `cancelled` flag in auth `useEffect` | React StrictMode double-invokes effects; the flag prevents two simultaneous `/api/auth/me` calls that would trigger the backend rate limiter (429) |
| `React.lazy()` for all pages | Each page is a separate chunk; users only download code for routes they actually visit; primary driver of 68% entry bundle size reduction |
| CSS keyframes instead of framer-motion in app shell | `RootLayout` and `Navbar` transitions use `animate-page-in` / `animate-navbar-in` CSS classes, keeping `framer-motion` out of the entry bundle |
| `window.location.origin` for Cognito redirect URLs | OAuth callbacks work on any port (`:5173` dev, `:4173` preview, production domain) without hardcoded values |
| Singleton `QueryClient` | Allows cache invalidation inside mutation `onSuccess` callbacks that run outside component scope |
| Zustand `getState()` in Axios | Accesses auth state without React context; Zustand supports this as a first-class pattern |
| `isPending` not `isLoading` | TanStack Query v5 renamed `isLoading` → `isPending` for mutations; used consistently |
| `sonner` for toasts | Simpler API than Radix Toast; no provider required beyond `<Toaster />` in `App.tsx` |
| Aceternity UI inlined | Avoids an npm package dependency for three small visual components; easier to customise |
| `useEffect` for tag pre-population in `EventForm` | Tag IDs from the API arrive asynchronously after component mount; `setValue` is called once data resolves |
| `ProtectedRoute` preserves `from` | Users are redirected back to the originally requested URL after logging in |
