import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewWorkoutForm } from "./NewWorkoutForm";

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-3xl mx-auto px-6 py-10 gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            New workout
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Give your workout a name and pick a date to get started.
          </p>
        </div>

        <NewWorkoutForm />
      </main>
    </div>
  );
}
