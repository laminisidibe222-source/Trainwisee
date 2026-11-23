import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INJURY_AREAS, OnboardingData, type InjuryArea } from '../types/onboarding';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Logo } from './Logo';
import { LanguageToggle, useI18n, type TKey } from '../i18n';

export const OnboardingWizard = ({
  onComplete,
  onCancel,
}: {
  onComplete: (data: OnboardingData) => void;
  onCancel?: () => void;
}) => {
  const [step, setStep] = useState(1);
  const { t } = useI18n();
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    age: 28,
    sex: 'male',
    heightCm: 178,
    weightKg: 78,
    bodyfatPct: 15,
    goal: 'build_muscle',
    activityLevel: 'moderately_active',
    experience: 'intermediate',
    equipment: ['barbell', 'dumbbell', 'rack'],
    injuries: [],
    sleepHours: 7,
    dietPreference: 'standard',
    allergies: [],
    budget: 'medium',
  });

  const updateField = (key: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onComplete(formData as OnboardingData);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6 relative overflow-x-clip">
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-[rgba(101,163,13,0.10)] to-[rgba(14,116,144,0.10)] blur-[140px] pointer-events-none" />

      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-200 p-8 sm:p-12 relative z-10 shadow-2xl space-y-8">
        {/* Progress Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <Logo size={21} />
            <span className="font-bold text-slate-900 text-lg">{t('wizard.title')}</span>
          </div>
          <span className="text-xs text-lime-700 font-semibold uppercase tracking-wider">
            {t('wizard.step', { n: step })}
          </span>
          <LanguageToggle className="mr-3" />
          {onCancel && (
            <button
              onClick={onCancel}
              aria-label="Cancel and return to the site"
              className="text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold uppercase tracking-wider"
            >
              {t('wizard.cancel')}
            </button>
          )}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-2xl font-bold">{t('wizard.s1.title')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{t('wizard.age')}</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => updateField('age', Number(e.target.value))}
                    className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-lime-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{t('wizard.sex')}</label>
                  <select
                    value={formData.sex}
                    onChange={e => updateField('sex', e.target.value)}
                    className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-lime-500 outline-none transition-colors"
                  >
                    <option value="male">{t('wizard.sex.male')}</option>
                    <option value="female">{t('wizard.sex.female')}</option>
                    <option value="other">{t('wizard.sex.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{t('wizard.height')}</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={e => updateField('heightCm', Number(e.target.value))}
                    className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-lime-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{t('wizard.weight')}</label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={e => updateField('weightKg', Number(e.target.value))}
                    className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-lime-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-2xl font-bold">{t('wizard.s2.title')}</h2>
              <div className="space-y-4">
                <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{t('wizard.goal.q')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'build_muscle', title: t('wizard.goal.build_muscle'), desc: t('wizard.goal.build_muscle.desc') },
                    { id: 'lose_fat', title: t('wizard.goal.lose_fat'), desc: t('wizard.goal.lose_fat.desc') },
                    { id: 'recomp', title: t('wizard.goal.recomp'), desc: t('wizard.goal.recomp.desc') },
                    { id: 'athletic_performance', title: t('wizard.goal.athletic_performance'), desc: t('wizard.goal.athletic_performance.desc') }
                  ].map(g => (
                    <div
                      key={g.id}
                      onClick={() => updateField('goal', g.id)}
                      className={`glass-card p-4 rounded-2xl border cursor-pointer transition-all ${formData.goal === g.id ? 'border-lime-500 bg-[#B6FF3C]/10' : 'border-slate-200'}`}
                    >
                      <p className="font-bold text-slate-900">{g.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{g.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-2xl font-bold">{t('wizard.s3.title')}</h2>
              <div className="space-y-4">
                <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{t('wizard.equipment.q')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['barbell', 'dumbbell', 'rack', 'cables', 'machines', 'bodyweight'].map(eq => {
                    const selected = formData.equipment?.includes(eq);
                    return (
                      <div
                        key={eq}
                        onClick={() => {
                          const current = formData.equipment || [];
                          const updated = selected ? current.filter(x => x !== eq) : [...current, eq];
                          updateField('equipment', updated);
                        }}
                        className={`glass-card p-3 rounded-xl border text-center cursor-pointer capitalize text-sm font-semibold transition-all ${selected ? 'border-lime-500 bg-[#B6FF3C]/10 text-lime-700' : 'border-slate-200 text-slate-700'}`}
                      >
                        {t(`wizard.eq.${eq}` as TKey)}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                      {t('wizard.injuries.q')}
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1">{t('wizard.injuries.optional')}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {INJURY_AREAS.map((area: InjuryArea) => {
                      const selected = (formData.injuries || []).includes(area);
                      return (
                        <div
                          key={area}
                          role="checkbox"
                          aria-checked={selected}
                          tabIndex={0}
                          onClick={() => {
                            const current = formData.injuries || [];
                            const updated = selected ? current.filter((x) => x !== area) : [...current, area];
                            updateField('injuries', updated);
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter' && e.key !== ' ') return;
                            e.preventDefault();
                            const current = formData.injuries || [];
                            const updated = selected ? current.filter((x) => x !== area) : [...current, area];
                            updateField('injuries', updated);
                          }}
                          className={`p-3 rounded-xl border text-center cursor-pointer text-sm font-semibold transition-all ${
                            selected
                              ? 'border-amber-400 bg-amber-50 text-amber-900'
                              : 'border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/40'
                          }`}
                        >
                          {t(`wizard.inj.${area}` as TKey)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-2xl font-bold">{t('wizard.s4.title')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{t('wizard.diet')}</label>
                  <select
                    value={formData.dietPreference}
                    onChange={e => updateField('dietPreference', e.target.value)}
                    className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-lime-500 outline-none transition-colors"
                  >
                    <option value="standard">{t('wizard.diet.standard')}</option>
                    <option value="vegetarian">{t('wizard.diet.vegetarian')}</option>
                    <option value="vegan">{t('wizard.diet.vegan')}</option>
                    <option value="keto">{t('wizard.diet.keto')}</option>
                    <option value="paleo">{t('wizard.diet.paleo')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{t('wizard.sleep')}</label>
                  <input
                    type="number"
                    value={formData.sleepHours}
                    onChange={e => updateField('sleepHours', Number(e.target.value))}
                    className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-lime-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="px-6 py-2.5 rounded-full glass-panel border border-slate-200 text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <ArrowLeft size={16} /> {t('wizard.back')}
            </button>
          ) : <div />}
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-full bg-[#B6FF3C] text-black font-bold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all flex items-center gap-2"
          >
            {step === 4 ? t('wizard.generate') : t('wizard.continue')} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
