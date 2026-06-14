import { drizzle } from 'drizzle-orm/neon-http';
const db = drizzle({ connection: process.env.DATABASE_URL! });

export { db }