import { useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';

import type { ThemeType } from './store/useStore';
import Landing from './components/Landing/Landing';
import GamesPage from './pages/GamesPage';

const NetflixTheme = lazy(() => import('./themes/Netflix/NetflixTheme'));
const TerminalTheme = lazy(() => import('./themes/Terminal/TerminalTheme'));
const GPTTheme = lazy(() => import('./themes/GPT/GPTTheme'));
const InstagramTheme = lazy(() => import('./themes/Instagram/InstagramTheme'));
const NotFound = lazy(() => import('./components/NotFound'));

const routeToTheme: Record<string, ThemeType> = {
  '/': 'landing',
  '/netflix': 'netflix',
  '/terminal': 'terminal',
  '/gpt': 'gpt',
  '/instagram': 'instagram',
};

function ThemeLoader() {
  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const setTheme = useStore((s) => s.setTheme);
  const scrollPositions = useRef<Record<string, number>>({});
  const transitioning = useRef(false);

  useEffect(() => {
    const path = location.pathname;
    const handler = () => {
      if (!transitioning.current) {
        scrollPositions.current[path] = window.scrollY;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [location.pathname]);

  useEffect(() => {
    transitioning.current = true;
    const theme = routeToTheme[location.pathname] || 'landing';
    setTheme(theme);

    const path = location.pathname;
    const restoreTimer = setTimeout(() => {
      const saved = scrollPositions.current[path];
      window.scrollTo(0, saved ?? 0);
    }, 850);
    const unlockTimer = setTimeout(() => {
      transitioning.current = false;
    }, 900);

    return () => {
      clearTimeout(restoreTimer);
      clearTimeout(unlockTimer);
    };
  }, [location.pathname, setTheme]);

  return (
    <Suspense fallback={<ThemeLoader />}>
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/netflix" element={<NetflixTheme />} />
        <Route path="/terminal" element={<TerminalTheme />} />
        <Route path="/gpt" element={<GPTTheme />} />
        <Route path="/instagram" element={<InstagramTheme />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
