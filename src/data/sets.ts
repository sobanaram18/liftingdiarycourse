import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

async function getOwnedWorkoutExercise(userId: string, workoutExerciseId: number) {
  const [row] = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workouts.userId, userId)));
  return row ?? null;
}

async function getOwnedSet(userId: string, setId: number) {
  const [row] = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)));
  return row ?? null;
}

export async function createSet(
  userId: string,
  workoutExerciseId: number,
  reps: number | null,
  weight: number | null
) {
  const owned = await getOwnedWorkoutExercise(userId, workoutExerciseId);
  if (!owned) throw new Error("Workout exercise not found");

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const [set] = await db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber: existingCount + 1,
      reps,
      weight: weight === null ? null : weight.toString(),
    })
    .returning();

  return set;
}

export async function updateSet(
  userId: string,
  setId: number,
  reps: number | null,
  weight: number | null
) {
  const owned = await getOwnedSet(userId, setId);
  if (!owned) return null;

  const [updated] = await db
    .update(sets)
    .set({ reps, weight: weight === null ? null : weight.toString() })
    .where(eq(sets.id, setId))
    .returning();

  return updated ?? null;
}

export async function deleteSet(userId: string, setId: number) {
  const owned = await getOwnedSet(userId, setId);
  if (!owned) throw new Error("Set not found");

  await db.delete(sets).where(eq(sets.id, setId));
}
