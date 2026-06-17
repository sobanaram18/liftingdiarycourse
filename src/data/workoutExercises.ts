import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, asc, count } from "drizzle-orm";

export async function getExercisesForWorkout(userId: string, workoutId: number) {
  const rows = await db
    .select({
      workoutExerciseId: workoutExercises.id,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      orderIndex: workoutExercises.orderIndex,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workoutExercises.workoutId, workoutId), eq(workouts.userId, userId)))
    .orderBy(asc(workoutExercises.orderIndex), asc(sets.setNumber));

  const map = new Map<
    number,
    {
      workoutExerciseId: number;
      exerciseId: number;
      exerciseName: string;
      orderIndex: number;
      sets: { id: number; setNumber: number; reps: number | null; weight: string | null }[];
    }
  >();

  for (const row of rows) {
    if (!map.has(row.workoutExerciseId)) {
      map.set(row.workoutExerciseId, {
        workoutExerciseId: row.workoutExerciseId,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName,
        orderIndex: row.orderIndex,
        sets: [],
      });
    }
    if (row.setId) {
      map.get(row.workoutExerciseId)!.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        reps: row.reps,
        weight: row.weight,
      });
    }
  }

  return Array.from(map.values());
}

export type WorkoutExerciseEntry = Awaited<ReturnType<typeof getExercisesForWorkout>>[number];

async function assertWorkoutOwnership(userId: string, workoutId: number) {
  const [workout] = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  if (!workout) throw new Error("Workout not found");
}

export async function addExerciseToWorkout(userId: string, workoutId: number, exerciseId: number) {
  await assertWorkoutOwnership(userId, workoutId);

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, orderIndex: existingCount })
    .returning();

  return workoutExercise;
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutId: number,
  workoutExerciseId: number
) {
  await assertWorkoutOwnership(userId, workoutId);

  await db
    .delete(workoutExercises)
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workoutExercises.workoutId, workoutId)));
}
