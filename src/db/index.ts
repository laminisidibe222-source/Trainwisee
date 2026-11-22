/**
 * Neon Postgres client (SERVER ONLY).
 *
 * This file is imported by `server/index.ts` and by drizzle-kit — never by
 * anything under `src/` that reaches the browser. The connection string would
 * be public in a client bundle, so there is no localhost fallback and no
 * default credential of any kind: it throws instead.
 *
 *   import { db } from '../src/db';        // server only
 *   await db.select().from(blueprints);
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and paste your Neon connection string ' +
      '(Neon dashboard → your project → Connect).'
  );
}

/** Raw Neon HTTP client — use for statements Drizzle cannot express. */
export const sql = neon(url);

/** Drizzle query builder bound to the Neon HTTP driver. */
export const db = drizzle(sql, { schema });

export { schema };
