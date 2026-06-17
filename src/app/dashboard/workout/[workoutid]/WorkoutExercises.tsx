"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addExerciseAction,
  removeExerciseAction,
  addSetAction,
  updateSetAction,
  deleteSetAction,
} from "./actions";
import type { WorkoutExerciseEntry } from "@/data/workoutExercises";

type Props = {
  workoutId: number;
  initialExercises: WorkoutExerciseEntry[];
};

export function WorkoutExercises({ workoutId, initialExercises }: Props) {
  const [exerciseEntries, setExerciseEntries] = useState(initialExercises);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const exerciseName = newExerciseName.trim();
    if (!exerciseName) {
      setError("Exercise name is required.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addExerciseAction({ workoutId, exerciseName });
        setExerciseEntries((prev) => [
          ...prev,
          {
            workoutExerciseId: result.workoutExerciseId,
            exerciseId: result.exerciseId,
            exerciseName: result.exerciseName,
            orderIndex: result.orderIndex,
            sets: [],
          },
        ]);
        setNewExerciseName("");
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    });
  }

  function handleRemoveExercise(workoutExerciseId: number) {
    setError(null);
    startTransition(async () => {
      try {
        await removeExerciseAction({ workoutId, workoutExerciseId });
        setExerciseEntries((prev) => prev.filter((e) => e.workoutExerciseId !== workoutExerciseId));
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    });
  }

  function handleAddSet(workoutExerciseId: number, reps: number | null, weight: number | null) {
    setError(null);
    startTransition(async () => {
      try {
        const set = await addSetAction({ workoutExerciseId, reps, weight });
        setExerciseEntries((prev) =>
          prev.map((entry) =>
            entry.workoutExerciseId === workoutExerciseId
              ? {
                  ...entry,
                  sets: [
                    ...entry.sets,
                    { id: set.id, setNumber: set.setNumber, reps: set.reps, weight: set.weight },
                  ],
                }
              : entry
          )
        );
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    });
  }

  function handleUpdateSet(
    workoutExerciseId: number,
    setId: number,
    reps: number | null,
    weight: number | null
  ) {
    setError(null);
    startTransition(async () => {
      try {
        const set = await updateSetAction({ setId, reps, weight });
        setExerciseEntries((prev) =>
          prev.map((entry) =>
            entry.workoutExerciseId === workoutExerciseId
              ? {
                  ...entry,
                  sets: entry.sets.map((s) =>
                    s.id === setId ? { ...s, reps: set.reps, weight: set.weight } : s
                  ),
                }
              : entry
          )
        );
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    });
  }

  function handleDeleteSet(workoutExerciseId: number, setId: number) {
    setError(null);
    startTransition(async () => {
      try {
        await deleteSetAction({ setId });
        setExerciseEntries((prev) =>
          prev.map((entry) =>
            entry.workoutExerciseId === workoutExerciseId
              ? { ...entry, sets: entry.sets.filter((s) => s.id !== setId) }
              : entry
          )
        );
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {exerciseEntries.map((entry) => (
        <ExerciseCard
          key={entry.workoutExerciseId}
          entry={entry}
          isPending={isPending}
          onAddSet={handleAddSet}
          onUpdateSet={handleUpdateSet}
          onDeleteSet={handleDeleteSet}
          onRemoveExercise={handleRemoveExercise}
        />
      ))}

      <form onSubmit={handleAddExercise} className="flex flex-col gap-2">
        <Label htmlFor="newExerciseName">Add exercise</Label>
        <div className="flex gap-3">
          <Input
            id="newExerciseName"
            type="text"
            placeholder="e.g. Bench Press"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            Add
          </Button>
        </div>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

type ExerciseCardProps = {
  entry: WorkoutExerciseEntry;
  isPending: boolean;
  onAddSet: (workoutExerciseId: number, reps: number | null, weight: number | null) => void;
  onUpdateSet: (
    workoutExerciseId: number,
    setId: number,
    reps: number | null,
    weight: number | null
  ) => void;
  onDeleteSet: (workoutExerciseId: number, setId: number) => void;
  onRemoveExercise: (workoutExerciseId: number) => void;
};

function ExerciseCard({
  entry,
  isPending,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onRemoveExercise,
}: ExerciseCardProps) {
  const [newReps, setNewReps] = useState("");
  const [newWeight, setNewWeight] = useState("");

  function handleAddSetSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAddSet(
      entry.workoutExerciseId,
      newReps === "" ? null : Number(newReps),
      newWeight === "" ? null : Number(newWeight)
    );
    setNewReps("");
    setNewWeight("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-black dark:text-zinc-50">{entry.exerciseName}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => onRemoveExercise(entry.workoutExerciseId)}
        >
          Remove
        </Button>
      </div>

      {entry.sets.length > 0 && (
        <div className="flex flex-col gap-2">
          {entry.sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              isPending={isPending}
              onUpdate={(reps, weight) => onUpdateSet(entry.workoutExerciseId, set.id, reps, weight)}
              onDelete={() => onDeleteSet(entry.workoutExerciseId, set.id)}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleAddSetSubmit} className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`reps-${entry.workoutExerciseId}`}>Reps</Label>
          <Input
            id={`reps-${entry.workoutExerciseId}`}
            type="number"
            min={0}
            value={newReps}
            onChange={(e) => setNewReps(e.target.value)}
            disabled={isPending}
            className="w-20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`weight-${entry.workoutExerciseId}`}>Weight</Label>
          <Input
            id={`weight-${entry.workoutExerciseId}`}
            type="number"
            min={0}
            step="0.01"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            disabled={isPending}
            className="w-24"
          />
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          Add set
        </Button>
      </form>
    </div>
  );
}

type SetRowProps = {
  set: { id: number; setNumber: number; reps: number | null; weight: string | null };
  isPending: boolean;
  onUpdate: (reps: number | null, weight: number | null) => void;
  onDelete: () => void;
};

function SetRow({ set, isPending, onUpdate, onDelete }: SetRowProps) {
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [weight, setWeight] = useState(set.weight ?? "");

  function commit() {
    onUpdate(reps === "" ? null : Number(reps), weight === "" ? null : Number(weight));
  }

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-sm text-zinc-500 dark:text-zinc-400">#{set.setNumber}</span>
      <Input
        type="number"
        min={0}
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={commit}
        disabled={isPending}
        className="w-20"
        aria-label="Reps"
      />
      <Input
        type="number"
        min={0}
        step="0.01"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={commit}
        disabled={isPending}
        className="w-24"
        aria-label="Weight"
      />
      <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}
