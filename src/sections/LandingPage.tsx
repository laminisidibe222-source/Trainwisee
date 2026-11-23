import React, { Suspense } from 'react';
// three.js is ~600 kB of the bundle and only the hero needs it — keep it out of
// the first paint and let the Suspense fallback cover the gap on slow links.
const HeroScene = React.lazy(() =>
  import('../three/HeroScene').then((m) => ({ default: m.HeroScene }))
);
import { Logo, Avatar } from '../components/Logo';
import { ArrowRight, Activity, Zap, ShieldCheck, Download, Sparkles, Check, Menu, X, LogIn, LogOut } from 'lucide-react';
import type { User } from '../lib/api';
import { LanguageToggle, useI18n, type TKey } from '../i18n';

export const LandingPage = ({
  onGetBlueprint,
  user,
  onLogin,
  onSignup,
  onLogout,
  onOpenPlans,
  onHome,
}: {
  onGetBlueprint: () => void;
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onOpenPlans: () => void;
  onHome: () => void;
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { t } = useI18n();

  const navLinks: { href: string; key: TKey }[] = [
    { href: '#features', key: 'nav.features' },
    { href: '#how-it-works', key: 'nav.how' },
    { href: '#preview', key: 'nav.preview' },
    { href: '#pricing', key: 'nav.pricing' },
    { href: '#faq', key: 'nav.faq' },
  ];

  const features: { icon: React.ReactNode; title: TKey; desc: TKey }[] = [
    { icon: <Activity className="text-lime-700" size={24} />, title: 'landing.features.f1.title', desc: 'landing.features.f1.desc' },
    { icon: <Zap className="text-cyan-700" size={24} />, title: 'landing.features.f2.title', desc: 'landing.features.f2.desc' },
    { icon: <ShieldCheck className="text-lime-700" size={24} />, title: 'landing.features.f3.title', desc: 'landing.features.f3.desc' },
    { icon: <Download className="text-cyan-700" size={24} />, title: 'landing.features.f4.title', desc: 'landing.features.f4.desc' },
    { icon: <Sparkles className="text-lime-700" size={24} />, title: 'landing.features.f5.title', desc: 'landing.features.f5.desc' },
    { icon: <Check className="text-cyan-700" size={24} />, title: 'landing.features.f6.title', desc: 'landing.features.f6.desc' },
  ];

  const steps: { step: string; title: TKey; desc: TKey }[] = [
    { step: '01', title: 'landing.how.s1.title', desc: 'landing.how.s1.desc' },
    { step: '02', title: 'landing.how.s2.title', desc: 'landing.how.s2.desc' },
    { step: '03', title: 'landing.how.s3.title', desc: 'landing.how.s3.desc' },
  ];

  const tiers: { price: string; name: TKey; desc: TKey; popular: boolean }[] = [
    { name: 'landing.pricing.p1.name', desc: 'landing.pricing.p1.desc', price: '$19', popular: false },
    { name: 'landing.pricing.p2.name', desc: 'landing.pricing.p2.desc', price: '$39', popular: true },
    { name: 'landing.pricing.p3.name', desc: 'landing.pricing.p3.desc', price: '$99', popular: false },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#B6FF3C] selection:text-black relative overflow-x-clip">
      {/* Aurora Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-[rgba(101,163,13,0.10)] to-[rgba(14,116,144,0.10)] blur-[120px] pointer-events-none" />

      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => (user ? onHome() : window.scrollTo({ top: 0, behavior: 'smooth' }))}
          className="flex items-center shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          aria-label={user ? t('nav.dashboard') : 'TrainWise — top of page'}
        >
          <Logo size={26} />
        </button>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-700 font-medium">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-lime-700 transition-colors">
              {t(l.key)}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <LanguageToggle />
          {user ? (
            <>
              <button
                onClick={onOpenPlans}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 max-w-[190px] hover:border-lime-500/60 hover:bg-slate-50 transition-all"
              >
                <Avatar label={user.name || user.email} size={20} />
                <span className="truncate">{user.name || user.email}</span>
              </button>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all"
              >
                <LogOut size={14} /> {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all"
              >
                <LogIn size={14} /> {t('nav.login')}
              </button>
              <button
                onClick={onSignup}
                className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-all"
              >
                {t('nav.signup')}
              </button>
            </>
          )}
          <button
            onClick={onGetBlueprint}
            className="px-5 py-2.5 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all transform hover:-translate-y-0.5"
          >
            {t('nav.get')}
          </button>
        </div>
        <button
          className="md:hidden text-slate-900"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-200 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className="text-slate-700">
              {t(l.key)}
            </a>
          ))}
          <LanguageToggle className="self-start" />
          {user ? (
            <>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenPlans(); }}
                className="w-full py-3 rounded-full bg-slate-100 border border-slate-200 text-slate-900 font-semibold text-sm inline-flex items-center justify-center gap-2 mt-2"
              >
                <Avatar label={user.name || user.email} size={18} /> {t('nav.dashboard')}
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="w-full py-3 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> {t('nav.logout')}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onLogin(); }}
                className="py-3 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-2"
              >
                <LogIn size={14} /> {t('nav.login')}
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onSignup(); }}
                className="py-3 rounded-full border border-slate-300 text-slate-900 font-semibold text-sm"
              >
                {t('nav.signup')}
              </button>
            </div>
          )}
          <button
            onClick={() => { setMobileMenuOpen(false); onGetBlueprint(); }}
            className="w-full py-3 rounded-full bg-[#B6FF3C] text-black font-semibold text-center"
          >
            {t('nav.get')}
          </button>
        </div>
      )}

      {/* 2. Hero Section */}
      <header className="relative pt-20 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
            {t('landing.hero.t1')} <br />
            <span className="text-gradient-lime">{t('landing.hero.t2')}</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl leading-relaxed">{t('landing.hero.sub')}</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              onClick={onGetBlueprint}
              className="px-8 py-4 rounded-full bg-[#B6FF3C] text-black font-bold text-base hover:shadow-[0_10px_30px_rgba(101,163,13,0.4)] transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
            >
              {t('landing.hero.cta')} <ArrowRight size={18} />
            </button>
            <a
              href="#preview"
              className="px-8 py-4 rounded-full glass-panel border border-slate-200 text-slate-900 font-semibold text-base hover:bg-slate-100 transition-all text-center"
            >
              {t('landing.hero.sample')}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2"><Check size={16} className="text-lime-700" /> {t('landing.hero.check1')}</div>
            <div className="flex items-center gap-2"><Check size={16} className="text-lime-700" /> {t('landing.hero.check2')}</div>
            <div className="flex items-center gap-2"><Check size={16} className="text-lime-700" /> {t('landing.hero.check3')}</div>
          </div>
        </div>

        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="absolute w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="glass-panel w-full h-[450px] rounded-3xl relative overflow-hidden flex items-center justify-center border border-slate-200 shadow-2xl">
            <Suspense fallback={<div className="text-slate-500 animate-pulse">…</div>}>
              <HeroScene />
            </Suspense>
            {/* Floating Orbiting Data Cards */}
            <div className="absolute top-6 left-6 glass-panel px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 animate-bounce shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-[#B6FF3C] animate-ping" />
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">{t('landing.float1.label')}</p>
                <p className="text-sm font-bold text-slate-900">{t('landing.float1.value')}</p>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 glass-panel px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-lg">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-700 font-bold text-xs">kcal</div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">{t('landing.float2.label')}</p>
                <p className="text-sm font-bold text-slate-900">{t('landing.float2.value')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Trust Bar */}
      <section className="border-y border-slate-200 bg-white/80 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">{t('landing.trust')}</p>
          <div className="flex flex-wrap items-center gap-10 opacity-70 font-bold tracking-wider text-sm">
            <span className="hover:text-slate-900 transition-colors">MEN'S HEALTH</span>
            <span className="hover:text-slate-900 transition-colors">EQUINOX COACHES</span>
            <span className="hover:text-slate-900 transition-colors">CROSSFIT HQ</span>
            <span className="hover:text-slate-900 transition-colors">HYROX ELITE</span>
          </div>
        </div>
      </section>

      {/* 4. Feature Grid */}
      <section id="features" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('landing.features.title')}</h2>
          <p className="text-slate-600 text-base">{t('landing.features.sub')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl border border-slate-200 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{t(f.title)}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t(f.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="py-28 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('landing.how.title')}</h2>
          <p className="text-slate-600">{t('landing.how.sub')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl border border-slate-200 space-y-6 relative overflow-hidden">
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-400/50 to-transparent">
                {s.step}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{t(s.title)}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t(s.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Blueprint Preview */}
      <section id="preview" className="py-28 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('landing.preview.title')}</h2>
          <p className="text-slate-600">{t('landing.preview.sub')}</p>
        </div>
        <div className="glass-card rounded-3xl border border-slate-200 p-8 max-w-4xl mx-auto space-y-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 pb-6 gap-4">
            <div>
              <p className="text-xs text-lime-700 font-semibold uppercase tracking-wider">{t('landing.preview.badge')}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{t('landing.preview.doc')}</h3>
            </div>
            <button onClick={onGetBlueprint} className="px-6 py-2.5 rounded-full bg-cyan-500 text-black font-semibold text-sm hover:shadow-[0_8px_20px_rgba(8,145,178,0.3)] transition-all">
              {t('landing.preview.cta')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600">{t('landing.preview.split')}</p>
              <p className="text-lg font-bold text-slate-900">{t('landing.preview.splitValue')}</p>
              <p className="text-xs text-slate-500">{t('landing.preview.splitSub')}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600">{t('landing.preview.kcal')}</p>
              <p className="text-lg font-bold text-lime-700">2,840 kcal</p>
              <p className="text-xs text-slate-500">{t('landing.preview.kcalSub')}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600">{t('landing.preview.recovery')}</p>
              <p className="text-lg font-bold text-slate-900">{t('landing.preview.recoveryValue')}</p>
              <p className="text-xs text-slate-500">{t('landing.preview.recoverySub')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing Section */}
      <section id="pricing" className="py-28 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('landing.pricing.title')}</h2>
          <p className="text-slate-600">{t('landing.pricing.sub')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier, i) => (
            <div key={i} className={`glass-card p-8 rounded-3xl border ${tier.popular ? 'border-lime-500 shadow-[0_20px_50px_rgba(15,23,42,0.08)] relative' : 'border-slate-200'} space-y-6`}>
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#B6FF3C] text-black text-xs font-bold uppercase tracking-wider">
                  {t('landing.pricing.popular')}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900">{t(tier.name)}</h3>
                <p className="text-slate-600 text-xs mt-1">{t(tier.desc)}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900">{tier.price}</span>
                <span className="text-slate-600 text-sm">{t('landing.pricing.period')}</span>
              </div>
              <button
                onClick={onGetBlueprint}
                className={`w-full py-3.5 rounded-full font-bold text-sm transition-all ${tier.popular ? 'bg-[#B6FF3C] text-black hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)]' : 'glass-panel border border-slate-200 text-slate-900 hover:bg-slate-100'}`}
              >
                {t('landing.pricing.cta')}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="py-28 px-6 max-w-5xl mx-auto">
        <div className="glass-panel p-12 sm:p-16 rounded-3xl border border-lime-500/50 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 to-[#3CF5FF]/15 blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{t('landing.cta.title')}</h2>
          <p className="text-slate-700 max-w-xl mx-auto text-base">{t('landing.cta.sub')}</p>
          <button
            onClick={onGetBlueprint}
            className="px-10 py-4 rounded-full bg-[#B6FF3C] text-black font-extrabold text-base hover:shadow-[0_10px_30px_rgba(101,163,13,0.4)] transition-all inline-flex items-center gap-3 transform hover:-translate-y-1"
          >
            {t('landing.cta.btn')} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="border-t border-slate-200 py-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <Logo size={15} />
          <span>&copy; 2026. {t('landing.footer.rights')}</span>
        </div>
        <div className="flex items-center gap-6">
          <LanguageToggle />
          <a href="#" className="hover:text-slate-700 transition-colors">{t('landing.footer.privacy')}</a>
          <a href="#" className="hover:text-slate-700 transition-colors">{t('landing.footer.terms')}</a>
          <a href="#" className="hover:text-slate-700 transition-colors">{t('landing.footer.contact')}</a>
        </div>
      </footer>
    </div>
  );
};
