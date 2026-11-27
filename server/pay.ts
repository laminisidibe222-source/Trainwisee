/**
 * SasPay checkout — the only place TrainWise touches real money.
 *
 *   createCheckout(user, planId) → { url }   hosted SasPay page
 *   applyWebhook(rawBody, headers)            flips the pending row
 *
 * The API key lives in `SASPAY_API_KEY` and never reaches the browser. Amounts
 * are in XOF, the currency SasPay settles for Senegal, and match the prices the
 * landing page shows.
 */
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { subscriptions } from '../src/db/schema.js';

const BASE = (process.env.SASPAY_BASE_URL ?? 'https://api.saspay.me/api/v1').replace(/\/+$/, '');

export const PLANS = {
  starter: { amount: 9900, label: 'TrainWise Starter — programme complet' },
  pro: { amount: 19900, label: 'TrainWise Pro — programmes illimités' },
  coached: { amount: 49900, label: 'TrainWise Coaching — programme + bilan' },
} as const;

export type PlanId = keyof typeof PLANS;

export const isPlanId = (value: unknown): value is PlanId =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(PLANS, value);

const appBase = () =>
  (process.env.APP_URL ?? process.env.VITE_APP_URL ?? 'http://localhost:3001').replace(/\/+$/, '');

export async function createCheckout(
  user: { id: number; email: string; name: string | null },
  planId: PlanId,
) {
  const apiKey = process.env.SASPAY_API_KEY;
  if (!apiKey) {
    return { ok: false as const, status: 503, error: 'Payments are not configured yet.' };
  }

  const plan = PLANS[planId];

  // The pending row is what the webhook later activates, so the plan the user
  // paid for is recorded before they ever leave the site.
  const [row] = await db
    .insert(subscriptions)
    .values({ userId: user.id, plan: planId, status: 'pending', provider: 'saspay' })
    .returning({ id: subscriptions.id });

  try {
    const res = await fetch(`${BASE}/checkout-sessions/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `trainwise-${planId}-${user.id}-${row.id}`,
      },
      body: JSON.stringify({
        amount: plan.amount.toFixed(2),
        currency: 'XOF',
        country: 'SN',
        description: plan.label,
        customer_email: user.email,
        customer_name: user.name || 'TrainWise member',
        return_url: `${appBase()}/app?checkout=success&plan=${planId}`,
        metadata: { plan: planId, user_id: user.id, subscription_id: row.id },
      }),
    });

    const payload = (await res.json().catch(() => null)) as
      | { data?: { id?: string; checkout_url?: string } }
      | null;
    const sessionId = payload?.data?.id ?? null;
    const url = payload?.data?.checkout_url ?? null;

    if (!res.ok || !sessionId || !url) {
      console.error('[pay] SasPay refused the session:', JSON.stringify(payload));
      await db.update(subscriptions).set({ status: 'failed' }).where(eq(subscriptions.id, row.id));
      return { ok: false as const, status: 502, error: 'The payment provider could not start the checkout.' };
    }

    await db
      .update(subscriptions)
      .set({ providerToken: sessionId })
      .where(eq(subscriptions.id, row.id));

    return { ok: true as const, url };
  } catch (err) {
    console.error('[pay] error:', err);
    await db.update(subscriptions).set({ status: 'failed' }).where(eq(subscriptions.id, row.id));
    return { ok: false as const, status: 502, error: 'The payment provider is unreachable.' };
  }
}

type WebhookResult = { ok: boolean; status: number; body: Record<string, unknown> };

export async function applyWebhook(
  rawBody: Buffer,
  headers: { signature?: string; timestamp?: string },
): Promise<WebhookResult> {
  const secret = process.env.SASPAY_WEBHOOK_SECRET;
  if (!secret) return { ok: false, status: 503, body: { error: 'Webhook secret missing.' } };

  const { signature, timestamp } = headers;
  if (!signature || !timestamp) return { ok: false, status: 401, body: { error: 'Missing signature.' } };

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
    return { ok: false, status: 401, body: { error: 'Timestamp outside the 5-minute window.' } };
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex');
  const given = Buffer.from(String(signature), 'utf8');
  const want = Buffer.from(expected, 'utf8');
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    return { ok: false, status: 401, body: { error: 'Signature mismatch.' } };
  }

  let parsed: { event?: string; data?: Record<string, unknown> } | null = null;
  try {
    parsed = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return { ok: false, status: 400, body: { error: 'Malformed JSON.' } };
  }

  const event = parsed?.event ?? '';
  const data = parsed?.data ?? {};
  const status =
    event === 'transaction.success' ? 'active' : event === 'transaction.cancelled' ? 'cancelled' : event === 'transaction.failed' ? 'failed' : null;
  if (!status) return { ok: true, status: 200, body: { received: true, ignored: event } };

  const sessionId = (data.checkout_session_id ?? data.id ?? null) as string | null;
  if (!sessionId) return { ok: true, status: 200, body: { received: true, matched: 0 } };

  const updated = await db
    .update(subscriptions)
    .set({
      status,
      currentPeriodEnd: status === 'active' ? new Date(Date.now() + 30 * 86_400_000) : null,
    })
    .where(eq(subscriptions.providerToken, sessionId))
    .returning({ id: subscriptions.id });

  return { ok: true, status: 200, body: { received: true, matched: updated.length } };
}
