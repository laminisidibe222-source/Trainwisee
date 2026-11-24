import type { Plan } from '../../types/blueprint';

/**
 * Derived views of a blueprint. Nothing here invents data: every number comes
 * from the plan the engine produced (sets, reps, macros, sleep target, week).
 */

/** "4" or "3–4" → 4. Sets are written as strings by the plan engine. */
const toNumber = (raw: string, fallback = 3) => {
  const match = String(raw).match(/\d+(?:[.,]\d+)?/g);
  if (!match) return fallback;
  // "3–4" means the top of the range, which is what weekly volume should use.
  return Math.max(...match.map((n) => Number(n.replace(',', '.'))));
};

export type DayVolume = {
  day: string;
  focus: string;
  /** Working sets of the first two (heavy compound) movements. */
  primary: number;
  /** Everything else in the session. */
  accessory: number;
  total: number;
  exercises: number;
  /** Rough session length: 7.5 min per movement, warm-up excluded. */
  minutes: number;
};

export function dayVolumes(plan: Plan): DayVolume[] {
  return plan.trainingPlan.days.map((d) => {
    const sets = d.exercises.map((e) => toNumber(e.sets));
    const total = sets.reduce((a, b) => a + b, 0);
    const primary = sets.slice(0, 2).reduce((a, b) => a + b, 0);
    return {
      day: d.day,
      focus: d.focus,
      primary,
      accessory: total - primary,
      total,
      exercises: d.exercises.length,
      minutes: Math.round(d.exercises.length * 7.5),
    };
  });
}

export const weeklySets = (days: DayVolume[]) => days.reduce((a, d) => a + d.total, 0);

export type Dial = { key: string; pct: number; value: string };

/** Six honest gauges: macro split, intake vs expenditure, sleep, block progress. */
export function planDials(plan: Plan, week: number): Dial[] {
  const n = plan.nutritionPlan;
  const share = (grams: number, kcalPerGram: number) =>
    n.kcal > 0 ? Math.round(((grams * kcalPerGram) / n.kcal) * 100) : 0;
  const tdeeRatio = n.tdee > 0 ? Math.round((n.kcal / n.tdee) * 100) : 0;
  const sleep = plan.recoveryPlan.sleepTarget;

  return [
    { key: 'protein', pct: share(n.proteinG, 4), value: `${n.proteinG} g` },
    { key: 'carbs', pct: share(n.carbsG, 4), value: `${n.carbsG} g` },
    { key: 'fat', pct: share(n.fatG, 9), value: `${n.fatG} g` },
    { key: 'intake', pct: Math.min(100, tdeeRatio), value: `${tdeeRatio} %` },
    { key: 'sleep', pct: Math.min(100, Math.round((sleep / 9) * 100)), value: `${sleep} h` },
    { key: 'block', pct: Math.min(100, Math.round((week / 12) * 100)), value: `${week}/12` },
  ];
}

export type SearchHit = { exercise: string; day: string; focus: string };

/** Search across the split, so the header field does something real. */
export function searchPlan(plan: Plan, query: string, limit = 6): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const d of plan.trainingPlan.days) {
    for (const e of d.exercises) {
      if (e.name.toLowerCase().includes(q) || d.focus.toLowerCase().includes(q) || d.day.toLowerCase().includes(q)) {
        hits.push({ exercise: e.name, day: d.day, focus: d.focus });
        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}
