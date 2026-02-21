import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../../data/portfolio';
import { useStore } from '../../store/useStore';
import { useIsMobile } from '../../components/TouchControls';
import SnakeGame from '../../games/SnakeGame';
import DinoGame from '../../games/DinoGame';
import CodeTyper from '../../games/CodeTyper';
import MemoryMatch from '../../games/MemoryMatch';
import TechWordle from '../../games/TechWordle';
import FlappyBird from '../../games/FlappyBird';
import PongGame from '../../games/PongGame';
import SpaceInvaders from '../../games/SpaceInvaders';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'ascii';
  content: string;
}

const ASCII_BANNER = `
 █████╗ ██╗  ██╗ █████╗ ██████╗ ███████╗██╗  ██╗ █████╗ ███╗   ██╗
██╔══██╗██║ ██╔╝██╔══██╗██╔══██╗██╔════╝██║  ██║██╔══██╗████╗  ██║
███████║█████╔╝ ███████║██████╔╝███████╗███████║███████║██╔██╗ ██║
██╔══██║██╔═██╗ ██╔══██║██╔══██╗╚════██║██╔══██║██╔══██║██║╚██╗██║
██║  ██║██║  ██╗██║  ██║██║  ██║███████║██║  ██║██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═══╝
`;

const NEOFETCH = `
        .--.          akarshan@portfolio
       |o_o |         ------------------
       |:_/ |         OS: Developer OS v2.0
      //   \\ \\        Host: Full Stack Machine
     (|     | )       Kernel: React 19.x
    /'\\_   _/\`\\       Shell: TypeScript 5.x
    \\___)=(___/       Resolution: 1920x1080 (Responsive)
                      DE: Tailwind CSS
  akarshan@dev        WM: Framer Motion
                      Terminal: Portfolio v1.0
                      CPU: Java/Python/JS/TS
                      Memory: MongoDB/MySQL/Oracle
                      GPU: React/Next.js/Vue
                      Uptime: 3+ years
`;

// ─── Matrix Rain Canvas Component ───────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Characters to use: katakana, latin, numbers, symbols
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]<>/\\|;:+=~`';

    let columns: number;
    let drops: number[];
    let fontSize: number;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      fontSize = 14;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -100);
    };

    init();

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Pick a random character
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Head character is bright white-green
        const y = drops[i] * fontSize;
        if (y > 0 && y < canvas.height) {
          // Bright leading character
          ctx.fillStyle = '#ffffff';
          ctx.fillText(char, i * fontSize, y);

          // Slightly dimmer previous character
          if (y - fontSize > 0) {
            ctx.fillStyle = '#39ff14';
            const prevChar = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(prevChar, i * fontSize, y - fontSize);
          }
        }

        // Regular trailing characters
        ctx.fillStyle = `rgba(0, ${150 + Math.random() * 105}, 0, ${0.6 + Math.random() * 0.4})`;
        ctx.fillText(char, i * fontSize, y);

        // Reset drop to top when it falls off screen (with random reset chance)
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

// ─── Terminal Theme Component ───────────────────────────────────────────────
export default function TerminalTheme() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'ascii', content: ASCII_BANNER },
    { type: 'success', content: 'Welcome to Akarshan\'s Portfolio Terminal v1.0' },
    { type: 'output', content: 'Type "help" to see available commands. Tab to autocomplete.' },
    { type: 'output', content: '' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandCount, setCommandCount] = useState(0);
  const [matrixMode, setMatrixMode] = useState(false);
  const [activeGame, setActiveGame] = useState<'snake' | 'dino' | 'typer' | 'memory' | 'wordle' | 'flappy' | 'pong' | 'invaders' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const setTheme = useStore((s) => s.setTheme);
  const visitSection = useStore((s) => s.visitSection);
  const isMobile = useIsMobile();

  const commands = ['help', 'whoami', 'about', 'skills', 'experience', 'projects', 'education',
    'certifications', 'contact', 'neofetch', 'clear', 'theme', 'ls', 'cat', 'pwd',
    'date', 'echo', 'games', 'snake', 'dino', 'typer', 'memory', 'wordle', 'flappy', 'pong', 'invaders',
    'sudo', 'exit', 'matrix', 'fortune', 'cowsay'];

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    // When a game is active, scroll to the game container; otherwise scroll to bottom
    if (activeGame && gameRef.current) {
      gameRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      scrollToBottom();
    }
  }, [lines, activeGame, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addLines = useCallback((newLines: TerminalLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const parts = trimmed.split(' ');
    const command = parts[0];
    const args = parts.slice(1).join(' ');

    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandCount((c) => {
      const newCount = c + 1;
      if (newCount >= 10) {
        useStore.getState().unlockAchievement('terminal_ninja');
      }
      return newCount;
    });

    const inputLine: TerminalLine = { type: 'input', content: `akarshan@portfolio:~$ ${cmd}` };

    switch (command) {
      case 'help':
        visitSection('about');
        addLines([
          inputLine,
          { type: 'success', content: '━━━ Available Commands ━━━' },
          { type: 'output', content: '  whoami          → Who am I?' },
          { type: 'output', content: '  about           → About me' },
          { type: 'output', content: '  skills          → Technical skills' },
          { type: 'output', content: '  experience      → Work experience' },
          { type: 'output', content: '  projects        → My projects' },
          { type: 'output', content: '  education       → Education background' },
          { type: 'output', content: '  certifications  → Certifications' },
          { type: 'output', content: '  contact         → Contact information' },
          { type: 'output', content: '  neofetch        → System info (the cool way)' },
          { type: 'output', content: '  fortune         → Random dev wisdom' },
          { type: 'output', content: '  cowsay <msg>    → Moo!' },
          { type: 'output', content: '  matrix          → Toggle Matrix rain ☂️' },
          { type: 'output', content: '  theme           → Switch to another theme' },
          { type: 'output', content: '  games           → List mini games' },
          { type: 'output', content: '  snake           → 🐍 Play Snake' },
          { type: 'output', content: '  dino            → 🦖 Play Dino Jump' },
          { type: 'output', content: '  flappy          → 🐦 Play Flappy Bird' },
          { type: 'output', content: '  pong            → 🏓 Play Pong' },
          { type: 'output', content: '  invaders        → 👾 Play Space Invaders' },
          { type: 'output', content: '  wordle          → 📝 Play Wordle (Normal/Tech)' },
          { type: 'output', content: '  typer           → ⌨️ Play Code Typer' },
          { type: 'output', content: '  memory          → 🧠 Play Memory Match' },
          { type: 'output', content: '  clear           → Clear terminal' },
          { type: 'output', content: '  exit            → Back to theme selector' },
          { type: 'output', content: '' },
          { type: 'output', content: '  Try: sudo hire akarshan 😉' },
          { type: 'output', content: '' },
        ]);
        break;

      case 'whoami':
        visitSection('about');
        addLines([
          inputLine,
          { type: 'output', content: `${portfolioData.name}` },
          { type: 'output', content: `${portfolioData.title}` },
          { type: 'output', content: '' },
          { type: 'output', content: portfolioData.summary },
          { type: 'output', content: '' },
        ]);
        break;

      case 'about':
        visitSection('about');
        addLines([
          inputLine,
          { type: 'success', content: `━━━ ${portfolioData.name} ━━━` },
          { type: 'output', content: `🎯 ${portfolioData.title}` },
          { type: 'output', content: '' },
          { type: 'output', content: portfolioData.summary },
          { type: 'output', content: '' },
          { type: 'output', content: `📧 ${portfolioData.email}` },
          { type: 'output', content: `📱 ${portfolioData.phone}` },
          { type: 'output', content: `🔗 ${portfolioData.linkedin}` },
          { type: 'output', content: `💻 ${portfolioData.leetcode}` },
          { type: 'output', content: '' },
        ]);
        break;

      case 'skills':
        visitSection('skills');
        const skillLines: TerminalLine[] = [
          inputLine,
          { type: 'success', content: '━━━ Technical Skills ━━━' },
          { type: 'output', content: '' },
        ];
        portfolioData.skills.forEach((cat) => {
          skillLines.push({ type: 'output', content: `📂 ${cat.category}:` });
          skillLines.push({ type: 'output', content: `   ${cat.skills.join(' • ')}` });
          skillLines.push({ type: 'output', content: '' });
        });
        addLines(skillLines);
        break;

      case 'experience':
        visitSection('experience');
        const expLines: TerminalLine[] = [inputLine, { type: 'success', content: '━━━ Work Experience ━━━' }, { type: 'output', content: '' }];
        portfolioData.experience.forEach((exp) => {
          expLines.push({ type: 'output', content: `🏢 ${exp.company} | ${exp.duration}` });
          expLines.push({ type: 'output', content: `   ${exp.role}` });
          expLines.push({ type: 'output', content: `   Tech: ${exp.techStack}` });
          exp.bullets.forEach((b) => {
            expLines.push({ type: 'output', content: `   • ${b}` });
          });
          expLines.push({ type: 'output', content: '' });
        });
        addLines(expLines);
        break;

      case 'projects':
        visitSection('projects');
        const projLines: TerminalLine[] = [inputLine, { type: 'success', content: '━━━ Projects ━━━' }, { type: 'output', content: '' }];
        portfolioData.projects.forEach((proj) => {
          projLines.push({ type: 'output', content: `🚀 ${proj.name} (${proj.year})` });
          projLines.push({ type: 'output', content: `   Tech: ${proj.techStack}` });
          proj.bullets.forEach((b) => {
            projLines.push({ type: 'output', content: `   • ${b}` });
          });
          projLines.push({ type: 'output', content: '' });
        });
        addLines(projLines);
        break;

      case 'education':
        visitSection('education');
        addLines([
          inputLine,
          { type: 'success', content: '━━━ Education ━━━' },
          { type: 'output', content: '' },
          ...portfolioData.education.flatMap((edu) => [
            { type: 'output' as const, content: `🎓 ${edu.institution}` },
            { type: 'output' as const, content: `   ${edu.degree}` },
            { type: 'output' as const, content: `   ${edu.duration} | ${edu.gpa}` },
            { type: 'output' as const, content: '' },
          ]),
        ]);
        break;

      case 'certifications':
        visitSection('certifications');
        const certLines: TerminalLine[] = [inputLine, { type: 'success', content: '━━━ Certifications ━━━' }, { type: 'output', content: '' }];
        portfolioData.certifications.forEach((cert) => {
          certLines.push({ type: 'output', content: `📜 ${cert.name} — ${cert.issuer}` });
        });
        certLines.push({ type: 'output', content: '' });
        addLines(certLines);
        break;

      case 'contact':
        visitSection('contact');
        addLines([
          inputLine,
          { type: 'success', content: '━━━ Contact ━━━' },
          { type: 'output', content: '' },
          { type: 'output', content: `📧 Email:    ${portfolioData.email}` },
          { type: 'output', content: `📱 Phone:    ${portfolioData.phone}` },
          { type: 'output', content: `🔗 LinkedIn: ${portfolioData.linkedin}` },
          { type: 'output', content: `💻 LeetCode: ${portfolioData.leetcode}` },
          { type: 'output', content: '' },
        ]);
        break;

      case 'neofetch':
        addLines([
          inputLine,
          { type: 'ascii', content: NEOFETCH },
          { type: 'output', content: '' },
        ]);
        useStore.getState().findEasterEgg('neofetch');
        break;

      case 'clear':
        setLines([]);
        return;

      case 'ls':
        addLines([
          inputLine,
          { type: 'output', content: 'about.txt    skills.json    experience/    projects/    education.md    certifications.txt    contact.vcf    games/' },
          { type: 'output', content: '' },
        ]);
        break;

      case 'pwd':
        addLines([
          inputLine,
          { type: 'output', content: '/home/akarshan/portfolio' },
          { type: 'output', content: '' },
        ]);
        break;

      case 'date':
        addLines([
          inputLine,
          { type: 'output', content: new Date().toString() },
          { type: 'output', content: '' },
        ]);
        break;

      case 'echo':
        addLines([
          inputLine,
          { type: 'output', content: args || '' },
          { type: 'output', content: '' },
        ]);
        break;

      case 'cat':
        if (args.includes('about')) {
          processCommand('about');
        } else if (args.includes('skill')) {
          processCommand('skills');
        } else if (args.includes('contact')) {
          processCommand('contact');
        } else {
          addLines([
            inputLine,
            { type: 'error', content: `cat: ${args || '???'}: Try 'cat about.txt', 'cat skills.json', or 'cat contact.vcf'` },
            { type: 'output', content: '' },
          ]);
        }
        break;

      case 'fortune':
        const fortunes = [
          '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
          '"First, solve the problem. Then, write the code." — John Johnson',
          '"Talk is cheap. Show me the code." — Linus Torvalds',
          '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
          '"Fix the cause, not the symptom." — Steve Maguire',
          '"Simplicity is the soul of efficiency." — Austin Freeman',
          '"Make it work, make it right, make it fast." — Kent Beck',
          '"It works on my machine. ¯\\_(ツ)_/¯"',
        ];
        addLines([
          inputLine,
          { type: 'success', content: `🔮 ${fortunes[Math.floor(Math.random() * fortunes.length)]}` },
          { type: 'output', content: '' },
        ]);
        useStore.getState().findEasterEgg('fortune');
        break;

      case 'cowsay': {
        const msg = args || 'Moo! Hire Akarshan!';
        const border = '─'.repeat(msg.length + 2);
        addLines([
          inputLine,
          { type: 'ascii', content: ` ┌${border}┐` },
          { type: 'ascii', content: ` │ ${msg} │` },
          { type: 'ascii', content: ` └${border}┘` },
          { type: 'ascii', content: '        \\   ^__^' },
          { type: 'ascii', content: '         \\  (oo)\\_______' },
          { type: 'ascii', content: '            (__)\\       )\\/\\' },
          { type: 'ascii', content: '                ||----w |' },
          { type: 'ascii', content: '                ||     ||' },
          { type: 'output', content: '' },
        ]);
        useStore.getState().findEasterEgg('cowsay');
        break;
      }

      case 'matrix':
        setMatrixMode((prev) => {
          const next = !prev;
          if (next) {
            addLines([
              inputLine,
              { type: 'success', content: '🟢 Entering the Matrix...' },
              { type: 'output', content: 'Wake up, Neo... The portfolio has you.' },
              { type: 'output', content: 'Follow the white rabbit. 🐇' },
              { type: 'output', content: '' },
              { type: 'output', content: 'Type "matrix" again to exit the Matrix.' },
              { type: 'output', content: '' },
            ]);
          } else {
            addLines([
              inputLine,
              { type: 'success', content: '🔴 Exiting the Matrix...' },
              { type: 'output', content: 'You took the blue pill. Welcome back to reality.' },
              { type: 'output', content: '' },
            ]);
          }
          return next;
        });
        useStore.getState().findEasterEgg('matrix');
        break;

      case 'sudo':
        if (args.includes('hire') && args.includes('akarshan')) {
          addLines([
            inputLine,
            { type: 'success', content: '✅ [sudo] Excellent choice! Akarshan has been added to your team.' },
            { type: 'success', content: '📧 Sending resume to your inbox...' },
            { type: 'success', content: `📬 Contact: ${portfolioData.email}` },
            { type: 'output', content: '' },
            { type: 'success', content: '🎉 Achievement Unlocked: "Smart Recruiter"' },
            { type: 'output', content: '' },
          ]);
          useStore.getState().findEasterEgg('sudo_hire');
        } else {
          addLines([
            inputLine,
            { type: 'error', content: '[sudo] permission denied. Try: sudo hire akarshan' },
            { type: 'output', content: '' },
          ]);
        }
        break;

      case 'theme':
        addLines([
          inputLine,
          { type: 'output', content: 'Available themes: netflix, instagram, terminal, gpt, arcade' },
          { type: 'output', content: 'Usage: theme <name> or type "exit" to go back to selector' },
          { type: 'output', content: '' },
        ]);
        if (args && ['netflix', 'instagram', 'gpt', 'arcade'].includes(args)) {
          setTheme(args as any);
        }
        break;

      case 'games':
        addLines([
          inputLine,
          { type: 'success', content: '━━━ Mini Games ━━━' },
          { type: 'output', content: '🐍 snake      — Classic Snake (catch the tech logos!)' },
          { type: 'output', content: '🦖 dino       — Chrome Dino Jump (dodge obstacles!)' },
          { type: 'output', content: '🐦 flappy     — Flappy Bird (flap through pipes!)' },
          { type: 'output', content: '🏓 pong       — Pong vs AI (first to 5!)' },
          { type: 'output', content: '👾 invaders   — Space Invaders (defend Earth!)' },
          { type: 'output', content: '📝 wordle     — Wordle (Normal or Tech words!)' },
          { type: 'output', content: '⌨️  typer      — Code Typing Speed Test' },
          { type: 'output', content: '🧠 memory     — Tech Memory Match' },
          { type: 'output', content: '' },
          ...(isMobile ? [
            { type: 'output' as const, content: '📱 Games are best experienced in Arcade mode on mobile!' },
            { type: 'output' as const, content: '   Type "theme arcade" to switch, or visit Arcade from the landing page.' },
            { type: 'output' as const, content: '' },
          ] : [
            { type: 'output' as const, content: 'Type the game name to play! (e.g. "snake")' },
            { type: 'output' as const, content: '' },
          ]),
        ]);
        break;

      // All game launches use setTimeout so the Enter key from submitting
      // the terminal command doesn't propagate and auto-start the game.
      // On mobile, redirect to Arcade theme instead of launching inline.
      case 'snake':
      case 'dino':
      case 'typer':
      case 'memory':
      case 'wordle':
      case 'flappy':
      case 'pong':
      case 'invaders':
        if (isMobile) {
          addLines([
            inputLine,
            { type: 'output', content: `📱 "${cmd}" is best played in Arcade mode on mobile!` },
            { type: 'output', content: '   Type "theme arcade" to switch to the Arcade for touch-friendly controls.' },
            { type: 'output', content: '' },
          ]);
        } else {
          const gameLabels: Record<string, string> = {
            snake: '🐍 Launching Snake... Press ENTER to start.',
            dino: '🦖 Launching Dino Jump... Press ENTER to start.',
            typer: '⌨️ Launching Code Typer... Press ENTER to start.',
            memory: '🧠 Launching Memory Match... Press ENTER to start.',
            wordle: '📝 Launching Wordle... Choose Normal (1) or Tech (2).',
            flappy: '🐦 Launching Flappy Bird... Press ENTER to start.',
            pong: '🏓 Launching Pong... Press ENTER to start.',
            invaders: '👾 Launching Space Invaders... Press ENTER to start.',
          };
          addLines([inputLine, { type: 'success', content: gameLabels[cmd] || 'Launching...' }, { type: 'output', content: '' }]);
          setTimeout(() => setActiveGame(cmd as any), 150);
        }
        break;

      case 'exit':
        setTheme('landing');
        break;

      case '':
        addLines([inputLine]);
        break;

      default:
        addLines([
          inputLine,
          { type: 'error', content: `bash: ${command}: command not found. Type 'help' for available commands.` },
          { type: 'output', content: '' },
        ]);
    }
  }, [addLines, setTheme, visitSection]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = commands.filter((c) => c.startsWith(currentInput.toLowerCase()));
      if (matches.length === 1) {
        setCurrentInput(matches[0]);
      } else if (matches.length > 1) {
        addLines([
          { type: 'input', content: `akarshan@portfolio:~$ ${currentInput}` },
          { type: 'output', content: matches.join('  ') },
        ]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return matrixMode ? 'text-green-300' : 'text-green-400';
      case 'output': return matrixMode ? 'text-green-400/80' : 'text-gray-300';
      case 'error': return 'text-red-400';
      case 'success': return matrixMode ? 'text-green-300' : 'text-yellow-400';
      case 'ascii': return matrixMode ? 'text-green-400' : 'text-cyan-400';
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#0c0c0c] p-2 md:p-4 font-mono relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Matrix Rain Background */}
      {matrixMode && <MatrixRain />}

      {/* Terminal window */}
      <div className={`max-w-5xl mx-auto rounded-lg overflow-hidden border shadow-2xl relative z-10 ${
        matrixMode ? 'border-green-500/50 shadow-green-900/50' : 'border-gray-700'
      }`}>
        {/* Title bar */}
        <div className={`px-4 py-2 flex items-center gap-2 ${
          matrixMode ? 'bg-[#0a1a0a]' : 'bg-[#2d2d2d]'
        }`}>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('landing')}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer"
              title="Exit"
            />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className={`w-3 h-3 rounded-full ${matrixMode ? 'bg-green-400 animate-pulse' : 'bg-green-500'}`} />
          </div>
          <span className={`text-sm ml-4 flex-1 text-center ${
            matrixMode ? 'text-green-500' : 'text-gray-400'
          }`}>
            {matrixMode ? '⬡ akarshan@the-matrix: ~ ⬡' : 'akarshan@portfolio: ~'}
          </span>
          <span className={`text-xs ${matrixMode ? 'text-green-700' : 'text-gray-600'}`}>
            {matrixMode ? 'matrix' : 'bash'}
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={terminalRef}
          className={`p-4 h-[calc(100vh-6rem)] overflow-y-auto text-sm leading-relaxed ${
            matrixMode ? 'bg-[#000a00]/90 backdrop-blur-sm' : 'bg-[#0c0c0c]'
          }`}
        >
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              className={`${getLineColor(line.type)} whitespace-pre-wrap break-all ${
                matrixMode && line.type !== 'error' ? 'drop-shadow-[0_0_3px_rgba(0,255,0,0.3)]' : ''
              }`}
            >
              {line.content}
            </motion.div>
          ))}

          {/* Active Game — renders inline after terminal output */}
          {activeGame && (
            <div ref={gameRef} className="my-2 border border-green-800 rounded p-3 bg-black/80 w-full max-w-full">
              {activeGame === 'snake' && <SnakeGame variant="terminal" onExit={() => setActiveGame(null)} />}
              {activeGame === 'dino' && <DinoGame variant="terminal" onExit={() => setActiveGame(null)} />}
              {activeGame === 'typer' && <CodeTyper variant="terminal" onExit={() => setActiveGame(null)} />}
              {activeGame === 'memory' && <MemoryMatch variant="terminal" onExit={() => setActiveGame(null)} />}
              {activeGame === 'wordle' && <TechWordle variant="terminal" onExit={() => setActiveGame(null)} />}
              {activeGame === 'flappy' && <FlappyBird variant="terminal" onExit={() => setActiveGame(null)} />}
              {activeGame === 'pong' && <PongGame variant="terminal" onExit={() => setActiveGame(null)} />}
              {activeGame === 'invaders' && <SpaceInvaders variant="terminal" onExit={() => setActiveGame(null)} />}
            </div>
          )}

          {/* Input line */}
          {!activeGame && (
          <div className={`flex items-center mt-1 ${matrixMode ? 'text-green-400' : 'text-green-400'}`}>
            <span className={`mr-2 shrink-0 ${
              matrixMode ? 'text-green-400 drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]' : 'text-green-500'
            }`}>
              {matrixMode ? 'neo@matrix:~$' : 'akarshan@portfolio:~$'}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent outline-none font-mono ${
                matrixMode
                  ? 'text-green-300 caret-green-300 drop-shadow-[0_0_3px_rgba(0,255,0,0.4)]'
                  : 'text-green-300 caret-green-400'
              }`}
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />
          </div>
          )}
        </div>
      </div>

      {/* Command count badge */}
      {commandCount > 0 && (
        <motion.div
          className={`fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-mono border z-20 ${
            matrixMode
              ? 'bg-green-900/80 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(0,255,0,0.2)]'
              : 'bg-green-900/80 text-green-400 border-green-700'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          Commands: {commandCount} {commandCount >= 10 ? '🥷' : ''}
        </motion.div>
      )}

      {/* Matrix mode indicator */}
      {matrixMode && (
        <motion.div
          className="fixed top-4 right-4 px-3 py-1 rounded-full text-xs font-mono bg-green-900/80 text-green-400 border border-green-500/50 z-20 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          🟢 MATRIX MODE
        </motion.div>
      )}
    </motion.div>
  );
}
