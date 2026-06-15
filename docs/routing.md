# Routing Standards

This document outlines the coding standards and conventions for routing in this application.

## Route Structure

All application routes are nested under `/dashboard`. There are no top-level feature routes outside of auth pages.

```
/                        → redirect to /dashboard or /sign-in
/sign-in                 → Clerk sign-in page (public)
/sign-up                 → Clerk sign-up page (public)
/dashboard               → main dashboard (protected)
/dashboard/[feature]     → feature sub-pages (protected)
```

## Route Protection

All `/dashboard` routes are protected via **Next.js proxy** (formerly called middleware). Do not add per-page auth checks as a substitute — proxy is the single enforcement point.

```tsx
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
```

Unauthenticated users hitting any `/dashboard` route are automatically redirected to `/sign-in` by Clerk. See [auth.md](auth.md) for full Clerk configuration.

## Key Principles

- **Proxy is the gatekeeper**: Route protection lives in `src/proxy.ts`, not in individual page components
- **All features under /dashboard**: No protected routes exist outside of `/dashboard`
- **Public routes are explicit exceptions**: Only auth pages (`/sign-in`, `/sign-up`) and static assets are public

## Adding New Routes

When adding a new protected feature page:

1. Create the page under `src/app/dashboard/[feature]/page.tsx`
2. No additional auth logic needed — middleware covers `/dashboard(.*)` automatically
3. Do **not** add a `createRouteMatcher` entry for the new route; the wildcard already covers it

```
src/app/
  dashboard/
    page.tsx              ← /dashboard
    workout/
      page.tsx            ← /dashboard/workout
      [workoutId]/
        page.tsx          ← /dashboard/workout/[workoutId]
```

## Dynamic Segments

Follow the Next.js App Router convention: dynamic segments use `[paramName]` folder naming.

In Next.js 15+, route params are async and must be awaited in server components. See [server-components.md](server-components.md) for the correct pattern.

```tsx
// src/app/dashboard/workout/[workoutId]/page.tsx
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  // ...
}
```

## Navigation

Use Next.js `<Link>` for client-side navigation between dashboard routes. Do not use `<a>` tags.

```tsx
import Link from 'next/link'

<Link href="/dashboard/workout">View Workouts</Link>
```

For programmatic navigation in server actions or after mutations, use `redirect` from `next/navigation`:

```tsx
import { redirect } from 'next/navigation'

redirect('/dashboard')
```
