"use client";

import { useRouter } from "next/navigation";
import { WorkoutList } from "./WorkoutList";
import type { WorkoutSummary } from "@/data/workouts";

interface DashboardShellProps {
  initialDate: Date;
  initialWorkouts: WorkoutSummary[];
}

export function DashboardShell({ initialDate, initialWorkouts }: DashboardShellProps) {
  const router = useRouter();

  function handleDateChange(date: Date) {
    const iso = date.toISOString().split("T")[0];
    router.push(`/dashboard?date=${iso}`);
  }

  return (
    <WorkoutList
      initialDate={initialDate}
      initialWorkouts={initialWorkouts}
      onDateChange={handleDateChange}
    />
  );
}
