import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForUserOnDate } from "@/data/workouts";
import { DashboardShell } from "./DashboardShell";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(dateParam) : new Date();

  const workouts = await getWorkoutsForUserOnDate(userId, date);

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-3xl mx-auto px-6 py-10 gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            View your workouts by date.
          </p>
        </div>

        <DashboardShell initialDate={date} initialWorkouts={workouts} />
      </main>
    </div>
  );
}
