/**
 * Deterministic Body Blueprint generator (v0).
 *
 * Pure functions: the same onboarding profile always produces the same plan,
 * which makes the output testable and keeps the door open for swapping in an
 * LLM later (the shape is what the client renders, not the method).
 */
import type { OnboardingData } from '../src/types/onboarding';
import type { Plan as Blueprint } from '../src/types/blueprint';

type Day = Blueprint['trainingPlan']['days'][number];

export type { Blueprint };

const ACTIVITY: Record<OnboardingData['activityLevel'], number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  athlete: 1.9,
};

const GOAL_KCAL: Record<OnboardingData['goal'], number> = {
  build_muscle: 1.1,
  lose_fat: 0.8,
  recomp: 0.92,
  athletic_performance: 1.02,
};

const GOAL_LABEL: Record<OnboardingData['goal'], string> = {
  build_muscle: 'Hypertrophy',
  lose_fat: 'Fat loss',
  recomp: 'Recomposition',
  athletic_performance: 'Athletic performance',
};

const round = (n: number, step = 10) => Math.round(n / step) * step;

const BODYWEIGHT_DAY: Day = {
  day: 'Bodyweight',
  focus: 'Movement / core',
  exercises: [
    { name: 'Push-up', sets: '3', reps: '12-20' },
    { name: 'Inverted row', sets: '3', reps: '8-12' },
    { name: 'Split squat', sets: '3', reps: '10 / leg' },
    { name: 'Hollow hold', sets: '3', reps: '30s' },
  ],
};

const SPLITS: Record<OnboardingData['experience'], { name: string; days: Day[] }> = {
  beginner: {
    name: 'Full body × 3',
    days: [
      {
        day: 'Day A',
        focus: 'Squat / press',
        exercises: [
          { name: 'Back squat', sets: '3', reps: '6-8' },
          { name: 'Bench press', sets: '3', reps: '6-8' },
          { name: 'Row', sets: '3', reps: '8-10' },
          { name: 'Hanging leg raise', sets: '2', reps: '10' },
        ],
      },
      {
        day: 'Day B',
        focus: 'Hinge / pull',
        exercises: [
          { name: 'Romanian deadlift', sets: '3', reps: '8-10' },
          { name: 'Overhead press', sets: '3', reps: '6-8' },
          { name: 'Lat pulldown', sets: '3', reps: '10-12' },
          { name: 'Plank', sets: '3', reps: '40s' },
        ],
      },
      {
        day: 'Day C',
        focus: 'Volume / accessory',
        exercises: [
          { name: 'Leg press', sets: '3', reps: '12' },
          { name: 'Incline dumbbell press', sets: '3', reps: '10' },
          { name: 'Cable row', sets: '3', reps: '12' },
          { name: 'Lateral raise', sets: '3', reps: '15' },
        ],
      },
    ],
  },
  intermediate: {
    name: 'Upper / lower × 4',
    days: [
      {
        day: 'Upper A',
        focus: 'Strength',
        exercises: [
          { name: 'Bench press', sets: '4', reps: '4-6' },
          { name: 'Barbell row', sets: '4', reps: '6-8' },
          { name: 'Overhead press', sets: '3', reps: '8' },
          { name: 'Face pull', sets: '3', reps: '15' },
        ],
      },
      {
        day: 'Lower A',
        focus: 'Squat',
        exercises: [
          { name: 'Back squat', sets: '4', reps: '4-6' },
          { name: 'Romanian deadlift', sets: '3', reps: '8' },
          { name: 'Leg curl', sets: '3', reps: '12' },
          { name: 'Calf raise', sets: '4', reps: '12' },
        ],
      },
      {
        day: 'Upper B',
        focus: 'Hypertrophy',
        exercises: [
          { name: 'Incline dumbbell press', sets: '4', reps: '8-10' },
          { name: 'Lat pulldown', sets: '4', reps: '10' },
          { name: 'Cable fly', sets: '3', reps: '15' },
          { name: 'Dumbbell curl', sets: '3', reps: '12' },
        ],
      },
      {
        day: 'Lower B',
        focus: 'Hinge',
        exercises: [
          { name: 'Conventional deadlift', sets: '3', reps: '5' },
          { name: 'Front squat', sets: '3', reps: '8' },
          { name: 'Hip thrust', sets: '3', reps: '12' },
          { name: 'Ab wheel', sets: '3', reps: '10' },
        ],
      },
    ],
  },
  advanced: {
    name: 'Push / pull / legs × 5',
    days: [
      {
        day: 'Push',
        focus: 'Chest / delts / triceps',
        exercises: [
          { name: 'Bench press', sets: '5', reps: '3-5' },
          { name: 'Incline dumbbell press', sets: '4', reps: '8' },
          { name: 'Lateral raise', sets: '4', reps: '12-15' },
          { name: 'Rope pushdown', sets: '3', reps: '12' },
        ],
      },
      {
        day: 'Pull',
        focus: 'Back / biceps',
        exercises: [
          { name: 'Weighted pull-up', sets: '4', reps: '6-8' },
          { name: 'Barbell row', sets: '4', reps: '6' },
          { name: 'Chest-supported row', sets: '3', reps: '10' },
          { name: 'Incline curl', sets: '3', reps: '12' },
        ],
      },
      {
        day: 'Legs A',
        focus: 'Squat pattern',
        exercises: [
          { name: 'Back squat', sets: '5', reps: '3-5' },
          { name: 'Pause squat', sets: '3', reps: '5' },
          { name: 'Leg extension', sets: '3', reps: '15' },
          { name: 'Calf raise', sets: '4', reps: '12' },
        ],
      },
      {
        day: 'Legs B',
        focus: 'Hinge pattern',
        exercises: [
          { name: 'Deadlift', sets: '4', reps: '3-5' },
          { name: 'Romanian deadlift', sets: '3', reps: '8' },
          { name: 'Leg curl', sets: '4', reps: '10' },
          { name: 'Hanging leg raise', sets: '4', reps: '12' },
        ],
      },
      {
        day: 'Upper pump',
        focus: 'Volume / weak points',
        exercises: [
          { name: 'Cable fly', sets: '4', reps: '15' },
          { name: 'Lat pulldown', sets: '4', reps: '12' },
          { name: 'Rear delt fly', sets: '4', reps: '15' },
          { name: 'Neck / grip', sets: '3', reps: '12' },
        ],
      },
    ],
  },
};

export function generateBlueprint(p: OnboardingData): Blueprint {
  /* ---- energy ---- */
  const sexOffset = p.sex === 'male' ? 5 : p.sex === 'female' ? -161 : -78;
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + sexOffset;
  const tdee = bmr * ACTIVITY[p.activityLevel];
  // Safety floor: never prescribe below the sensible deficit limit.
  const floorKcal = p.sex === 'female' ? 1200 : 1500;
  const kcal = Math.max(round(tdee * GOAL_KCAL[p.goal], 50), p.goal === 'lose_fat' ? floorKcal : 0);

  /* ---- macros ---- */
  const proteinPerKg = p.goal === 'lose_fat' ? 2.3 : p.goal === 'build_muscle' ? 2.0 : 2.1;
  const proteinG = Math.round(p.weightKg * proteinPerKg);
  const fatG = Math.round((kcal * 0.27) / 9);
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));

  const mealSplit = [0.28, 0.32, 0.3, 0.1];
  const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Pre/post session'];
  const meals = mealSplit.map((share, i) => ({
    name: mealNames[i],
    kcal: round(kcal * share, 10),
    proteinG: Math.round(proteinG * share),
    note: i === 3 ? 'Around training — fast carbs + whey' : 'Whole-food anchor, 30 g+ protein',
  }));

  /* ---- training ---- */
  const base = SPLITS[p.experience];
  const has = (eq: string) => p.equipment.includes(eq);
  const heavyGear = ['barbell', 'dumbbell', 'rack', 'cables', 'machines'].filter(has).length;
  const bodyweightOnly = heavyGear === 0;
  const needsDumbbellSwap = !has('barbell') && !has('rack') && has('dumbbell');

  const days = bodyweightOnly
    ? [BODYWEIGHT_DAY, BODYWEIGHT_DAY, BODYWEIGHT_DAY]
    : base.days.map((d) => ({
        ...d,
        focus: p.injuries?.length ? `${d.focus} · modified` : d.focus,
      }));

  const split =
    (bodyweightOnly ? 'Bodyweight full body × 3' : base.name) +
    (needsDumbbellSwap ? ' · dumbbell variants' : '');

  const progression = bodyweightOnly
    ? 'Add reps first (up to +50%), then move to a harder variation: tempo, lever, single limb.'
    : p.experience === 'beginner'
      ? 'Add 2.5 kg to the main lift each week while every set stays clean.'
      : p.goal === 'lose_fat'
        ? 'Hold the loads, shorten rest by 15 s each week. Muscle retention beats PRs here.'
        : 'Double progression: run the rep range to the top, then add the smallest load jump.';

  /* ---- recovery ---- */
  const sleepTarget = Math.min(9, Math.max(7, p.sleepHours));
  const deloadEveryWeeks = p.experience === 'advanced' ? 5 : 6;
  const cardio =
    p.goal === 'lose_fat'
      ? '3 × 30 min zone-2 plus 8k steps daily.'
      : p.goal === 'athletic_performance'
        ? '2 × interval session plus 2 × 20 min zone-2.'
        : '2 × 20 min zone-2 for heart health, not fat loss.';

  /* ---- roadmap ---- */
  const roadmap = [
    { weeks: '1–2', focus: 'Calibration', milestone: 'Baseline lifts and measurements logged' },
    { weeks: '3–6', focus: 'Accumulation', milestone: `+${p.goal === 'lose_fat' ? '0' : '5–8'}% load on main lifts, adherence ≥ 85%` },
    {
      weeks: `7–${deloadEveryWeeks}`,
      focus: 'Intensification',
      milestone: p.goal === 'lose_fat' ? '−1.5 to 2.5 kg body weight, lifts held' : '+2 to 3 kg lean mass',
    },
    { weeks: `${deloadEveryWeeks + 1}–12`, focus: 'Deload + re-test', milestone: 'Re-run the assessment, regenerate the blueprint' },
  ];

  return {
    trainingPlan: { split, frequency: days.length, days, progression },
    nutritionPlan: {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      kcal,
      proteinG,
      carbsG,
      fatG,
      meals,
    },
    recoveryPlan: {
      sleepTarget,
      deloadEveryWeeks,
      cardio,
      readinessCheck: 'Morning resting HR and grip strength — if both drop for 3 days, take a deload.',
    },
    roadmap,
    modelVersion: 'trainwise-rules-v0',
  };
}

export const goalLabel = (g: OnboardingData['goal']) => GOAL_LABEL[g];
