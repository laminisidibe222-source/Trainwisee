# TrainWise — what the SaaS does

**One line:** answer a short quiz about your body, training and diet; get a personalised
12-week training split, calorie/macro targets, a recovery protocol and a roadmap —
generated and stored in Neon in a couple of seconds.

---

## The problem

Generic programs fail because they ignore the four things that actually determine
whether training works:

1. **Who you are** — age, sex, height, weight, body-fat, training experience
2. **What you can access** — barbell gym, dumbbells at home, cables, machines, or nothing
3. **What you'll actually eat** — diet preference, allergies, budget
4. **How you recover** — sleep, injuries, stress

Coaches solve this manually and cost €150+/month. A PDF template costs €20 and is
wrong for almost everyone. TrainWise sits in between: automated, specific, and cheap.

---

## Who it's for

| Segment | Typical ask | What they get |
|---|---|---|
| **Busy beginner** | "I have no idea where to start" | 3-day full-body plan, simple calorie target |
| **Intermediate lifter** | "I've plateaued" | 4-day upper/lower, double progression rules |
| **Cutter / recomp** | "Keep muscle while losing fat" | Deficit + protein floor + cardio plan |
| **Home trainer** | "I only have dumbbells" | Equipment-filtered plan, bodyweight fallbacks |

---

## The user journey

```
Landing page  ─▶  4-step wizard  ─▶  POST /api/blueprint  ─▶  Blueprint screen
                                        │
                                        ├─ validate profile (zod)
                                        ├─ generate plan (rules engine, v0)
                                        └─ INSERT profile + blueprint into Neon
```

### The wizard (4 steps)

1. **Biometrics** — age, sex, height, weight, body-fat
2. **Goal & experience** — hypertrophy / fat loss / recomp / performance; beginner → advanced
3. **Equipment** — barbell, dumbbell, rack, cables, machines, bodyweight (multi-select)
4. **Nutrition & recovery** — diet preference, sleep hours, allergies, budget

### What comes out

- **Nutrition** — BMR (Mifflin–St Jeor) → TDEE (activity multiplier) → goal-adjusted
  calories → protein/fat/carb split → 4 meal slots with per-meal kcal and protein.
- **Training** — split chosen by experience (full-body ×3, upper/lower ×4, PPL ×5),
  filtered by available equipment (4+ missing → bodyweight program), with sets/reps
  per exercise and a progression rule that matches the goal.
- **Recovery** — sleep target, deload cadence, cardio prescription, readiness check.
- **Roadmap** — 4 phases across 12 weeks with a measurable milestone each.

`modelVersion` is stored on every blueprint, so a rules-based v0 and a future
LLM-generated v1 can coexist without ambiguity about which produced a given plan.

---

## Monetisation (as marketed on the landing page)

- **Free** — the blueprint quiz and a summary plan
- **Pro** — full 12-week plan, meal plan with grocery list, PDF export, re-generation
  after each check-in
- **Coach** — multi-client dashboard on the same schema

`subscriptions` in the database tracks plan/status/Stripe customer and period end.

---

## Data model

| Table | Purpose |
|---|---|
| `users` | account identity (currently `clerk_id`); one row per person |
| `profiles` | latest biometrics, goal, equipment, diet, recovery inputs |
| `blueprints` | immutable snapshot: inputs (`profile_snapshot`) + outputs (`training_plan`, `nutrition_plan`, `recovery_plan`, `roadmap`) + `model_version` |
| `checkins` | periodic weight/energy/adherence — the input to re-generation |
| `subscriptions` | plan, status, Stripe IDs, billing period |

Design notes:

- `blueprints` stores the **input snapshot as well as the output**, so a plan is
  reproducible after the profile changes. You can always answer "why did it say that?"
- Plans live in `jsonb` because their shape evolves; the relational columns stay
  stable and queryable.
- `checkins` is the retention loop: each row is a chance to regenerate.

---

## How Neon is wired

```
browser  ──fetch /api/*──▶  Vite dev proxy  ──▶  Express (server/index.ts)  ──▶  Neon Postgres
                                                     @neondatabase/serverless
                                                     drizzle-orm/neon-http
```
**Security:** the database client (`src/db/index.ts`) is imported only by
`server/` and drizzle-kit. It has no default credential and throws if
`DATABASE_URL` is missing. Nothing Neon-related is bundled into the browser build —
the SPA only ever sees `/api`, and Vite proxies that to the API process in dev.

**Why the HTTP driver:** `neon-http` talks to Postgres over `fetch`, so there is no
TCP pool to exhaust on a serverless host, and the database scales to zero between
users. On a long-running Node server it is still fine — a request per query.

### Endpoints

| Method | Route | Does |
|---|---|---|
| `POST` | `/api/blueprint` | zod-validate profile → generate → insert `profiles` + `blueprints` → return plan + id |
| `GET` | `/api/blueprint/:id` | re-hydrate a stored blueprint |
| `GET` | `/api/overview` | profile/blueprint counts, goal mix, latest calorie target |
| `GET` | `/api/health` | `select 1` against Neon |

All input is validated server-side with the same zod schema the client uses
(`src/types/onboarding.ts`), so a malformed body cannot reach a query.

---

## Authentication

Email + password, first-party, no external service required.

| Route | Behaviour |
|---|---|
| `POST /api/auth/signup` | 8+ char password with a letter and a number; 409 if the email exists |
| `POST /api/auth/login` | generic "Email or password is incorrect" — never reveals whether an account exists |
| `POST /api/auth/logout` | deletes the session row and clears the cookie |
| `GET /api/auth/me` | current user, or `null` when signed out (used to restore the session on load) |

**Storage:** `users.password_hash` holds `scrypt$<salt>$<64-byte key>` from `node:crypto`.
`users.clerk_id` is nullable, so Clerk can be layered on later without a migration.

**Sessions:** a 32-byte random token lives in the `tw_session` cookie (httpOnly,
SameSite=Lax, 30 days, `Secure` when `NODE_ENV=production`). The `sessions` table
stores only the token's SHA-256 — a database leak does not yield usable sessions.
Expired rows are swept on each login.

**Guards:**
- `POST /api/blueprint`, `GET /api/blueprints`, `GET /api/blueprint/:id` all require a
  session and are scoped to the owner; another user's id returns `404`, not `403`, so
  ids cannot be probed.
- Login and signup are rate limited in memory (10 attempts / 15 min per IP, plus per
  IP+email for login). Single-process only — swap for Redis if you scale out.
- Passwords are never logged, and validation is repeated server-side even though the
  form validates too.

**Known gap:** no CSRF token. SameSite=Lax plus a JSON-only API covers the usual
cross-site form post, but add a token before exposing any state-changing GET or
serving multiple subdomains.

---

## Running it

```bash
npm install
cp .env.example .env      # paste your Neon connection string into DATABASE_URL
npm run db:push           # create users/profiles/blueprints/checkins/subscriptions
npm run dev               # API on :8787 + site on :3001 (proxy wired)
```

Without `DATABASE_URL` the API refuses to start with a clear message rather than
silently writing nowhere; with it set but wrong, endpoints return `503` and the UI
shows a toast explaining how to fix it.

`npm run db:studio` opens Drizzle Studio on the same database when you want to look
at the rows.

---

## Not built yet

- **Clerk** — `users.clerk_id` is in place for it, and `.env.example` keeps the keys,
  but the app currently uses local email/password accounts.
- **Password reset / email verification** — no mailer is wired up, so a forgotten
  password currently means a new account.
- **LLM generation** — the rules engine is v0; `modelVersion` exists so a model-backed
  generator can replace it without a migration.
- **PDF export** and **check-in driven regeneration** — both are Pro features and
  both need the `checkins` table populated first.
- **Real payments** — `subscriptions` is a schema waiting for Stripe webhooks.
