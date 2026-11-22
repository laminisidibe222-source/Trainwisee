import { pgTable, serial, text, timestamp, jsonb, integer, boolean, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  // nullable: local email/password accounts have no Clerk id yet
  clerkId: text('clerk_id').unique(),
  email: text('email').unique().notNull(),
  name: text('name'),
  // scrypt$<salt>$<hash> — see server/auth.ts. Null means "OAuth/Clerk only".
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/** Server-side sessions. The cookie carries a random token; only its SHA-256 is stored. */
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').unique().notNull(),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  age: integer('age'),
  sex: text('sex'),
  heightCm: doublePrecision('height_cm'),
  weightKg: doublePrecision('weight_kg'),
  bodyfatPct: doublePrecision('bodyfat_pct'),
  goal: text('goal'),
  activityLevel: text('activity_level'),
  experience: text('experience'),
  equipment: jsonb('equipment'),
  injuries: jsonb('injuries'),
  sleepHours: integer('sleep_hours'),
  dietPreference: text('diet_preference'),
  allergies: jsonb('allergies'),
  budget: text('budget'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const blueprints = pgTable('blueprints', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  profileSnapshot: jsonb('profile_snapshot').notNull(),
  trainingPlan: jsonb('training_plan').notNull(),
  nutritionPlan: jsonb('nutrition_plan').notNull(),
  recoveryPlan: jsonb('recovery_plan').notNull(),
  roadmap: jsonb('roadmap').notNull(),
  modelVersion: text('model_version'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const checkins = pgTable('checkins', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  weightKg: doublePrecision('weight_kg'),
  energy: integer('energy'),
  adherence: integer('adherence'),
  notes: text('notes'),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  plan: text('plan').notNull(),
  status: text('status').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  currentPeriodEnd: timestamp('current_period_end'),
});
