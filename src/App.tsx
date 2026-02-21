import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import type { ThemeType } from './store/useStore';
import Landing from './components/Landing/Landing';

import NetflixTheme from './themes/Netflix/NetflixTheme';
import TerminalTheme from './themes/Terminal/TerminalTheme';
import GPTTheme from './themes/GPT/GPTTheme';
import InstagramTheme from './themes/Instagram/InstagramTheme';
import ArcadeTheme from './themes/Arcade/ArcadeTheme';
// import StoryTheme from './themes/Story/StoryTheme';

const routeToTheme: Record<string, ThemeType> = {
  '/': 'landing',
  '/netflix': 'netflix',
  '/terminal': 'terminal',
  '/gpt': 'gpt',
  '/instagram': 'instagram',
  '/arcade': 'arcade',
  // '/story': 'story',
};

function App() {
  const location = useLocation();
  const setTheme = useStore((s) => s.setTheme);
  const scrollPositions = useRef<Record<string, number>>({});
  const transitioning = useRef(false);

  // Continuously save scroll position per route (paused during transitions)
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

  // Sync route → store and restore scroll after animation
  useEffect(() => {
    transitioning.current = true;
    const theme = routeToTheme[location.pathname] || 'landing';
    setTheme(theme);

    // Wait for exit (0.4s) + enter (0.4s) animations to finish
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
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/netflix" element={<NetflixTheme />} />
          <Route path="/terminal" element={<TerminalTheme />} />
          <Route path="/gpt" element={<GPTTheme />} />
          <Route path="/instagram" element={<InstagramTheme />} />
          <Route path="/arcade" element={<ArcadeTheme />} />
          {/* <Route path="/story" element={<StoryTheme />} /> */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
