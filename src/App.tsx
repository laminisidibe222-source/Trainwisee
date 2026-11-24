import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LandingPage } from './sections/LandingPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { BlueprintResult } from './components/BlueprintResult';
import { AuthPage } from './components/AuthPage';
import { PlansPage } from './components/PlansPage';
import { Dashboard } from './components/Dashboard';
import { Shell } from './components/dash/Shell';
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

/**
 * The account area is URL-driven, not a view enum: /app, /app/plans,
 * /app/plan/:id and /app/new each have an address, so reload, the back
 * button and a pasted link all land somewhere sensible.
 */
type Route =
  | { name: 'landing' }
  | { name: 'auth'; mode: 'login' | 'signup'; next: string | null }
  | { name: 'dashboard' }
  | { name: 'plans' }
  | { name: 'plan'; id: number }
  | { name: 'wizard' }
  | { name: 'notFound' };

const ACCOUNT_ROUTES: Route['name'][] = ['dashboard', 'plans', 'plan', 'wizard'];

function routeFromUrl(raw: string): Route {
  const url = new URL(raw, window.location.origin);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const next = url.searchParams.get('next');

  if (path === '/') return { name: 'landing' };
  if (path === '/login') return { name: 'auth', mode: 'login', next };
  if (path === '/signup') return { name: 'auth', mode: 'signup', next };
  if (path === '/app') return { name: 'dashboard' };
  if (path === '/app/plans') return { name: 'plans' };
  if (path === '/app/new') return { name: 'wizard' };
  const plan = path.match(/^\/app\/plan\/(\d+)$/);
  if (plan) return { name: 'plan', id: Number(plan[1]) };
  return { name: 'notFound' };
}

const toastStyle = {
  style: { background: '#FFFFFF', color: '#0F172A', border: '1px solid rgba(101, 163, 13, 0.35)' },
};

const errorToast = (message: string) =>
  toast.error(message, { style: { ...toastStyle.style, border: '1px solid rgba(220, 38, 38, 0.35)' } });

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [url, setUrl] = useState(() => window.location.pathname + window.location.search);
  const [generating, setGenerating] = useState(false);
  const [preloaded, setPreloaded] = useState<SavedBlueprint | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const { t, tError } = useI18n();

  const route = useMemo(() => routeFromUrl(url), [url]);

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    const current = window.location.pathname + window.location.search;
    if (to !== current) {
      if (opts?.replace) window.history.replaceState(null, '', to);
      else window.history.pushState(null, '', to);
    }
    setUrl(to);
    window.scrollTo({ top: 0 });
  }, []);

  // Browser back / forward keep React in sync with the address bar.
  useEffect(() => {
    const onPop = () => setUrl(window.location.pathname + window.location.search);
    window.addEventListener('popstate', onPop);
    // Back-forward cache restores the DOM without a popstate: resync anyway.
    window.addEventListener('pageshow', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('pageshow', onPop);
    };
  }, []);

  // Restore the session from the httpOnly cookie on first paint.
  useEffect(() => {
    let alive = true;
    getMe()
      .then((res) => {
        if (!alive) return;
        setUser(res.user);
      })
      .catch(() => undefined)
      .finally(() => alive && setBooting(false));
    return () => {
      alive = false;
    };
  }, []);

  /**
   * Access control lives in one place. A signed-in visitor is never shown the
   * funnel, and a visitor never sees an account screen.
   */
  useEffect(() => {
    if (booting || generating) return;
    if (!user && ACCOUNT_ROUTES.includes(route.name)) {
      navigate(`/login?next=${encodeURIComponent(url)}`, { replace: true });
    } else if (user && route.name === 'auth') {
      // A login page reached from a deep link resumes that link.
      const next = route.next && route.next.startsWith('/') ? route.next : '/app';
      navigate(next, { replace: true });
    } else if (user && (route.name === 'landing' || route.name === 'notFound')) {
      navigate('/app', { replace: true });
    }
  }, [booting, generating, user, route, url, navigate]);

  // Direct links and refreshes on /app/plan/:id have no plan in memory yet.
  useEffect(() => {
    if (route.name !== 'plan' || preloaded?.id === route.id) return;
    let alive = true;
    setLoadingPlan(true);
    setPlanError(null);
    getBlueprint(route.id)
      .then((saved) => alive && setPreloaded(saved))
      .catch((err) => {
        if (!alive) return;
        const message = err instanceof Error ? tError(err.message) : t('err.openPlan');
        setPlanError(message);
        errorToast(message);
        navigate('/app/plans', { replace: true });
      })
      .finally(() => alive && setLoadingPlan(false));
    return () => {
      alive = false;
    };
    // `t`/`tError` are stable enough for this one-shot fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, preloaded?.id]);

  const openPlan = (saved: SavedBlueprint) => {
    setPreloaded(saved);
    navigate(`/app/plan/${saved.id}`);
  };

  const openPlanById = async (id: number) => {
    if (preloaded?.id === id) return navigate(`/app/plan/${id}`);
    setLoadingPlan(true);
    try {
      openPlan(await getBlueprint(id));
    } catch (err) {
      errorToast(err instanceof Error ? tError(err.message) : t('err.openPlan'));
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleComplete = async (profile: OnboardingData) => {
    setGenerating(true);
    try {
      const { blueprint, id } = await createBlueprint(profile);
      setPreloaded({ id, plan: blueprint, createdAt: new Date().toISOString(), modelVersion: blueprint.modelVersion ?? null });
      toast.success(t('err.saved'), toastStyle);
      navigate(`/app/plan/${id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        toast.error(t('err.session'), toastStyle);
        navigate('/login?next=%2Fapp%2Fnew', { replace: true });
        return;
      }
      errorToast(err instanceof Error ? tError(err.message) : t('err.plan'));
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // clearing local state is enough for the UI
    }
    setUser(null);
    setPreloaded(null);
    navigate('/', { replace: true });
    toast.success(t('err.loggedOut'), toastStyle);
  };

  const accountNavigate = (action: 'dashboard' | 'plans' | 'new') =>
    navigate(action === 'dashboard' ? '/app' : action === 'plans' ? '/app/plans' : '/app/new');

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime-600/25 border-t-lime-600" />
      </div>
    );
  }

  const showGenerating = generating || loadingPlan;

  return (
    <>
      <Toaster position="bottom-right" />
      {showGenerating && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-lime-600/25 border-t-lime-600" />
          <p className="text-sm text-slate-600">{generating ? t('app.generating') : t('plans.opening')}</p>
        </div>
      )}

      {route.name === 'landing' && (
        <LandingPage
          onGetBlueprint={() => navigate(user ? '/app/new' : '/signup?next=%2Fapp%2Fnew')}
          user={user}
          onLogin={() => navigate('/login')}
          onSignup={() => navigate('/signup')}
          onLogout={handleLogout}
          onOpenPlans={() => navigate('/app')}
          onHome={() => navigate(user ? '/app' : '/')}
        />
      )}

      {route.name === 'auth' && (
        <AuthPage
          mode={route.mode}
          onBack={() => navigate('/')}
          onSuccess={(u) => {
            setUser(u);
            toast.success(t('auth.signedIn', { name: u.name || u.email }), toastStyle);
            navigate(route.next && route.next.startsWith('/') ? route.next : '/app', { replace: true });
          }}
        />
      )}

      {route.name === 'dashboard' && user && (
        <Dashboard
          user={user}
          onOpenPlan={openPlan}
          onOpenPlanId={openPlanById}
          onNew={() => navigate('/app/new')}
          onOpenPlans={() => navigate('/app/plans')}
          onHome={() => navigate('/app')}
          onLogout={handleLogout}
        />
      )}

      {route.name === 'plans' && user && (
        <PlansPage
          user={user}
          onOpen={openPlan}
          onNew={() => navigate('/app/new')}
          onHome={() => navigate('/app')}
          onLogout={handleLogout}
        />
      )}

      {route.name === 'wizard' && user && (
        <Shell
          user={user}
          active="new"
          onNavigate={accountNavigate}
          onLogout={handleLogout}
          title={t('nav.newPlan')}
        >
          <OnboardingWizard
            embedded
            onComplete={handleComplete}
            onCancel={() => navigate('/app')}
          />
        </Shell>
      )}

      {route.name === 'plan' && user && preloaded?.id === route.id && (
        <BlueprintResult
          plan={preloaded.plan}
          id={preloaded.id}
          user={user}
          onRestart={() => navigate('/app/new')}
          onBack={() => navigate('/app/plans')}
          onDashboard={() => navigate('/app')}
          onPlans={() => navigate('/app/plans')}
          onLogout={handleLogout}
        />
      )}

      {route.name === 'plan' && user && preloaded?.id !== route.id && planError && (
        <Shell
          user={user}
          active="plans"
          onNavigate={accountNavigate}
          onLogout={handleLogout}
          title={t('nav.myPlans')}
        >
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">{planError}</p>
            <button
              onClick={() => navigate('/app/plans')}
              className="mt-3 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              {t('nav.myPlans')}
            </button>
          </div>
        </Shell>
      )}

      {/* Signed-out visitor landing on an account URL: the guard is about to
          redirect, so show the neutral loader rather than a flash of the funnel. */}
      {!user && ACCOUNT_ROUTES.includes(route.name) && (
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime-600/25 border-t-lime-600" />
        </div>
      )}
    </>
  );
}

export default App;
