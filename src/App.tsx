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
      toast.success('Blueprint saved to your account.', toastStyle);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        toast.error('Your session expired — sign in again.', toastStyle);
        openAuth('login', 'wizard');
        return;
      }
      const message = err instanceof Error ? err.message : 'Could not generate your blueprint.';
      toast.error(message, { style: { ...toastStyle.style, border: '1px solid rgba(220, 38, 38, 0.35)' } });
      setView({ name: 'wizard' });
    }
  };

  /** Signed-in home: the dashboard. */
  const openDashboard = () => setView({ name: 'dashboard' });

  /** The plan library, one click away from the dashboard. */
  const openPlans = () => setView({ name: 'plans' });

  /** Older plans are summaries on the dashboard, so they load on demand. */
  const openPlanById = async (id: number) => {
    setOpeningPlan(true);
    try {
      const saved = await getBlueprint(id);
      setView({ name: 'result', plan: saved.plan, id: saved.id, fromPlans: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not open that plan.';
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
    toast.success('Signed out.', toastStyle);
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
            toast.success(`Signed in as ${u.name || u.email}`, toastStyle);
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
          onHome={() => setView({ name: 'landing' })}
          onLogout={handleLogout}
        />
      )}

      {view.name === 'plans' && user && (
        <PlansPage
          user={user}
          onOpen={openSavedPlan}
          onNew={() => setView({ name: 'wizard' })}
          onHome={() => setView({ name: 'landing' })}
          onDashboard={openDashboard}
          onLogout={handleLogout}
        />
      )}

      {view.name === 'wizard' && (
        <OnboardingWizard
          onComplete={handleComplete}
          onCancel={() => setView({ name: 'landing' })}
        />
      )}

      {view.name === 'generating' && (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center gap-4 overflow-x-clip">
          <div className="w-10 h-10 rounded-full border-2 border-lime-600/25 border-t-lime-600 animate-spin" />
          <p className="text-sm text-slate-600">Computing your blueprint and saving it to Neon…</p>
        </div>
      )}

      {view.name === 'result' && (
        <BlueprintResult
          plan={view.plan}
          id={view.id}
          user={user}
          onRestart={() => setView({ name: 'landing' })}
          onLogout={handleLogout}
          onOpenPlans={openPlans}
        />
      )}
    </>
  );
}

export default App;
