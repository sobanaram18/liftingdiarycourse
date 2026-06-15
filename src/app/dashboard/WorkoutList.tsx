"use client";

import { useState } from "react";
import { format, differenceInMinutes } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { WorkoutSummary } from "@/data/workouts";

interface WorkoutListProps {
  initialDate: Date;
  initialWorkouts: WorkoutSummary[];
  onDateChange: (date: Date) => void;
}

function formatDuration(startedAt: Date, completedAt: Date | null) {
  if (!completedAt) return null;
  const mins = differenceInMinutes(completedAt, startedAt);
  return `${mins} min`;
}

export function WorkoutList({ initialDate, initialWorkouts, onDateChange }: WorkoutListProps) {
  const [date, setDate] = useState<Date>(initialDate);
  const [workouts] = useState<WorkoutSummary[]>(initialWorkouts);

  const formattedDate = format(date, "do MMM yyyy");

  function handleDateSelect(d: Date | undefined) {
    if (!d) return;
    setDate(d);
    onDateChange(d);
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-fit gap-2 text-sm font-medium"
          >
            <CalendarIcon className="h-4 w-4 text-zinc-500" />
            {formattedDate}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Workouts — {formattedDate}
        </h2>

        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
            <Dumbbell className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No workouts logged for this date.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {workouts.map((workout) => {
              const duration = formatDuration(workout.startedAt, workout.completedAt);
              return (
                <li
                  key={workout.id}
                  className="flex flex-col gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-black dark:text-zinc-50">
                      {workout.name}
                    </span>
                    {duration && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {duration}
                      </span>
                    )}
                  </div>
                  {workout.exercises.length > 0 && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {workout.exercises.join(" · ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
