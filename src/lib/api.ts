import type { OnboardingData } from '../types/onboarding';
import type { Overview, BlueprintResponse, Plan } from '../types/blueprint';

/**
 * Thin client for the TrainWise API. The browser never sees DATABASE_URL —
 * every Neon query happens in `server/` behind these routes. Auth is a
 * httpOnly session cookie, so `credentials: 'same-origin'` is enough.
 */

const BASE = '/api';

export type User = { id: number; email: string; name: string | null };

class ApiError extends Error {
  status: number;
  issues?: { path: string; message: string }[];
  constructor(message: string, status: number, issues?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
    });
  } catch {
    throw new ApiError('API unreachable — is `npm run dev:api` running?', 0);
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      body?.error === 'database unavailable' || body?.error === 'database not configured'
        ? 'Neon is not reachable. Check DATABASE_URL in .env, then run `npm run db:push`.'
        : body?.error || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body?.issues);
  }

  return body as T;
}

/* ---------------- auth ---------------- */

export const signup = (email: string, password: string, name?: string) =>
  request<{ ok: true; user: User }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });

export const login = (email: string, password: string) =>
  request<{ ok: true; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const logout = () => request<{ ok: true }>('/auth/logout', { method: 'POST' });

export const getMe = () => request<{ ok: true; user: User | null }>('/auth/me');

/* ---------------- data ---------------- */

export async function getOverview(): Promise<Overview> {
  return request<Overview>('/overview');
}

export async function getHealth(): Promise<{ ok: boolean; db: string }> {
  return request('/health');
}

/** Validate + persist the profile and generate a blueprint, server-side. Requires sign-in. */
export async function createBlueprint(profile: OnboardingData): Promise<BlueprintResponse> {
  return request<BlueprintResponse>('/blueprint', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export type BlueprintSummary = {
  id: number;
  createdAt: string;
  modelVersion: string | null;
  goal: string | null;
};

/** A saved blueprint, shaped like the POST /api/blueprint response. */
export type SavedBlueprint = { id: number; createdAt: string; modelVersion: string | null; plan: Plan };

export async function getBlueprint(id: number): Promise<SavedBlueprint> {
  const res = await request<{
    ok: true;
    blueprint: Plan & { id: number; createdAt: string; modelVersion: string | null };
  }>(`/blueprint/${id}`);
  return {
    id: res.blueprint.id,
    createdAt: res.blueprint.createdAt,
    modelVersion: res.blueprint.modelVersion,
    plan: res.blueprint,
  };
}

export async function listBlueprints(): Promise<BlueprintSummary[]> {
  const res = await request<{ ok: true; blueprints: BlueprintSummary[] }>('/blueprints');
  return res.blueprints;
}

export { ApiError };

/* ---------------- dashboard ---------------- */

export type DashboardCheckin = { date: string; weightKg: number | null; energy: number | null };

export type DashboardData = {
  ok: true;
  user: User;
  totals: { plans: number; checkins: number };
  checkin: DashboardCheckin | null;
  latest: {
    id: number;
    createdAt: string;
    modelVersion: string | null;
    profile: { goal?: string } | null;
    plan: Plan;
  } | null;
  recent: BlueprintSummary[];
};

/** One request for the whole signed-in home. */
export async function getDashboard(): Promise<DashboardData> {
  return request<DashboardData>('/dashboard');
}
