import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import Eyes from './Eyes';

interface HeaderProps {
  onResumeClick: () => void;
  visible?: boolean;
}

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'games', label: 'Games' },
];

export default function Header({ onResumeClick, visible = true }: HeaderProps) {
  const [show, setShow] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const colorMode = useStore((s) => s.colorMode);
  const toggleColorMode = useStore((s) => s.toggleColorMode);
  const light = colorMode === 'light';

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      setScrolled(y > 50);

      if (y > lastScrollY.current && y > 300) {
        setShow(false);
      } else {
        setShow(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[80] flex justify-center px-4 pt-3"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: show ? 0 : -100, opacity: show ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        <nav
          className="flex items-center justify-between w-full max-w-5xl px-5 py-2.5 rounded-2xl"
          style={{
            background: scrolled
              ? light ? 'rgba(245, 245, 245, 0.9)' : 'rgba(10, 10, 10, 0.85)'
              : light ? 'rgba(245, 245, 245, 0.6)' : 'rgba(10, 10, 10, 0.6)',
            backdropFilter: 'blur(20px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            border: `1px solid rgba(var(--lr-b), 0.08)`,
            boxShadow: scrolled
              ? light ? '0 8px 32px rgba(0,0,0,0.08), inset 0 -1px 0 rgba(0,0,0,0.04)' : '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : 'none',
            transition: 'background 0.3s, box-shadow 0.3s, border-color 0.3s',
          }}
        >
          {/* Logo + Eyes */}
          <button
            className="flex items-center gap-2.5 group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="font-black text-lg tracking-tight" style={{ color: `rgba(var(--lr-t), 1)` }}>
              <span className="text-red-500">&lt;</span>
              AS
              <span className="text-red-500"> /&gt;</span>
            </span>
            <Eyes size={8} className="hidden md:inline-flex opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-3 py-1.5 text-[13px] rounded-lg transition-all duration-200"
                style={{
                  color: `rgba(var(--lr-t), 0.85)`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = `rgba(var(--lr-t), 1)`; e.currentTarget.style.background = `rgba(var(--lr-t), 0.08)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = `rgba(var(--lr-t), 0.85)`; e.currentTarget.style.background = 'transparent'; }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA + Toggle + Mobile */}
          <div className="flex items-center gap-2">
            {/* Color mode toggle */}
            <button
              onClick={toggleColorMode}
              className="p-2 rounded-lg transition-all duration-300 cursor-pointer"
              style={{
                color: `rgba(var(--lr-t), 0.5)`,
                background: `rgba(var(--lr-t), 0.04)`,
              }}
              title={light ? 'Switch to dark' : 'Switch to light'}
            >
              <motion.div
                key={colorMode}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {light ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </motion.div>
            </button>

            <button
              onClick={onResumeClick}
              className="px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-colors"
              style={{
                background: `var(--lr-btn-bg)`,
                color: `var(--lr-btn-text)`,
              }}
            >
              Resume
            </button>
            <button
              className="md:hidden p-1.5"
              style={{ color: `rgba(var(--lr-t), 0.6)` }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                {mobileMenuOpen ? (
                  <path d="M5 5l10 10M15 5L5 15" />
                ) : (
                  <path d="M3 6h14M3 10h14M3 14h14" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[79] pt-20 px-4"
            style={{ background: light ? 'rgba(245,245,245,0.95)' : 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col gap-1 max-w-sm mx-auto">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.id}
                  className="text-left px-4 py-3.5 text-lg rounded-xl transition-colors"
                  style={{ color: `rgba(var(--lr-t), 0.7)` }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(item.id)}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
