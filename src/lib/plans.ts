import type { TKey } from '../i18n';

export type PlanId = 'starter' | 'pro' | 'coached';

/**
 * One source of truth for the paid forfaits. Amounts are XOF because that is
 * what SasPay charges; the UI formats them per language.
 */
export const PLANS: {
  id: PlanId;
  amount: number;
  nameKey: TKey;
  descKey: TKey;
  popular: boolean;
}[] = [
  { id: 'starter', amount: 9900, nameKey: 'landing.pricing.p1.name', descKey: 'landing.pricing.p1.desc', popular: false },
  { id: 'pro', amount: 19900, nameKey: 'landing.pricing.p2.name', descKey: 'landing.pricing.p2.desc', popular: true },
  { id: 'coached', amount: 49900, nameKey: 'landing.pricing.p3.name', descKey: 'landing.pricing.p3.desc', popular: false },
];

export const isPlanId = (value: string | null | undefined): value is PlanId =>
  value === 'starter' || value === 'pro' || value === 'coached';

export const planAmount = (id: PlanId) => PLANS.find((p) => p.id === id)?.amount ?? 0;

/** 19900 → "19 900" in French, "19,900" in English. */
export const money = (amount: number, lang: 'en' | 'fr') =>
  amount.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB');
