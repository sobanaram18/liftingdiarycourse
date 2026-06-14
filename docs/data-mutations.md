# Data Mutations

## Rule: Mutations via `/data` Helpers Only

All database writes (insert, update, delete) MUST go through helper functions in the `src/data` directory. These helpers use **Drizzle ORM** — never raw SQL, and never direct `db` calls from outside `/data`.

Mutation helpers live in the same files as query helpers for the same entity:

```
src/data/
  workouts.ts    # getWorkoutsForUser, createWorkout, deleteWorkout, ...
  exercises.ts   # getExercises, createExercise, ...
  sets.ts        # getSetsForWorkoutExercise, createSet, updateSet, ...
```

Example mutation helper:

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, startedAt: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();
  return workout;
}

export async function deleteWorkout(userId: string, workoutId: number) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

**Always scope writes to the authenticated user.** Every insert must include `userId`. Every update or delete must filter by both `id` and `userId` to prevent users from mutating another user's data.

---

## Rule: Server Actions via Colocated `actions.ts`

All data mutations triggered from the UI MUST be implemented as **Next.js Server Actions** inside a colocated `actions.ts` file, placed next to the page or component that uses them.

```
src/app/dashboard/
  page.tsx
  actions.ts     ← server actions for dashboard mutations
  DashboardShell.tsx

src/app/workouts/[id]/
  page.tsx
  actions.ts     ← server actions for this route's mutations
```

Every `actions.ts` file MUST begin with `"use server"`.

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: z.infer<typeof CreateWorkoutSchema>) {
  const parsed = CreateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  return createWorkout(session.user.id, parsed.data.name, parsed.data.startedAt);
}
```

---

## Rule: Typed Params — No `FormData`

Server action parameters MUST be typed TypeScript objects. Never accept `FormData` as a parameter type.

```ts
// ✅ Correct
export async function createWorkoutAction(params: { name: string; startedAt: Date }) { ... }

// ❌ Wrong
export async function createWorkoutAction(formData: FormData) { ... }
```

Callers are responsible for constructing a typed object before invoking the action:

```ts
// In a Client Component
await createWorkoutAction({ name: workoutName, startedAt: new Date() });
```

---

## Rule: Zod Validation in Every Server Action

Every server action MUST validate its arguments with **Zod** before touching the database. Define the schema at the top of the file alongside the action.

```ts
const DeleteWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
});

export async function deleteWorkoutAction(params: z.infer<typeof DeleteWorkoutSchema>) {
  const parsed = DeleteWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  await deleteWorkout(session.user.id, parsed.data.workoutId);
}
```

Use `safeParse` (not `parse`) so validation errors are handled gracefully rather than throwing uncontrolled Zod errors.

---

## Rule: No `redirect()` in Server Actions

Never call `redirect()` from `next/navigation` inside a Server Action. Instead, return enough data for the caller to navigate itself.

```ts
// ❌ Wrong — redirect() throws internally and forces callers to filter "NEXT_REDIRECT" errors
export async function createWorkoutAction(params: CreateWorkoutParams) {
  // ...
  redirect(`/dashboard?date=${dateStr}`);
}

// ✅ Correct — return data, let the Client Component navigate
export async function createWorkoutAction(params: CreateWorkoutParams) {
  // ...
  return { dateStr };
}
```

The Client Component calls `router.push` after the action resolves:

```ts
const { dateStr } = await createWorkoutAction({ name, startedAt });
router.push(`/dashboard?date=${dateStr}`);
```

**Why:** `redirect()` works by throwing a special internal error (`NEXT_REDIRECT`). This leaks into catch blocks in Client Components, forces callers to filter it out by message string, and makes error handling brittle. Client-side navigation with `router.push` is explicit, predictable, and keeps the server action's responsibility scoped to the mutation only.

---

## Summary: The Mutation Stack

```
Client Component (button click / form submit)
  → calls Server Action in colocated actions.ts
    → validates params with Zod
    → authenticates via auth()
    → calls /data helper
      → executes Drizzle ORM query against db
```

No layer in this stack may be skipped. Direct `db` calls from Server Actions, or mutations from Server Components without going through `/data`, are not permitted.
