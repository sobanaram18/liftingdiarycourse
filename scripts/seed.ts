import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { workouts, exercises, workoutExercises, sets } from '../src/db/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log('Seeding workouts...');
  await db.insert(workouts).values([
    {
      id: 1,
      userId: 'user_3EZ63lVV02m06dAq0lrmS0Q4aUd',
      name: 'Push Day',
      startedAt: new Date('2026-06-01T09:00:00'),
      completedAt: new Date('2026-06-01T10:15:00'),
      createdAt: new Date('2026-06-01T09:00:00'),
      updatedAt: new Date('2026-06-01T10:15:00'),
    },
    {
      id: 2,
      userId: 'user_3EZ63lVV02m06dAq0lrmS0Q4aUd',
      name: 'Pull Day',
      startedAt: new Date('2026-06-02T08:30:00'),
      completedAt: new Date('2026-06-02T09:45:00'),
      createdAt: new Date('2026-06-02T08:30:00'),
      updatedAt: new Date('2026-06-02T09:45:00'),
    },
  ]);

  console.log('Seeding exercises...');
  await db.insert(exercises).values([
    { id: 1, name: 'Bench Press', createdAt: new Date('2026-06-01T09:00:00'), updatedAt: new Date('2026-06-01T09:00:00') },
    { id: 2, name: 'Overhead Press', createdAt: new Date('2026-06-01T09:00:00'), updatedAt: new Date('2026-06-01T09:00:00') },
    { id: 3, name: 'Tricep Pushdown', createdAt: new Date('2026-06-01T09:00:00'), updatedAt: new Date('2026-06-01T09:00:00') },
    { id: 4, name: 'Deadlift', createdAt: new Date('2026-06-02T08:30:00'), updatedAt: new Date('2026-06-02T08:30:00') },
    { id: 5, name: 'Barbell Row', createdAt: new Date('2026-06-02T08:30:00'), updatedAt: new Date('2026-06-02T08:30:00') },
  ]);

  console.log('Seeding workout_exercises...');
  await db.insert(workoutExercises).values([
    { id: 1, workoutId: 1, exerciseId: 1, orderIndex: 1, createdAt: new Date('2026-06-01T09:00:00') },
    { id: 2, workoutId: 1, exerciseId: 2, orderIndex: 2, createdAt: new Date('2026-06-01T09:00:00') },
    { id: 3, workoutId: 1, exerciseId: 3, orderIndex: 3, createdAt: new Date('2026-06-01T09:00:00') },
    { id: 4, workoutId: 2, exerciseId: 4, orderIndex: 1, createdAt: new Date('2026-06-02T08:30:00') },
    { id: 5, workoutId: 2, exerciseId: 5, orderIndex: 2, createdAt: new Date('2026-06-02T08:30:00') },
  ]);

  console.log('Seeding sets...');
  await db.insert(sets).values([
    { id: 1,  workoutExerciseId: 1, setNumber: 1, reps: 10, weight: '60.00', createdAt: new Date('2026-06-01T09:05:00') },
    { id: 2,  workoutExerciseId: 1, setNumber: 2, reps: 8,  weight: '70.00', createdAt: new Date('2026-06-01T09:08:00') },
    { id: 3,  workoutExerciseId: 1, setNumber: 3, reps: 6,  weight: '80.00', createdAt: new Date('2026-06-01T09:11:00') },
    { id: 4,  workoutExerciseId: 2, setNumber: 1, reps: 10, weight: '40.00', createdAt: new Date('2026-06-01T09:20:00') },
    { id: 5,  workoutExerciseId: 2, setNumber: 2, reps: 8,  weight: '45.00', createdAt: new Date('2026-06-01T09:23:00') },
    { id: 6,  workoutExerciseId: 2, setNumber: 3, reps: 6,  weight: '50.00', createdAt: new Date('2026-06-01T09:26:00') },
    { id: 7,  workoutExerciseId: 3, setNumber: 1, reps: 12, weight: '25.00', createdAt: new Date('2026-06-01T09:35:00') },
    { id: 8,  workoutExerciseId: 3, setNumber: 2, reps: 12, weight: '27.50', createdAt: new Date('2026-06-01T09:38:00') },
    { id: 9,  workoutExerciseId: 4, setNumber: 1, reps: 5,  weight: '100.00', createdAt: new Date('2026-06-02T08:35:00') },
    { id: 10, workoutExerciseId: 4, setNumber: 2, reps: 5,  weight: '110.00', createdAt: new Date('2026-06-02T08:39:00') },
    { id: 11, workoutExerciseId: 4, setNumber: 3, reps: 5,  weight: '120.00', createdAt: new Date('2026-06-02T08:43:00') },
    { id: 12, workoutExerciseId: 5, setNumber: 1, reps: 10, weight: '70.00', createdAt: new Date('2026-06-02T08:55:00') },
    { id: 13, workoutExerciseId: 5, setNumber: 2, reps: 8,  weight: '75.00', createdAt: new Date('2026-06-02T08:58:00') },
    { id: 14, workoutExerciseId: 5, setNumber: 3, reps: 8,  weight: '75.00', createdAt: new Date('2026-06-02T09:01:00') },
  ]);

  console.log('Seed complete.');
}

main().catch((e) => { console.error(e); process.exit(1); });
