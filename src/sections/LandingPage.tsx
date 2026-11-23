import React, { Suspense } from 'react';
// three.js is ~600 kB of the bundle and only the hero needs it — keep it out of
// the first paint and let the Suspense fallback cover the gap on slow links.
const HeroScene = React.lazy(() =>
  import('../three/HeroScene').then((m) => ({ default: m.HeroScene }))
);
import { Logo, Avatar } from '../components/Logo';
import { ArrowRight, Activity, Zap, ShieldCheck, Download, Sparkles, Check, ChevronDown, Menu, X, LogIn, LogOut } from 'lucide-react';
import type { User } from '../lib/api';

export const LandingPage = ({
  onGetBlueprint,
  user,
  onLogin,
  onSignup,
  onLogout,
  onOpenPlans,
}: {
  onGetBlueprint: () => void;
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onOpenPlans: () => void;
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#B6FF3C] selection:text-black relative overflow-x-clip">
      {/* Aurora Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-[rgba(101,163,13,0.10)] to-[rgba(14,116,144,0.10)] blur-[120px] pointer-events-none" />

      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Logo size={26} />
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-700 font-medium">
          <a href="#features" className="hover:text-lime-700 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-lime-700 transition-colors">How it Works</a>
          <a href="#preview" className="hover:text-lime-700 transition-colors">Blueprint Preview</a>
          <a href="#pricing" className="hover:text-lime-700 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-lime-700 transition-colors">FAQ</a>
        </div>
        <div className="hidden md:flex items-center gap-3">
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
                <LogOut size={14} /> Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all"
              >
                <LogIn size={14} /> Log in
              </button>
              <button
                onClick={onSignup}
                className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-all"
              >
                Sign up
              </button>
            </>
          )}
          <button
            onClick={onGetBlueprint}
            className="px-5 py-2.5 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all transform hover:-translate-y-0.5"
          >
            Get My Blueprint
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
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-700">Features</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-slate-700">How it Works</a>
          <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="text-slate-700">Blueprint Preview</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-700">Pricing</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-slate-700">FAQ</a>
          {user ? (
            <>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenPlans(); }}
                className="w-full py-3 rounded-full bg-slate-100 border border-slate-200 text-slate-900 font-semibold text-sm inline-flex items-center justify-center gap-2 mt-2"
              >
                <Avatar label={user.name || user.email} size={18} /> My plans
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="w-full py-3 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> Log out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onLogin(); }}
                className="py-3 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-2"
              >
                <LogIn size={14} /> Log in
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onSignup(); }}
                className="py-3 rounded-full border border-slate-300 text-slate-900 font-semibold text-sm"
              >
                Sign up
              </button>
            </div>
          )}
          <button
            onClick={() => { setMobileMenuOpen(false); onGetBlueprint(); }}
            className="w-full py-3 rounded-full bg-[#B6FF3C] text-black font-semibold text-center"
          >
            Get My Blueprint
          </button>
        </div>
      )}

      {/* 2. Hero Section */}
      <header className="relative pt-20 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-lime-500/50 text-xs font-semibold text-lime-700 tracking-wide uppercase">
            <Sparkles size={14} className="text-lime-700" /> AI-Powered Body Blueprint v2.5
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
            Your body. <br />
            <span className="text-gradient-lime">Decoded.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
            Stop guessing with generic routines. TrainWise synthesizes your biometric data into an elite, hyper-personalized training & nutrition blueprint in under 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              onClick={onGetBlueprint}
              className="px-8 py-4 rounded-full bg-[#B6FF3C] text-black font-bold text-base hover:shadow-[0_10px_30px_rgba(101,163,13,0.4)] transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
            >
              Generate Your Blueprint <ArrowRight size={18} />
            </button>
            <a
              href="#preview"
              className="px-8 py-4 rounded-full glass-panel border border-slate-200 text-slate-900 font-semibold text-base hover:bg-slate-100 transition-all text-center"
            >
              Explore Sample PDF
            </a>
          </div>
          <div className="flex items-center gap-6 pt-4 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2"><Check size={16} className="text-lime-700" /> No credit card required</div>
            <div className="flex items-center gap-2"><Check size={16} className="text-lime-700" /> 30-second onboarding</div>
            <div className="flex items-center gap-2"><Check size={16} className="text-lime-700" /> PDF + Web Blueprint</div>
          </div>
        </div>

        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="absolute w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="glass-panel w-full h-[450px] rounded-3xl relative overflow-hidden flex items-center justify-center border border-slate-200 shadow-2xl">
            <Suspense fallback={<div className="text-slate-500 animate-pulse">Loading 3D Hologram...</div>}>
              <HeroScene />
            </Suspense>
            {/* Floating Orbiting Data Cards */}
            <div className="absolute top-6 left-6 glass-panel px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 animate-bounce shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-[#B6FF3C] animate-ping" />
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Strength Velocity</p>
                <p className="text-sm font-bold text-slate-900">+18.4% projected</p>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 glass-panel px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-lg">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-700 font-bold text-xs">kcal</div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Daily Calorie Target</p>
                <p className="text-sm font-bold text-slate-900">2,650 kcal (Lean Bulk)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Trust Bar */}
      <section className="border-y border-slate-200 bg-white/80 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Trusted by 14,200+ elite athletes, coaches & fitness enthusiasts worldwide</p>
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
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Engineered for absolute biological precision</h2>
          <p className="text-slate-600 text-base">Every aspect of your physique transformation is calculated using clinical formulas and verified AI models.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <Activity className="text-lime-700" size={24} />, title: "Hyper-Personalized Training", desc: "Custom splits tailored precisely to your schedule, equipment access, joint history, and recovery capacity." },
            { icon: <Zap className="text-cyan-700" size={24} />, title: "Precision Macro Engine", desc: "Dynamic calorie & macro targets with meal timing optimized around your workout window and food preferences." },
            { icon: <ShieldCheck className="text-lime-700" size={24} />, title: "Injury & Mobility Shield", desc: "Pre-hab routines and movement substitutions designed to protect vulnerable joints and eliminate pain." },
            { icon: <Download className="text-cyan-700" size={24} />, title: "Printable PDF Blueprint", desc: "A gorgeous 15+ page downloadable PDF and interactive web app you can take straight to the gym." },
            { icon: <Sparkles className="text-lime-700" size={24} />, title: "12-Week Progressive Roadmap", desc: "Week-by-week overload progression rules, deload triggers, and milestone checkpoints." },
            { icon: <Check className="text-cyan-700" size={24} />, title: "Wearable Sync & Check-ins", desc: "Weekly check-ins to automatically adjust calories and training volume as your body adapts." }
          ].map((f, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl border border-slate-200 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="py-28 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Three steps to your definitive Body Blueprint</h2>
          <p className="text-slate-600">From onboarding questionnaire to your complete fitness masterplan in under 30 seconds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Input Your Biometrics", desc: "Tell us your goals, body stats, equipment availability, diet preferences, and injury history." },
            { step: "02", title: "AI Synthesis & Calculation", desc: "Our co-pilot processes over 40 distinct data points against clinical exercise science and nutritional models." },
            { step: "03", title: "Download Your Blueprint", desc: "Instantly receive your 12-week training split, 7-day meal plan, grocery list, and recovery protocol." }
          ].map((s, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl border border-slate-200 space-y-6 relative overflow-hidden">
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-400/50 to-transparent">
                {s.step}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{s.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Blueprint Preview */}
      <section id="preview" className="py-28 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Inside your generated Blueprint</h2>
          <p className="text-slate-600">Preview the sleek, professional grade documentation generated for every user.</p>
        </div>
        <div className="glass-card rounded-3xl border border-slate-200 p-8 max-w-4xl mx-auto space-y-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 pb-6 gap-4">
            <div>
              <p className="text-xs text-lime-700 font-semibold uppercase tracking-wider">Sample Generated Document</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">Alex Morgan — Hypertrophy & Recomp Masterplan</h3>
            </div>
            <button onClick={onGetBlueprint} className="px-6 py-2.5 rounded-full bg-cyan-500 text-black font-semibold text-sm hover:shadow-[0_8px_20px_rgba(8,145,178,0.3)] transition-all">
              Download PDF Sample
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600">Training Split</p>
              <p className="text-lg font-bold text-slate-900">Upper / Lower 4-Day</p>
              <p className="text-xs text-slate-500">RPE 7-9 progressive overload</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600">Daily Calories</p>
              <p className="text-lg font-bold text-lime-700">2,840 kcal</p>
              <p className="text-xs text-slate-500">P: 195g | C: 310g | F: 85g</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600">Recovery Protocol</p>
              <p className="text-lg font-bold text-slate-900">8h Sleep + Mobility</p>
              <p className="text-xs text-slate-500">Targeted lower back care</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing Section */}
      <section id="pricing" className="py-28 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Invest in your ultimate physical asset</h2>
          <p className="text-slate-600">Simple, transparent pricing. One blueprint or unlimited lifetime optimization.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {[
            { name: "Starter", price: "$19", desc: "One complete 12-week body blueprint with PDF export.", popular: false },
            { name: "Pro Co-Pilot", price: "$39", desc: "Unlimited blueprints, monthly progression recalibrations & wearable sync.", popular: true },
            { name: "Elite Coaching", price: "$99", desc: "Everything in Pro + 1-on-1 monthly video check-ins with expert human coaches.", popular: false }
          ].map((tier, i) => (
            <div key={i} className={`glass-card p-8 rounded-3xl border ${tier.popular ? 'border-lime-500 shadow-[0_20px_50px_rgba(15,23,42,0.08)] relative' : 'border-slate-200'} space-y-6`}>
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#B6FF3C] text-black text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                <p className="text-slate-600 text-xs mt-1">{tier.desc}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900">{tier.price}</span>
                <span className="text-slate-600 text-sm">/ one-time</span>
              </div>
              <button
                onClick={onGetBlueprint}
                className={`w-full py-3.5 rounded-full font-bold text-sm transition-all ${tier.popular ? 'bg-[#B6FF3C] text-black hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)]' : 'glass-panel border border-slate-200 text-slate-900 hover:bg-slate-100'}`}
              >
                Get Started Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="py-28 px-6 max-w-5xl mx-auto">
        <div className="glass-panel p-12 sm:p-16 rounded-3xl border border-lime-500/50 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 to-[#3CF5FF]/15 blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Ready to decode your physique?</h2>
          <p className="text-slate-700 max-w-xl mx-auto text-base">
            Join over 14,000 athletes who stopped guessing and started transforming with clinical precision.
          </p>
          <button
            onClick={onGetBlueprint}
            className="px-10 py-4 rounded-full bg-[#B6FF3C] text-black font-extrabold text-base hover:shadow-[0_10px_30px_rgba(101,163,13,0.4)] transition-all inline-flex items-center gap-3 transform hover:-translate-y-1"
          >
            Generate Your Body Blueprint Now <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="border-t border-slate-200 py-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <Logo size={15} />
          <span>&copy; 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-700 transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
};
