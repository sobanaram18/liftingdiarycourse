"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  startedAt: z.coerce.date(),
});

type CreateWorkoutParams = {
  name: string;
  startedAt: string | Date;
};

export async function createWorkoutAction(params: CreateWorkoutParams) {
  const parsed = CreateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const workout = await createWorkout(userId, parsed.data.name, parsed.data.startedAt);

  const dateStr = workout.startedAt.toISOString().split("T")[0];
  return { dateStr };
}
