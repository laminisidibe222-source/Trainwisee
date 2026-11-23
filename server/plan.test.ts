import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBlueprint } from './plan.js';
import type { OnboardingData } from '../src/types/onboarding.js';

const base: OnboardingData = {
  age: 29,
  sex: 'male',
  heightCm: 178,
  weightKg: 82,
  goal: 'build_muscle',
  activityLevel: 'moderately_active',
  experience: 'intermediate',
  equipment: ['barbell', 'dumbbell', 'rack'],
  sleepHours: 7.5,
  dietPreference: 'standard',
  budget: 'medium',
};

const allExerciseNames = (p: OnboardingData) =>
  generateBlueprint(p).trainingPlan.days.flatMap((d) => d.exercises.map((e) => e.name));

test('a clean profile gets the untouched split', () => {
  const plan = generateBlueprint(base);
  assert.equal(plan.trainingPlan.substitutions?.length, 0);
  assert.ok(allExerciseNames(base).includes('Back squat'));
});

test('a knee injury replaces the knee-hostile lifts, keeping the pattern', () => {
  const plan = generateBlueprint({ ...base, injuries: ['knee'] });
  const names = allExerciseNames({ ...base, injuries: ['knee'] });

  assert.ok(!names.includes('Back squat'), 'back squat should be swapped out');
  assert.ok(!names.includes('Front squat'), 'front squat should be swapped out');
  assert.ok(names.some((n) => /squat/i.test(n)), 'a squat pattern should survive');

  const squatSwap = plan.trainingPlan.substitutions?.find((s) => s.from === 'Back squat');
  assert.deepEqual(squatSwap, { from: 'Back squat', to: 'Box squat to parallel', injury: 'knee' });
});

test('overlapping injuries do not unbalance the plan', () => {
  const plan = generateBlueprint({ ...base, injuries: ['knee', 'lower_back', 'shoulder'] });
  assert.equal(plan.trainingPlan.days.length, 4);
  for (const day of plan.trainingPlan.days) {
    assert.ok(day.exercises.length >= 3, `${day.day} lost too many exercises`);
  }
  // A swap is recorded once even when several joints point at the same lift.
  const froms = plan.trainingPlan.substitutions!.map((s) => s.from);
  assert.equal(new Set(froms).size, froms.length);
});

test('bodyweight-only equipment still yields a usable plan', () => {
  const plan = generateBlueprint({ ...base, equipment: ['bodyweight'], experience: 'beginner' });
  assert.equal(plan.trainingPlan.days.length, 3);
  assert.match(plan.trainingPlan.split, /Bodyweight/);
});

test('fat loss never prescribes below the safe intake floor', () => {
  const plan = generateBlueprint({
    ...base,
    sex: 'female',
    weightKg: 45,
    heightCm: 150,
    age: 60,
    activityLevel: 'sedentary',
    goal: 'lose_fat',
  });
  assert.ok(plan.nutritionPlan.kcal >= 1200, `got ${plan.nutritionPlan.kcal}`);
});

test('macros stay internally consistent', () => {
  const { kcal, proteinG, carbsG, fatG } = generateBlueprint(base).nutritionPlan;
  const fromMacros = proteinG * 4 + carbsG * 4 + fatG * 9;
  assert.ok(Math.abs(fromMacros - kcal) < 60, `macros ${fromMacros} vs target ${kcal}`);
  assert.equal(proteinG, Math.round(82 * 2.0));
});

test('fractional sleep hours survive rounding', () => {
  assert.equal(generateBlueprint({ ...base, sleepHours: 7.5 }).recoveryPlan.sleepTarget, 7.5);
  assert.equal(generateBlueprint({ ...base, sleepHours: 5 }).recoveryPlan.sleepTarget, 7);
  assert.equal(generateBlueprint({ ...base, sleepHours: 11 }).recoveryPlan.sleepTarget, 9);
});
