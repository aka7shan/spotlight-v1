import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'landing' | 'netflix' | 'instagram' | 'terminal' | 'gpt' | 'arcade' | 'reddit' | 'story';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

interface PortfolioStore {
  // Theme
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;

  // Gamification
  xp: number;
  level: string;
  addXP: (amount: number) => void;
  sectionsVisited: string[];
  visitSection: (section: string) => void;
  themesVisited: ThemeType[];

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;

  // Easter eggs
  easterEggsFound: string[];
  findEasterEgg: (id: string) => void;

  // Games
  highScores: Record<string, number>;
  setHighScore: (game: string, score: number) => void;
}

const defaultAchievements: Achievement[] = [
  { id: 'theme_hopper', name: 'Theme Hopper', description: 'Try 3 different themes', icon: '🎨', unlocked: false },
  { id: 'all_themes', name: 'Shapeshifter', description: 'Try all 6 themes', icon: '🦎', unlocked: false },
  { id: 'easter_hunter', name: 'Easter Egg Hunter', description: 'Find your first easter egg', icon: '🥚', unlocked: false },
  { id: 'egg_master', name: 'Egg Master', description: 'Find 5 easter eggs', icon: '🏆', unlocked: false },
  { id: 'full_explorer', name: 'Full Explorer', description: 'Visit all portfolio sections', icon: '🗺️', unlocked: false },
  { id: 'gamer', name: 'Gamer', description: 'Play a mini game', icon: '🎮', unlocked: false },
  { id: 'high_scorer', name: 'High Scorer', description: 'Score 100+ in any game', icon: '⭐', unlocked: false },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Type 60+ WPM in Code Typer', icon: '⚡', unlocked: false },
  { id: 'night_owl', name: 'Night Owl', description: 'Visit between midnight and 5 AM', icon: '🦉', unlocked: false },
  { id: 'konami', name: 'Konami Master', description: 'Enter the Konami Code', icon: '🕹️', unlocked: false },
  { id: 'hire_me', name: 'Recruiter?', description: 'Type "hire me" anywhere', icon: '💼', unlocked: false },
  { id: 'terminal_ninja', name: 'Terminal Ninja', description: 'Use 10+ commands in Terminal mode', icon: '🥷', unlocked: false },
];

function getLevel(xp: number): string {
  if (xp >= 1000) return '🏆 Legend';
  if (xp >= 500) return '🔥 Hire This Guy';
  if (xp >= 300) return '⭐ Superfan';
  if (xp >= 150) return '🚀 Fan';
  if (xp >= 50) return '🔍 Explorer';
  return '👋 Visitor';
}

export const useStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      // Theme
      currentTheme: 'landing',
      setTheme: (theme) => {
        const state = get();
        const newThemesVisited = state.themesVisited.includes(theme)
          ? state.themesVisited
          : [...state.themesVisited, theme];

        set({ currentTheme: theme, themesVisited: newThemesVisited });

        // Award XP for trying new themes
        if (!state.themesVisited.includes(theme) && theme !== 'landing') {
          get().addXP(20);
        }

        // Check theme achievements
        if (newThemesVisited.filter(t => t !== 'landing').length >= 3) {
          get().unlockAchievement('theme_hopper');
        }
        if (newThemesVisited.filter(t => t !== 'landing').length >= 6) {
          get().unlockAchievement('all_themes');
        }
      },

      // Gamification
      xp: 0,
      level: '👋 Visitor',
      addXP: (amount) => {
        const newXP = get().xp + amount;
        set({ xp: newXP, level: getLevel(newXP) });
      },
      sectionsVisited: [],
      visitSection: (section) => {
        const state = get();
        if (!state.sectionsVisited.includes(section)) {
          set({ sectionsVisited: [...state.sectionsVisited, section] });
          get().addXP(10);

          // Check full explorer
          const allSections = ['about', 'skills', 'experience', 'projects', 'education', 'certifications', 'contact'];
          const newVisited = [...state.sectionsVisited, section];
          if (allSections.every(s => newVisited.includes(s))) {
            get().unlockAchievement('full_explorer');
          }
        }
      },
      themesVisited: [],

      // Achievements
      achievements: defaultAchievements,
      unlockAchievement: (id) => {
        const state = get();
        const achievement = state.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
          set({
            achievements: state.achievements.map(a =>
              a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
            ),
          });
          get().addXP(50);
        }
      },

      // Easter eggs
      easterEggsFound: [],
      findEasterEgg: (id) => {
        const state = get();
        if (!state.easterEggsFound.includes(id)) {
          set({ easterEggsFound: [...state.easterEggsFound, id] });
          get().addXP(30);

          // Check easter egg achievements
          const newFound = [...state.easterEggsFound, id];
          if (newFound.length >= 1) get().unlockAchievement('easter_hunter');
          if (newFound.length >= 5) get().unlockAchievement('egg_master');
        }
      },

      // Games
      highScores: {},
      setHighScore: (game, score) => {
        const state = get();
        const currentHigh = state.highScores[game] || 0;
        if (score > currentHigh) {
          set({ highScores: { ...state.highScores, [game]: score } });
        }
        get().unlockAchievement('gamer');
        if (score >= 100) get().unlockAchievement('high_scorer');
      },
    }),
    {
      name: 'akarshan-portfolio-store',
    }
  )
);

// Night owl check
const hour = new Date().getHours();
if (hour >= 0 && hour < 5) {
  useStore.getState().unlockAchievement('night_owl');
}

// Console easter egg
console.log(
  '%c🚀 Akarshan Sharma — Portfolio',
  'font-size: 24px; font-weight: bold; color: #e50914; text-shadow: 2px 2px 0 #000;'
);
console.log(
  '%cHey developer! 👋 Like what you see under the hood?\nLet\'s connect: akaxyz@gmail.com\n\nPS: Try the Konami Code on the landing page... ↑↑↓↓←→←→BA',
  'font-size: 14px; color: #00ff00; background: #111; padding: 10px; border-radius: 5px;'
);

