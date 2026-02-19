import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../../data/portfolio';
import { useStore } from '../../store/useStore';
import TechTrivia from '../../games/TechTrivia';

interface CardItem {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  year?: string;
}

export default function NetflixTheme() {
  const setTheme = useStore((s) => s.setTheme);
  const visitSection = useStore((s) => s.visitSection);
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [showTrivia, setShowTrivia] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    visitSection('about');
  }, [visitSection]);

  // Transform data into Netflix-style rows
  const experienceCards: CardItem[] = portfolioData.experience.map((exp) => ({
    title: exp.company,
    subtitle: exp.role,
    description: exp.bullets.join('\n\n'),
    tags: exp.techStack.split(', '),
    year: exp.duration,
  }));

  const projectCards: CardItem[] = portfolioData.projects.map((proj) => ({
    title: proj.name,
    subtitle: proj.techStack,
    description: proj.bullets.join('\n\n'),
    tags: proj.techStack.split(', '),
    year: proj.year,
  }));

  const skillCards: CardItem[] = portfolioData.skills.map((cat) => ({
    title: cat.category,
    subtitle: `${cat.skills.length} skills`,
    description: cat.skills.join(' • '),
    tags: cat.skills.slice(0, 5),
  }));

  const certCards: CardItem[] = portfolioData.certifications.map((cert) => ({
    title: cert.name,
    subtitle: cert.issuer,
    description: `Certified by ${cert.issuer}`,
    tags: [cert.issuer],
  }));

  const rows = [
    { title: '🔥 Trending Now: Experience', cards: experienceCards, section: 'experience' },
    { title: '⭐ Top Rated: Projects', cards: projectCards, section: 'projects' },
    { title: '📚 My List: Skills', cards: skillCards, section: 'skills' },
    { title: '🏆 Award Winners: Certifications', cards: certCards, section: 'certifications' },
  ];

  // Netflix-style color schemes for cards
  const cardColors = [
    'from-red-900 to-red-700',
    'from-blue-900 to-blue-700',
    'from-purple-900 to-purple-700',
    'from-emerald-900 to-emerald-700',
    'from-orange-900 to-orange-700',
    'from-cyan-900 to-cyan-700',
    'from-pink-900 to-pink-700',
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Netflix Intro Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div className="text-center">
              <motion.h1
                className="text-6xl md:text-8xl font-black tracking-wider"
                style={{ color: '#e50914' }}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 1.1, 1], opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                AKARSHAN
              </motion.h1>
              <motion.div
                className="h-1 bg-red-600 mx-auto mt-4"
                initial={{ width: 0 }}
                animate={{ width: 300 }}
                transition={{ delay: 1, duration: 1 }}
              />
              <motion.p
                className="text-gray-400 mt-4 text-xl tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                O R I G I N A L S
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Bar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 to-transparent px-4 md:px-8 py-4"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ delay: 3.2, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1
              className="text-2xl md:text-3xl font-black cursor-pointer"
              style={{ color: '#e50914' }}
              onClick={() => setTheme('landing')}
            >
              AKARSHAN
            </h1>
            <div className="hidden md:flex gap-5 text-sm text-gray-300">
              {['Experience', 'Projects', 'Skills', 'Certifications'].map((item) => (
                <button
                  key={item}
                  className="hover:text-white transition-colors cursor-pointer"
                  onClick={() => {
                    const el = document.getElementById(item.toLowerCase());
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme('landing')}
              className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Switch Theme
            </button>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-sm font-bold">
              A
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Banner */}
      <motion.div
        className="relative h-[70vh] md:h-[85vh] flex items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-blue-900/20" />

        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(229,9,20,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(229,9,20,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#141414] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24 w-full">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 3.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                TOP 10
              </span>
              <span className="text-gray-400 text-sm">Software Engineers Today</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black mb-4 max-w-2xl leading-tight">
              {portfolioData.name}
            </h1>

            <p className="text-sm md:text-lg text-gray-300 max-w-xl mb-6 leading-relaxed">
              {portfolioData.summary}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={`mailto:${portfolioData.email}`}
                className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded hover:bg-gray-200 transition-colors"
              >
                ▶ Contact Me
              </a>
              <button
                onClick={() => {
                  const el = document.getElementById('experience');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-gray-600/70 text-white font-bold px-6 py-3 rounded hover:bg-gray-600 transition-colors cursor-pointer"
              >
                ℹ More Info
              </button>
            </div>

            <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
              <span className="text-green-500 font-semibold">98% Match</span>
              <span>2023 – Present</span>
              <span className="border border-gray-500 px-2 py-0.5 text-xs">HD</span>
              <span>Full Stack</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Rows */}
      <div className="relative z-10 -mt-8 pb-20">
        {rows.map((row, rowIndex) => (
          <motion.div
            key={row.title}
            id={row.section}
            className="mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            onViewportEnter={() => visitSection(row.section)}
          >
            <h2 className="text-lg md:text-xl font-bold px-4 md:px-8 mb-3">
              {row.title}
            </h2>

            <div className="flex gap-2 md:gap-3 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-hide">
              {row.cards.map((card, cardIndex) => (
                <motion.div
                  key={card.title}
                  className={`flex-shrink-0 w-[250px] md:w-[300px] h-[140px] md:h-[170px] rounded-md overflow-hidden cursor-pointer relative group bg-gradient-to-br ${cardColors[(rowIndex * 3 + cardIndex) % cardColors.length]}`}
                  whileHover={{ scale: 1.08, zIndex: 20 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setSelectedCard(card);
                    setActiveRow(row.title);
                    visitSection(row.section);
                  }}
                >
                  {/* Card content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg md:text-xl text-white drop-shadow-lg">
                        {card.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-200 mt-1 opacity-80">
                        {card.subtitle}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {card.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-black/40 text-gray-200 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {card.tags.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{card.tags.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                  {/* Year badge */}
                  {card.year && (
                    <div className="absolute top-2 right-2 bg-black/60 text-[10px] text-gray-300 px-2 py-0.5 rounded">
                      {card.year}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Education Section */}
        <motion.div
          id="education"
          className="px-4 md:px-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onViewportEnter={() => visitSection('education')}
        >
          <h2 className="text-lg md:text-xl font-bold mb-4">🎓 Behind the Scenes: Education</h2>
          {portfolioData.education.map((edu) => (
            <div key={edu.institution} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold">{edu.institution}</h3>
              <p className="text-gray-400 mt-1">{edu.degree}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>{edu.duration}</span>
                <span className="text-green-500 font-semibold">{edu.gpa}</span>
                {edu.location && <span>{edu.location}</span>}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          className="px-4 md:px-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onViewportEnter={() => visitSection('contact')}
        >
          <h2 className="text-lg md:text-xl font-bold mb-4">📬 Post Credits: Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '📧', label: 'Email', value: portfolioData.email, href: `mailto:${portfolioData.email}` },
              { icon: '📱', label: 'Phone', value: portfolioData.phone },
              { icon: '🔗', label: 'LinkedIn', value: portfolioData.linkedin, href: `https://${portfolioData.linkedin}` },
              { icon: '💻', label: 'LeetCode', value: portfolioData.leetcode, href: `https://${portfolioData.leetcode}` },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-red-600/50 transition-colors flex items-center gap-4 no-underline"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-gray-400 text-xs">{item.label}</p>
                  <p className="text-white">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              className="bg-[#181818] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="relative h-48 bg-gradient-to-br from-red-900 to-gray-900 p-6 flex items-end">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-[#181818] rounded-full flex items-center justify-center text-white hover:bg-gray-700 cursor-pointer"
                >
                  ✕
                </button>
                <div>
                  <h2 className="text-3xl font-black text-white">{selectedCard.title}</h2>
                  <p className="text-gray-300 mt-1">{selectedCard.subtitle}</p>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 text-sm">
                  <span className="text-green-500 font-semibold">98% Match</span>
                  {selectedCard.year && <span className="text-gray-400">{selectedCard.year}</span>}
                  <span className="border border-gray-500 px-2 py-0.5 text-xs text-gray-400">
                    {activeRow?.split(':')[0]?.replace(/[^a-zA-Z ]/g, '').trim()}
                  </span>
                </div>

                <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                  {selectedCard.description.split('\n\n').map((bullet, i) => (
                    <div key={i} className="flex gap-2 mb-3">
                      <span className="text-red-500 mt-0.5 shrink-0">▸</span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  {selectedCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Still Watching? Trivia Button */}
      <div className="text-center py-8">
        <button
          onClick={() => setShowTrivia(true)}
          className="bg-[#e50914] hover:bg-[#f6121d] text-white font-bold py-3 px-8 rounded cursor-pointer transition-colors text-sm"
        >
          🍿 Are You Still Watching? — Take the Tech Quiz!
        </button>
      </div>

      {/* Trivia Modal */}
      {showTrivia && <TechTrivia variant="netflix" onExit={() => setShowTrivia(false)} />}

      {/* Footer */}
      <footer className="text-center text-gray-600 text-sm py-8 border-t border-gray-800">
        <p>Built with ❤️ by Akarshan Sharma</p>
        <p className="text-xs mt-1 text-gray-700">
          Hint: Try the Konami Code ↑↑↓↓←→←→BA
        </p>
      </footer>
    </div>
  );
}

