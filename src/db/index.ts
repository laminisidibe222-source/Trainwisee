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
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and paste your Neon connection string ' +
      '(Neon dashboard → your project → Connect).'
  );
}

/**
 * The first request after an idle spell can lose its TCP connect (Neon compute
 * waking up, or a flaky IPv6 route). Those failures happen before the statement
 * reaches Postgres, so a single retry is safe and turns a 503 into a slow reply.
 */
const CONNECTION_FAILURE = /ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|fetch failed/i;

const describe = (err: unknown): string => {
  const e = err as { message?: string; code?: string; cause?: { code?: string; errors?: { code?: string }[] } };
  return [e?.message, e?.code, e?.cause?.code, ...(e?.cause?.errors ?? []).map((x) => x?.code)].filter(Boolean).join(' ');
};

const baseFetch = globalThis.fetch;
neonConfig.fetchFunction = async (input: string, init?: RequestInit) => {
  try {
    return await baseFetch(input, init);
  } catch (err) {
    if (!CONNECTION_FAILURE.test(describe(err))) throw err;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return baseFetch(input, init);
  }
};

/** Raw Neon HTTP client — use for statements Drizzle cannot express. */
export const sql = neon(url);

/** Drizzle query builder bound to the Neon HTTP driver. */
export const db = drizzle(sql, { schema });

export { schema };
