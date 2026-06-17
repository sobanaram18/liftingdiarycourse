import { db } from "@/db";
import { exercises } from "@/db/schema";
import { asc, sql } from "drizzle-orm";

export async function getAllExercises() {
  return db.select().from(exercises).orderBy(asc(exercises.name));
}

export async function findOrCreateExerciseByName(name: string) {
  const [existing] = await db
    .select()
    .from(exercises)
    .where(sql`lower(${exercises.name}) = lower(${name})`);
  if (existing) return existing;

  const [created] = await db.insert(exercises).values({ name }).returning();
  return created;
}
