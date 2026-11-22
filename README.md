# TrainWise

**Your body, decoded.** Answer a short quiz about your body, training and diet and get a
12-week training split, calorie and macro targets, a recovery protocol and a roadmap —
generated server-side and stored in Neon.

- Landing page + 4-step wizard + blueprint result, React 18 + TypeScript + Tailwind
- Express API with first-party email/password auth and httpOnly session cookies
- Neon Postgres through Drizzle ORM (`@neondatabase/serverless`, HTTP driver)
- Deterministic rules engine for the plan (`server/plan.ts`) — same input, same blueprint

## Requirements

- Node 20+
- A [Neon](https://neon.tech) project (the free tier is enough)

## Setup

```bash
npm install
cp .env.example .env        # then paste your Neon connection string
npm run db:push             # create users, sessions, profiles, blueprints, checkins, subscriptions
npm run dev                 # API on :8787, site on :3001 with /api proxied
```

`DATABASE_URL` comes from Neon → your project → **Connect** → the `postgresql://…`
URI. Use the **pooled** host (it ends in `-pooler`).

If `db:push` offers to truncate tables, stop: that means the schema changed in a
destructive way. Review the generated SQL with `npm run db:generate` instead.

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Neon connection string. Server-only — it is never sent to the browser. |
| `API_PORT` | no | Express port, default `8787`. Vite proxies `/api` here. |

Everything else in `.env.example` is a placeholder for features that are not built yet
(Clerk, Stripe, an LLM provider). Leaving them empty is correct.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | API (tsx watch) + Vite together |
| `npm run dev:api` / `dev:web` | one side only |
| `npm run build` | typecheck + production bundle in `dist/` |
| `npm start` | API only; also serves `dist/` when it exists |
| `npm run typecheck` | web **and** server typecheck |
| `npm run db:push` | apply `src/db/schema.ts` to Neon |
| `npm run db:studio` | Drizzle Studio against the same database |

## API

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/auth/signup` | — | email + password → account + session cookie |
| `POST /api/auth/login` | — | session cookie |
| `POST /api/auth/logout` | — | destroy the session row and clear the cookie |
| `GET /api/auth/me` | — | current user, or `null` |
| `POST /api/blueprint` | yes | validate profile, generate plan, upsert profile, insert blueprint |
| `GET /api/blueprints` | yes | your last 20 blueprints |
| `GET /api/blueprint/:id` | yes | one blueprint (404 if it is not yours) |
| `GET /api/health` | — | liveness + `select 1` against Neon |
| `GET /api/overview` | — | public counters and goal mix |

## Security notes

- Passwords: `scrypt` with a per-user salt, compared with `timingSafeEqual`.
- Sessions: 32-byte random token in an `httpOnly`, `SameSite=Lax` cookie; the database
  stores only the SHA-256 of the token, so a leaked dump cannot be replayed.
- The connection string is imported only by `server/` and `drizzle-kit`; the browser
  talks to `/api`. There is no fallback credential, so a missing `DATABASE_URL`
  fails loudly.
- Owner-scoped reads answer `404`, not `403`, so blueprint ids are not enumerable.
- Rate limiting on signup/login is in-memory per process — fine for one instance,
  replace it with Redis if you scale horizontally.

## Deploying

Run `npm run build`, then `npm start` behind HTTPS. The API serves `dist/` itself, so
one process is enough. Set `NODE_ENV=production` so the session cookie is marked
`Secure`, and set `DATABASE_URL` in the host's environment — never in the repo.

See [`OVERVIEW.md`](./OVERVIEW.md) for the product reasoning and the data model.
