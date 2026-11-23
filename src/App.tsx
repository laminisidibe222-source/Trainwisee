import React, { useEffect, useState } from 'react';
import { LandingPage } from './sections/LandingPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { BlueprintResult } from './components/BlueprintResult';
import { AuthPage } from './components/AuthPage';
import { PlansPage } from './components/PlansPage';
import { Dashboard } from './components/Dashboard';
import { Toaster, toast } from 'react-hot-toast';
import {
  createBlueprint,
  getBlueprint,
  getMe,
  logout as apiLogout,
  ApiError,
  type SavedBlueprint,
  type User,
} from './lib/api';
import type { OnboardingData } from './types/onboarding';
import type { Plan } from './types/blueprint';
import { useI18n } from './i18n';

type View =
  | { name: 'landing' }
  | { name: 'auth'; then: 'wizard' | 'landing' }
  | { name: 'dashboard' }
  | { name: 'plans' }
  | { name: 'wizard' }
  | { name: 'generating' }
  | { name: 'result'; plan: Plan; id: number; fromPlans?: boolean };

const toastStyle = {
  style: { background: '#FFFFFF', color: '#0F172A', border: '1px solid rgba(101, 163, 13, 0.35)' },
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [view, setView] = useState<View>({ name: 'landing' });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [openingPlan, setOpeningPlan] = useState(false);
  const { t, tError } = useI18n();

  // Restore the session from the httpOnly cookie on first paint.
  useEffect(() => {
    let alive = true;
    getMe()
      .then((res) => {
        if (!alive) return;
        setUser(res.user);
        // A returning session should open on the dashboard, not the sales page.
        if (res.user) setView({ name: 'dashboard' });
      })
      .catch(() => undefined)
      .finally(() => alive && setBooting(false));
    return () => {
      alive = false;
    };
  }, []);

  const openAuth = (mode: 'login' | 'signup', then: 'wizard' | 'landing') => {
    setAuthMode(mode);
    setView({ name: 'auth', then });
  };

  /* Every blueprint is tied to an account, so the CTA gates on sign-in. */
  const handleGetBlueprint = () => {
    if (!user) openAuth('signup', 'wizard');
    else setView({ name: 'wizard' });
  };

  const handleComplete = async (profile: OnboardingData) => {
    setView({ name: 'generating' });
    try {
      const { blueprint, id } = await createBlueprint(profile);
      setView({ name: 'result', plan: blueprint, id });
      toast.success(t('err.saved'), toastStyle);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        toast.error(t('err.session'), toastStyle);
        openAuth('login', 'wizard');
        return;
      }
      const message = err instanceof Error ? tError(err.message) : t('err.plan');
      toast.error(message, { style: { ...toastStyle.style, border: '1px solid rgba(220, 38, 38, 0.35)' } });
      setView({ name: 'wizard' });
    }
  };

  /** Signed-in home: the dashboard. */
  const openDashboard = () => setView({ name: 'dashboard' });
  /**
   * Where the logo goes. A signed-in user must never be dropped back on the
   * marketing page — the account's own home is the dashboard.
   */
  const openHome = () => setView(user ? { name: 'dashboard' } : { name: 'landing' });

  /** The plan library, one click away from the dashboard. */
  const openPlans = () => setView({ name: 'plans' });

  /** Older plans are summaries on the dashboard, so they load on demand. */
  const openPlanById = async (id: number) => {
    setOpeningPlan(true);
    try {
      const saved = await getBlueprint(id);
      setView({ name: 'result', plan: saved.plan, id: saved.id, fromPlans: true });
    } catch (err) {
      const message = err instanceof Error ? tError(err.message) : t('err.openPlan');
      toast.error(message, { style: { ...toastStyle.style, border: '1px solid rgba(220, 38, 38, 0.35)' } });
    } finally {
      setOpeningPlan(false);
    }
  };

  const openSavedPlan = (saved: SavedBlueprint) =>
    setView({ name: 'result', plan: saved.plan, id: saved.id, fromPlans: true });

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // clearing local state is enough for the UI
    }
    setUser(null);
    setView({ name: 'landing' });
    toast.success(t('err.loggedOut'), toastStyle);
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-lime-600/25 border-t-lime-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" />
      {openingPlan && (
        <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-lime-600/25 border-t-lime-600 animate-spin" />
          <p className="text-sm text-slate-600">Opening your blueprint…</p>
        </div>
      )}
      {view.name === 'landing' && (
        <LandingPage
          onGetBlueprint={handleGetBlueprint}
          user={user}
          onLogin={() => openAuth('login', 'landing')}
          onSignup={() => openAuth('signup', 'landing')}
          onLogout={handleLogout}
          onOpenPlans={openDashboard}
          onHome={openHome}
        />
      )}

      {view.name === 'auth' && (
        <AuthPage
          mode={authMode}
          onBack={() => setView({ name: 'landing' })}
          onSuccess={(u) => {
            setUser(u);
            // Signing in has to land somewhere. A blueprint in progress wins;
            // otherwise the account's own page, not the marketing page.
            setView(view.then === 'wizard' ? { name: 'wizard' } : { name: 'dashboard' });
            toast.success(t('auth.signedIn', { name: u.name || u.email }), toastStyle);
          }}
        />
      )}

      {view.name === 'dashboard' && user && (
        <Dashboard
          user={user}
          onOpenPlan={openSavedPlan}
          onOpenPlanId={openPlanById}
          onNew={() => setView({ name: 'wizard' })}
          onOpenPlans={openPlans}
          onHome={openHome}
          onLogout={handleLogout}
        />
      )}

      {view.name === 'plans' && user && (
        <PlansPage
          user={user}
          onOpen={openSavedPlan}
          onNew={() => setView({ name: 'wizard' })}
          onHome={openHome}
          onDashboard={openDashboard}
          onLogout={handleLogout}
        />
      )}

      {view.name === 'wizard' && (
        <OnboardingWizard
          onComplete={handleComplete}
          onCancel={() => (user ? setView({ name: 'dashboard' }) : setView({ name: 'landing' }))}
        />
      )}

      {view.name === 'generating' && (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center gap-4 overflow-x-clip">
          <div className="w-10 h-10 rounded-full border-2 border-lime-600/25 border-t-lime-600 animate-spin" />
          <p className="text-sm text-slate-600">{t('app.generating')}</p>
        </div>
      )}

      {view.name === 'result' && (
        <BlueprintResult
          plan={view.plan}
          id={view.id}
          user={user}
          onRestart={() => setView(user ? { name: 'wizard' } : { name: 'landing' })}
          onLogout={handleLogout}
          onOpenPlans={openPlans}
        />
      )}
    </>
  );
}

export default App;
