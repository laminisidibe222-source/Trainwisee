/** Shared shape of a generated Body Blueprint (client + server). Pure types, no runtime imports. */

export type Exercise = { name: string; sets: string; reps: string };

export type TrainingDay = { day: string; focus: string; exercises: Exercise[] };

export type Plan = {
  trainingPlan: {
    split: string;
    frequency: number;
    days: TrainingDay[];
    progression: string;
    /** Exercises swapped because of a flagged joint. Empty when none apply. */
    substitutions?: { from: string; to: string; injury: string }[];
  };
  nutritionPlan: {
    bmr: number;
    tdee: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    meals: { name: string; kcal: number; proteinG: number; note: string }[];
  };
  recoveryPlan: {
    sleepTarget: number;
    deloadEveryWeeks: number;
    cardio: string;
    readinessCheck: string;
  };
  roadmap: { weeks: string; focus: string; milestone: string }[];
  modelVersion: string;
};

export type Overview = {
  ok: true;
  totals: { profiles: number; blueprints: number; accounts: number };
  goalMix: { goal: string; n: number }[];
  latestKcal: number | null;
  ts: string;
};

export type BlueprintResponse = {
  ok: true;
  id: number;
  createdAt: string;
  blueprint: Plan;
};
