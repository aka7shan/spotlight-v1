import { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { portfolioData } from '../data/portfolio';
import { useStore } from '../store/useStore';

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY = 500;

export default function ProjectCardStack() {
  const projects = portfolioData.projects;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');
  const [isDragging, setIsDragging] = useState(false);
  const light = useStore((s) => s.colorMode) === 'light';

  const visibleProjects = projects.slice(currentIndex, currentIndex + 3);
  const isFinished = currentIndex >= projects.length;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > SWIPE_VELOCITY;
    if (swipe) {
      setExitDirection(offset.x > 0 ? 'right' : 'left');
      setCurrentIndex((i) => i + 1);
    }
  };

  const dismiss = () => {
    setExitDirection('left');
    setCurrentIndex((i) => i + 1);
  };

  const reset = () => setCurrentIndex(0);

  const cardBg = light ? '#A47DAB' : '#D4AF37';
  const cardText = '#000';
  const cardTextSec = 'rgba(0,0,0,0.65)';
  const cardTextMuted = 'rgba(0,0,0,0.4)';
  const cardBorder = '1.5px solid #000';

  return (
    <section id="projects" className="relative z-20 py-16 md:py-24 px-4 md:px-16 scroll-mt-16" style={{ backgroundColor: 'var(--lr-bg)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:gap-16">

        {/* Left — Header */}
        <motion.div
          className="relative z-10 text-center md:text-left mb-6 md:mb-0 md:w-[30%] flex-shrink-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: `rgba(var(--lr-t), 0.2)` }}>What I've Built</p>
          <h2 className="text-3xl md:text-5xl font-black" style={{ color: `rgba(var(--lr-t), 1)` }}>Projects</h2>
          <p className="text-sm mt-3" style={{ color: `rgba(var(--lr-t), 0.4)` }}>
            Swipe cards to browse. {projects.length} projects.
          </p>
        </motion.div>

        {/* Right — Card Stack */}
        <div className="relative h-[420px] md:h-[460px] md:flex-1 flex items-start md:items-center justify-center pt-4 md:pt-0">
          {isFinished ? (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-lg mb-4" style={{ color: `rgba(var(--lr-t), 0.3)` }}>That's all for now!</p>
              <button
                onClick={reset}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors"
                style={{ color: `rgba(var(--lr-t), 1)`, border: `1px solid rgba(var(--lr-b), 0.15)` }}
              >
                See again
              </button>
            </motion.div>
          ) : (
            <>
              <AnimatePresence>
                {visibleProjects.map((project, stackIndex) => {
                  const isTop = stackIndex === 0;
                  const absIndex = currentIndex + stackIndex;

                  return (
                    <motion.div
                      key={absIndex}
                      className="absolute w-full max-w-lg cursor-grab active:cursor-grabbing"
                      style={{ zIndex: 3 - stackIndex }}
                      initial={{
                        scale: 1 - stackIndex * 0.05,
                        y: stackIndex * 14,
                        opacity: 1 - stackIndex * 0.2,
                      }}
                      animate={{
                        scale: 1 - stackIndex * 0.05,
                        y: stackIndex * 14,
                        opacity: 1 - stackIndex * 0.2,
                        rotateZ: 0,
                      }}
                      exit={
                        isTop
                          ? {
                              x: exitDirection === 'left' ? -400 : 400,
                              rotateZ: exitDirection === 'left' ? -15 : 15,
                              opacity: 0,
                              transition: { duration: 0.4, ease: 'easeIn' },
                            }
                          : undefined
                      }
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      drag={isTop ? 'x' : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.9}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={isTop ? handleDragEnd : undefined}
                    >
                      <div
                        className="rounded-2xl p-6 md:p-8"
                        style={{
                          background: cardBg,
                          border: cardBorder,
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold mb-1" style={{ color: cardText }}>
                              {project.name}
                            </h3>
                            <p className="text-xs" style={{ color: cardTextMuted }}>{project.year}</p>
                          </div>
                          {isTop && !isDragging && (
                            <button
                              onClick={dismiss}
                              className="text-sm transition-colors cursor-pointer"
                              style={{ color: cardTextMuted }}
                            >
                              Skip →
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-5">
                          {project.techStack.split(', ').map((tech) => (
                            <span key={tech} className="px-2.5 py-1 text-[11px] rounded-full" style={{ color: cardText, border: cardBorder }}>
                              {tech.trim()}
                            </span>
                          ))}
                        </div>

                        <div className="space-y-2 mb-5">
                          {project.bullets.slice(0, 3).map((bullet, i) => (
                            <p key={i} className="text-sm leading-relaxed line-clamp-2" style={{ color: cardTextSec }}>
                              <span className="mr-2" style={{ color: cardTextMuted }}>▸</span>
                              {bullet}
                            </p>
                          ))}
                        </div>

                        {project.github && (
                          <div className="flex gap-3">
                              <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-xs font-medium transition-colors underline" style={{ color: cardText }} onClick={(e) => e.stopPropagation()}>
                              GitHub →
                            </a>
                            {project.liveUrl && (
                              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium transition-colors underline" style={{ color: cardText }} onClick={(e) => e.stopPropagation()}>
                                Live Demo →
                              </a>
                            )}
                          </div>
                        )}

                        {isTop && (
                          <p className="text-[10px] mt-4 text-center" style={{ color: cardTextMuted }}>
                            ← Swipe to see next →
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div className="absolute bottom-0 text-xs" style={{ color: `rgba(var(--lr-t), 0.2)` }}>
                {currentIndex + 1} / {projects.length}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
