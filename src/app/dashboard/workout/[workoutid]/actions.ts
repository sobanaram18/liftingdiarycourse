"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const UpdateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(100),
  startedAt: z.coerce.date(),
});

type UpdateWorkoutParams = {
  workoutId: number;
  name: string;
  startedAt: string | Date;
};

export async function updateWorkoutAction(params: UpdateWorkoutParams) {
  const parsed = UpdateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const workout = await updateWorkout(
    userId,
    parsed.data.workoutId,
    parsed.data.name,
    parsed.data.startedAt
  );

  if (!workout) throw new Error("Workout not found");

  const dateStr = workout.startedAt.toISOString().split("T")[0];
  return { dateStr };
}
