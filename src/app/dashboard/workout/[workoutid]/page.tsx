import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

type Props = {
  params: Promise<{ workoutid: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutid } = await params;
  const workoutId = parseInt(workoutid, 10);
  if (isNaN(workoutId)) notFound();

  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) notFound();

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-3xl mx-auto px-6 py-10 gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Edit workout
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Update the name or date of your workout.
          </p>
        </div>

        <EditWorkoutForm workout={workout} />
      </main>
    </div>
  );
}
