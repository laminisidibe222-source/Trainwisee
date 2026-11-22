/**
 * npm run db:check — prove the Neon URL in .env works and show what is really
 * in the database. Read-only: no DDL, no writes, no secrets printed.
 */
import 'dotenv/config';
// Same client the API uses, so this check exercises the same retry behaviour.
import { sql } from '../src/db/index.js';

const EXPECTED = ['users', 'sessions', 'profiles', 'blueprints', 'checkins', 'subscriptions'];

const url = process.env.DATABASE_URL;
if (!url || !url.trim()) {
  console.error('DATABASE_URL is empty.');
  console.error('Open .env and paste the connection string from Neon → Connect.');
  process.exit(1);
}

/** Host only — never echo the user, password or query string. */
function safeHost(raw: string): string {
  try {
    const u = new URL(raw.replace(/^postgres(ql)?:\/\//, 'http://'));
    return u.hostname;
  } catch {
    return '(unreadable — is it a postgresql:// URL?)';
  }
}

const host = safeHost(url);
console.log(`host        ${host}${host.includes('-pooler') ? '   (pooled)' : '   (direct)'}`);
console.log(`sslmode     ${/sslmode=/.test(url) ? (url.match(/sslmode=([a-z]+)/)?.[1] ?? 'set') : 'driver default (require)'}`);

try {
  const t0 = Date.now();
  const [info] = (await sql`select current_database() as db, version() as v`) as {
    db: string;
    v: string;
  }[];
  const ms = Date.now() - t0;

  console.log(`database    ${info.db}`);
  console.log(`postgres    ${info.v.split(',')[0]}`);
  console.log(`latency     ${ms} ms round-trip\n`);

  const tables = (await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `) as { table_name: string }[];

  const present = tables.map((t) => t.table_name);

  if (!present.length) {
    console.log('No tables yet. Run:  npm run db:push');
    process.exit(0);
  }

  console.log('table              rows   status');
  for (const t of present) {
    // identifiers come from information_schema, and are whitelisted here anyway
    if (!/^[a-z_][a-z0-9_]*$/.test(t)) continue;
    const [row] = (await sql(`select count(*)::int as n from "${t}"`)) as { n: number }[];
    const known = EXPECTED.includes(t);
    console.log(`${t.padEnd(18)} ${String(row.n).padStart(5)}   ${known ? 'ok' : 'unexpected'}`);
  }

  const missing = EXPECTED.filter((t) => !present.includes(t));
  const indexes = (await sql`
    select indexname from pg_indexes where schemaname = 'public' order by indexname
  `) as { indexname: string }[];

  console.log(`\nindexes     ${indexes.length}`);
  for (const i of indexes) console.log(`  ${i.indexname}`);

  if (missing.length) {
    console.log(`\nMissing tables: ${missing.join(', ')}`);
    console.log('Run:  npm run db:push');
    process.exit(1);
  }

  console.log('\nEverything TrainWise needs is present.');
} catch (err) {
  const msg = String((err as Error)?.message ?? err);
  console.error(`\nConnection failed: ${msg}\n`);

  if (/password authentication failed/i.test(msg)) {
    console.error('The role or password in DATABASE_URL is wrong. Re-copy the string from Neon → Connect.');
  } else if (/ENOTFOUND|getaddrinfo|Failed to parse URL/i.test(msg)) {
    console.error('The host is wrong or unreachable. It should look like:');
    console.error('  postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require');
  } else if (/database .* does not exist/i.test(msg)) {
    console.error('That database name is not in this Neon project — check the end of the URL.');
  } else if (/timeout|ETIMEDOUT/i.test(msg)) {
    console.error('Timed out. Corporate networks sometimes block 5432; Neon’s pooled HTTP port 443 works instead.');
  } else if (/too many connections/i.test(msg)) {
    console.error('Use the pooled host (the one ending in -pooler).');
  }
  process.exit(1);
}
