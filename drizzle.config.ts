import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs in Node (never in the browser), so DATABASE_URL is safe here.
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
