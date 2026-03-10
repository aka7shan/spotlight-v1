import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../data/portfolio';
import type { Experience } from '../data/portfolio';
import { useStore } from '../store/useStore';

export default function ExperienceCarousel() {
  const experiences = portfolioData.experience;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [modalData, setModalData] = useState<Experience | null>(null);
  const light = useStore((s) => s.colorMode) === 'light';

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const activeIndexRaw = useTransform(
    scrollYProgress,
    [0, 1],
    [0, experiences.length - 0.01],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  activeIndexRaw.on('change', (v) => {
    const idx = Math.min(Math.floor(v), experiences.length - 1);
    if (idx !== activeIndex && idx >= 0) setActiveIndex(idx);
  });

  const sectionHeight = `${Math.max(experiences.length * 100, 200)}vh`;

  const cardBg = light ? '#A47DAB' : '#D4AF37';
  const cardText = '#000';
  const cardTextSec = 'rgba(0,0,0,0.65)';
  const cardTextMuted = 'rgba(0,0,0,0.4)';
  const cardBorder = '1.5px solid #000';

  return (
    <>
      <section
        ref={sectionRef}
        style={{ height: sectionHeight, backgroundColor: 'var(--lr-bg)' }}
        className="relative z-20"
      >
        <div className="sticky top-0 h-screen flex flex-col items-center justify-start pt-20 md:pt-24 px-4 md:px-16 overflow-hidden">
          <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-xs tracking-[0.4em] uppercase mb-2" style={{ color: `rgba(var(--lr-t), 0.2)` }}>Where I've Worked</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: `rgba(var(--lr-t), 1)` }}>Experience</h2>
          </motion.div>

          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 md:gap-12 items-center">

            {/* Capsule Selector */}
            <div className="flex md:flex-col gap-2 md:gap-3 flex-shrink-0">
              {experiences.map((exp, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap"
                  style={{
                    background: i === activeIndex ? cardBg : (light ? 'rgba(164,125,171,0.2)' : 'rgba(212,175,55,0.2)'),
                    border: `1.5px solid ${i === activeIndex ? '#000' : (light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)')}`,
                    color: i === activeIndex ? cardText : `rgba(var(--lr-t), 0.5)`,
                  }}
                >
                  {exp.company}
                  {i === activeIndex && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `1.5px solid rgba(var(--lr-b), 0.3)` }}
                      layoutId="capsule-highlight"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Preview Card */}
            <div className="flex-1 w-full min-h-[320px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  className="rounded-2xl p-6 md:p-8 cursor-pointer group"
                  style={{
                    background: cardBg,
                    border: cardBorder,
                  }}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  onClick={() => setModalData(experiences[activeIndex])}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: cardTextMuted }}>
                        {experiences[activeIndex].duration}
                      </p>
                      <h3 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: cardText }}>
                        {experiences[activeIndex].company}
                      </h3>
                      <p className="text-sm md:text-base" style={{ color: cardTextSec }}>
                        {experiences[activeIndex].role}
                      </p>
                    </div>
                    <span className="text-2xl transition-colors" style={{ color: cardTextMuted }}>
                      +
                    </span>
                  </div>

                  {experiences[activeIndex].location && (
                    <p className="text-xs mb-4" style={{ color: cardTextMuted }}>
                      {experiences[activeIndex].location}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-5">
                    {experiences[activeIndex].techStack.split(', ').map((tech) => (
                      <span key={tech} className="px-3 py-1 text-xs rounded-full" style={{ color: cardText, border: cardBorder }}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {experiences[activeIndex].bullets.slice(0, 2).map((bullet, i) => (
                      <p key={i} className="text-sm leading-relaxed line-clamp-2" style={{ color: cardTextSec }}>
                        {bullet}
                      </p>
                    ))}
                  </div>

                  <p className="text-xs mt-4 transition-colors" style={{ color: cardTextMuted }}>
                    Click to see full details →
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center gap-2 mt-4">
                {experiences.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeIndex ? '24px' : '8px',
                      background: i === activeIndex ? `rgba(var(--lr-t), 0.5)` : `rgba(var(--lr-t), 0.1)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {modalData && (
          <ExperienceModal experience={modalData} onClose={() => setModalData(null)} light={light} />
        )}
      </AnimatePresence>
    </>
  );
}

function ExperienceModal({ experience, onClose, light }: { experience: Experience; onClose: () => void; light: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: light ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.7)' }} />

      <motion.div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 md:p-8"
        style={{
          background: light
            ? 'linear-gradient(165deg, rgba(255,255,255,0.99) 0%, rgba(245,245,245,0.99) 100%)'
            : 'linear-gradient(165deg, rgba(20,20,20,0.98) 0%, rgba(8,8,8,0.99) 100%)',
          border: `1px solid rgba(var(--lr-b), 0.1)`,
        }}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-xl transition-colors cursor-pointer" style={{ color: `rgba(var(--lr-t), 0.3)` }}>
          ✕
        </button>

        <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: `rgba(var(--lr-t), 0.3)` }}>{experience.duration}</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: `rgba(var(--lr-t), 1)` }}>{experience.company}</h2>
        <p className="text-base md:text-lg mb-1" style={{ color: `rgba(var(--lr-t), 0.6)` }}>{experience.role}</p>
        {experience.location && (
          <p className="text-sm mb-5" style={{ color: `rgba(var(--lr-t), 0.25)` }}>{experience.location}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {experience.techStack.split(', ').map((tech) => (
            <span key={tech} className="px-3 py-1 text-xs rounded-full" style={{ background: `rgba(var(--lr-t), 0.06)`, color: `rgba(var(--lr-t), 0.5)`, border: `1px solid rgba(var(--lr-b), 0.1)` }}>
              {tech.trim()}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          {experience.bullets.map((bullet, i) => (
            <motion.div key={i} className="flex gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <span className="mt-1 flex-shrink-0" style={{ color: `rgba(var(--lr-t), 0.2)` }}>▸</span>
              <p className="text-sm leading-relaxed" style={{ color: `rgba(var(--lr-t), 0.5)` }}>{bullet}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
