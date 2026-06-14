"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutAction } from "./actions";

export function NewWorkoutForm() {
  const [name, setName] = useState("");
  const [startedAt, setStartedAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Workout name is required.");
      return;
    }

    startTransition(async () => {
      try {
        const { dateStr } = await createWorkoutAction({ name: name.trim(), startedAt });
        router.push(`/dashboard?date=${dateStr}`);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout name</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="startedAt">Date</Label>
        <Input
          id="startedAt"
          type="date"
          value={startedAt}
          onChange={(e) => setStartedAt(e.target.value)}
          disabled={isPending}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create workout"}
      </Button>
    </form>
  );
}
