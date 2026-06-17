"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";
import { findOrCreateExerciseByName } from "@/data/exercises";
import { addExerciseToWorkout, removeExerciseFromWorkout } from "@/data/workoutExercises";
import { createSet, updateSet, deleteSet } from "@/data/sets";

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

const AddExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseName: z.string().min(1, "Exercise name is required").max(100),
});

export async function addExerciseAction(params: { workoutId: number; exerciseName: string }) {
  const parsed = AddExerciseSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const exercise = await findOrCreateExerciseByName(parsed.data.exerciseName.trim());
  const workoutExercise = await addExerciseToWorkout(userId, parsed.data.workoutId, exercise.id);

  return {
    workoutExerciseId: workoutExercise.id,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    orderIndex: workoutExercise.orderIndex,
  };
}

const RemoveExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  workoutExerciseId: z.number().int().positive(),
});

export async function removeExerciseAction(params: { workoutId: number; workoutExerciseId: number }) {
  const parsed = RemoveExerciseSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await removeExerciseFromWorkout(userId, parsed.data.workoutId, parsed.data.workoutExerciseId);
}

const AddSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().min(0).nullable(),
  weight: z.number().min(0).nullable(),
});

export async function addSetAction(params: {
  workoutExerciseId: number;
  reps: number | null;
  weight: number | null;
}) {
  const parsed = AddSetSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const set = await createSet(userId, parsed.data.workoutExerciseId, parsed.data.reps, parsed.data.weight);
  if (!set) throw new Error("Failed to create set");

  return set;
}

const UpdateSetSchema = z.object({
  setId: z.number().int().positive(),
  reps: z.number().int().min(0).nullable(),
  weight: z.number().min(0).nullable(),
});

export async function updateSetAction(params: { setId: number; reps: number | null; weight: number | null }) {
  const parsed = UpdateSetSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const set = await updateSet(userId, parsed.data.setId, parsed.data.reps, parsed.data.weight);
  if (!set) throw new Error("Set not found");

  return set;
}

const DeleteSetSchema = z.object({
  setId: z.number().int().positive(),
});

export async function deleteSetAction(params: { setId: number }) {
  const parsed = DeleteSetSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await deleteSet(userId, parsed.data.setId);
}
