import { db } from "@/db";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseName: exercises.name,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lte(workouts.startedAt, endOfDay)
      )
    )
    .orderBy(workoutExercises.orderIndex);

  // Group flat rows into workouts with exercise lists
  const map = new Map<
    number,
    { id: number; name: string; startedAt: Date; completedAt: Date | null; exercises: string[] }
  >();

  for (const row of rows) {
    if (!map.has(row.workoutId)) {
      map.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      map.get(row.workoutId)!.exercises.push(row.exerciseName);
    }
  }

  return Array.from(map.values());
}

export type WorkoutSummary = Awaited<ReturnType<typeof getWorkoutsForUserOnDate>>[number];
