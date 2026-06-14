# Data Fetching

## Rule: Server Components Only

All data fetching in this app MUST be done exclusively via **React Server Components**.

**Never fetch data via:**
- Route handlers (`app/api/*/route.ts`)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side fetching library

**Always fetch data by:**
- Reading data directly inside a Server Component (any component without `"use client"`)
- Passing fetched data down as props to Client Components that need it for interactivity

## Rule: Database Queries via `/data` Helpers Only

All database queries MUST go through helper functions in the `/data` directory. These helpers use **Drizzle ORM** — never raw SQL.

```
/data
  users.ts       # user lookups
  workouts.ts    # workout queries
  exercises.ts   # exercise queries
  ...
```


Example helper:

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

Example usage in a Server Component:

```tsx
// app/workouts/page.tsx
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/auth";

export default async function WorkoutsPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);
  return <WorkoutList workouts={workouts} />;
}
```

## Rule: Users Can Only Access Their Own Data

Every `/data` helper that returns user-scoped data MUST filter by `userId`. This is not optional — it is a security requirement.

- Always accept `userId` as an explicit parameter (never infer it from a global)
- Always include `eq(table.userId, userId)` (or equivalent join condition) in every query
- Never expose a helper that returns all rows without a user filter

The caller (Server Component) is responsible for obtaining the authenticated `userId` from the session and passing it to the helper. Never trust user-supplied IDs from URL params or request bodies without first verifying they match the authenticated session user.
