# Server Components

## Rule: `params` and `searchParams` MUST Be Awaited

In Next.js 15, `params` and `searchParams` are **Promises**, not plain objects. You MUST `await` them before accessing any property. Accessing them synchronously will return the Promise itself — not the values — causing silent bugs.

**Never do this:**

```tsx
// WRONG — params is a Promise, not an object
export default function WorkoutPage({ params }: { params: { workoutid: string } }) {
  const { workoutid } = params; // BUG: workoutid is undefined
}
```

**Always do this:**

```tsx
// CORRECT — await params before destructuring
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutid: string }>;
}) {
  const { workoutid } = await params;
}
```

The same rule applies to `searchParams`:

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
}
```

## Rule: Page Components Must Be `async`

Because `params` must be awaited, and data fetching is done inside Server Components (see `data-fetching.md`), all page and layout components MUST be declared `async`.

```tsx
// app/dashboard/workout/[workoutid]/page.tsx
import { getWorkoutById } from "@/data/workouts";
import { auth } from "@/auth";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutid: string }>;
}) {
  const { workoutid } = await params;
  const session = await auth();
  const workout = await getWorkoutById(workoutid, session.user.id);

  return <div>{workout.name}</div>;
}
```

## Rule: Type `params` as a Promise

Always type `params` (and `searchParams`) as `Promise<{ ... }>` — not as a plain object. This matches the Next.js 15 API and will surface type errors if you forget to `await`.

```tsx
// Correct type signature for a dynamic route segment
type Props = {
  params: Promise<{ workoutid: string }>;
};
```

## Rule: Await at the Top of the Component

Await `params` at the very top of the component body, before any other logic. This keeps the component readable and makes it obvious that the value is async.

```tsx
export default async function WorkoutPage({ params }: Props) {
  const { workoutid } = await params; // first line of logic
  // ... rest of the component
}
```
