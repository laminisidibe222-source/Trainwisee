/**
 * TrainWise API — the only process that talks to Neon.
 *
 *   POST /api/auth/signup    email + password → account + session cookie
 *   POST /api/auth/login     email + password → session cookie
 *   POST /api/auth/logout    destroy session
 *   GET  /api/auth/me        current user (null when signed out)
 *   POST /api/blueprint      (auth) validate profile → store profile + plan → return plan
 *   GET  /api/blueprint/:id  (auth) fetch one of your blueprints
 *   GET  /api/blueprints     (auth) list your blueprints
 *   GET  /api/overview       public counters
 *   GET  /api/health         liveness + Neon reachability
 *
 * This module only builds the app. `server/index.ts` listens locally; on Vercel
 * `api/[...path].ts` exports it as a serverless function. Imports stay static and
 * extension-less so both tsx and the Vercel bundler resolve them the same way.
 */
import 'dotenv/config';
import express from 'express';
import { eq, and, gt, lt, desc, count } from 'drizzle-orm';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { db, sql as neon } from '../src/db/index.js';
import { users, profiles, blueprints, sessions } from '../src/db/schema.js';
import { generateBlueprint } from './plan.js';
import { onboardingSchema } from '../src/types/onboarding.js';
import {
  SESSION_COOKIE,
  hashPassword,
  verifyPassword,
  newToken,
  hashToken,
  sessionExpiry,
  readCookie,
  setSessionCookie,
  clearSessionCookie,
  allowAttempt,
  EMAIL_RE,
  passwordProblem,
  attachUser,
  requireUser,
} from './auth.js';
import type { AuthedRequest } from './auth.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

export const app = express();
app.disable('x-powered-by');
// Behind Vercel (or any single reverse proxy) req.ip is the proxy address, which
// would make the rate limiter one global bucket. Trust exactly one hop there.
if (process.env.VERCEL) app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));

/* ---------------- session plumbing ---------------- */

/** Resolve a session token hash to its user, or null when invalid/expired. */
async function userForSession(tokenHash: string) {
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name };
}

// Only API calls need a session lookup — a Neon round-trip per static asset
// would be slow and expensive once `dist/` is served from this process.
const withUser = attachUser(userForSession);
app.use((req, res, next) => (req.path.startsWith('/api/') ? withUser(req, res, next) : next()));

async function createSession(userId: number, userAgent: string | undefined) {
  const { token, tokenHash } = newToken();
  await db.insert(sessions).values({
    id: hashToken(token).slice(0, 32),
    userId,
    tokenHash,
    userAgent: userAgent?.slice(0, 250) ?? null,
    expiresAt: sessionExpiry(),
  });
  // cheap housekeeping: drop expired sessions while we are here
  db.delete(sessions)
    .where(lt(sessions.expiresAt, new Date()))
    .catch((err) => console.error('[sessions] cleanup failed', err));
  return token;
}

const publicUser = (u: { id: number; email: string; name: string | null }) => ({
  id: u.id,
  email: u.email,
  name: u.name,
});

/* ---------------- auth routes ---------------- */

app.post('/api/auth/signup', async (req, res) => {
  if (!allowAttempt(`signup:${req.ip}`)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }

  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = req.body?.password;
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 80) : null;

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  const pwProblem = passwordProblem(password);
  if (pwProblem) return res.status(400).json({ error: pwProblem });

  try {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) return res.status(409).json({ error: 'That email already has an account. Sign in instead.' });

    const [created] = await db
      .insert(users)
      .values({ email, name, passwordHash: await hashPassword(password) })
      .returning({ id: users.id, email: users.email, name: users.name });

    const token = await createSession(created.id, req.headers['user-agent']);
    setSessionCookie(res, token);
    res.status(201).json({ ok: true, user: publicUser(created) });
  } catch (err) {
    console.error('[signup]', err);
    res.status(503).json({ error: 'Could not create the account — is Neon reachable?' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = req.body?.password;

  if (!allowAttempt(`login:${req.ip}:${email}`, 10, 15 * 60_000)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }
  if (!EMAIL_RE.test(email) || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const ok = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !ok) {
      // Same message either way — never reveal whether an email exists.
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    const token = await createSession(user.id, req.headers['user-agent']);
    setSessionCookie(res, token);
    res.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    console.error('[login]', err);
    res.status(503).json({ error: 'Could not sign in — is Neon reachable?' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) {
    try {
      await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
    } catch (err) {
      console.error('[logout]', err);
    }
  }
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = (req as AuthedRequest).user;
  res.json({ ok: true, user: user ? publicUser(user) : null });
});

/* ---------------- blueprint routes ---------------- */

app.post('/api/blueprint', async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;

  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid profile',
      issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  const p = parsed.data;

  try {
    const plan = generateBlueprint(p);

    const profileValues = {
      age: p.age,
      sex: p.sex,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
      bodyfatPct: p.bodyfatPct ?? null,
      goal: p.goal,
      activityLevel: p.activityLevel,
      experience: p.experience,
      equipment: p.equipment,
      injuries: p.injuries ?? [],
      sleepHours: p.sleepHours,
      dietPreference: p.dietPreference,
      allergies: p.allergies ?? [],
      budget: p.budget,
      updatedAt: new Date(),
    };

    // One profile per user. The unique key on user_id makes this a single atomic
    // statement, so two requests at once can no longer create two rows.
    await db
      .insert(profiles)
      .values({ userId: user.id, ...profileValues })
      .onConflictDoUpdate({ target: profiles.userId, set: profileValues });

    const [saved] = await db
      .insert(blueprints)
      .values({
        userId: user.id,
        profileSnapshot: p,
        trainingPlan: plan.trainingPlan,
        nutritionPlan: plan.nutritionPlan,
        recoveryPlan: plan.recoveryPlan,
        roadmap: plan.roadmap,
        modelVersion: plan.modelVersion,
      })
      .returning({ id: blueprints.id, createdAt: blueprints.createdAt });

    res.status(201).json({ ok: true, id: saved.id, createdAt: saved.createdAt, blueprint: plan });
  } catch (err) {
    console.error('[blueprint]', err);
    res.status(503).json({ ok: false, error: 'could not save the blueprint — is Neon reachable?' });
  }
});

app.get('/api/blueprints', async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;

  try {
    const rows = await db
      .select({
        id: blueprints.id,
        createdAt: blueprints.createdAt,
        modelVersion: blueprints.modelVersion,
        goal: blueprints.profileSnapshot,
      })
      .from(blueprints)
      .where(eq(blueprints.userId, user.id))
      .orderBy(desc(blueprints.createdAt))
      .limit(20);

    res.json({
      ok: true,
      blueprints: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        modelVersion: r.modelVersion,
        goal: (r.goal as { goal?: string } | null)?.goal ?? null,
      })),
    });
  } catch (err) {
    console.error('[blueprints]', err);
    res.status(503).json({ ok: false, error: 'database unavailable' });
  }
});

app.get('/api/blueprint/:id', async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'bad id' });

  try {
    const [row] = await db
      .select()
      .from(blueprints)
      .where(and(eq(blueprints.id, id), eq(blueprints.userId, user.id)))
      .limit(1);

    // 404 rather than 403: do not confirm other people's blueprint ids.
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true, blueprint: row });
  } catch (err) {
    console.error('[blueprint:get]', err);
    res.status(503).json({ ok: false, error: 'database unavailable' });
  }
});

/* ---------------- public routes ---------------- */

app.get('/api/health', async (_req, res) => {
  try {
    await neon`select 1`;
    res.json({ ok: true, db: 'up', ts: new Date().toISOString() });
  } catch (err) {
    // Log the detail, never ship it: it contains the Neon host.
    console.error('[health]', err);
    res.status(503).json({ ok: false, db: 'down' });
  }
});

app.get('/api/overview', async (_req, res) => {
  try {
    const [[accountCount], [blueprintCount]] = await Promise.all([
      db.select({ n: count() }).from(users),
      db.select({ n: count() }).from(blueprints),
    ]);

    const goals = await neon`
      select goal, count(*)::int as n
      from profiles
      where goal is not null
      group by goal
      order by n desc
    `;

    res.json({
      ok: true,
      totals: {
        accounts: Number(accountCount.n),
        blueprints: Number(blueprintCount.n),
      },
      goalMix: goals.map((r) => ({ goal: String(r.goal), n: Number(r.n) })),
      ts: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[overview]', err);
    res.status(503).json({ ok: false, error: 'database unavailable' });
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));

/* Serve the built SPA locally (`npm start`); on Vercel the CDN handles `dist/`. */
const dist = join(root, 'dist');
if (!process.env.VERCEL && existsSync(dist)) app.use(express.static(dist));

/* Malformed JSON and other thrown errors answer in JSON, never an HTML page. */
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (res.headersSent) return;
  const status = (err as { status?: number; statusCode?: number })?.status ?? (err as { statusCode?: number })?.statusCode;
  if (status === 400) return res.status(400).json({ ok: false, error: 'Invalid JSON body.' });
  console.error('[unhandled]', err);
  res.status(500).json({ ok: false, error: 'Unexpected server error.' });
});

export default app;
