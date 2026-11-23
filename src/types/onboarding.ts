import { z } from 'zod';

/** Joints the plan engine knows how to work around. */
export const INJURY_AREAS = ['knee', 'lower_back', 'shoulder', 'wrist_elbow', 'hip', 'neck'] as const;
export type InjuryArea = (typeof INJURY_AREAS)[number];

export const onboardingSchema = z.object({
  age: z.number().min(13).max(100),
  sex: z.enum(['male', 'female', 'other']),
  heightCm: z.number().min(50).max(300),
  weightKg: z.number().min(20).max(500),
  bodyfatPct: z.number().min(1).max(70).optional(),
  goal: z.enum(['lose_fat', 'build_muscle', 'recomp', 'athletic_performance']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'athlete']),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.array(z.string()).min(1),
  injuries: z.array(z.enum(INJURY_AREAS)).optional(),
  sleepHours: z.number().min(1).max(24),
  dietPreference: z.enum(['standard', 'vegetarian', 'vegan', 'keto', 'paleo']),
  allergies: z.array(z.string()).optional(),
  budget: z.enum(['low', 'medium', 'high']),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
