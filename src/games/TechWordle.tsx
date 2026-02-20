import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface TechWordleProps {
  variant: 'gameboy' | 'terminal';
  onExit: () => void;
}

// 5-letter tech words
const TECH_WORDS = [
  'REACT', 'REDUX', 'NODES', 'FLASK', 'MONGO',
  'MYSQL', 'REDIS', 'NGINX', 'LINUX', 'FETCH',
  'ASYNC', 'AWAIT', 'CLASS', 'ARRAY', 'STACK',
  'QUEUE', 'GRAPH', 'REGEX', 'PROXY', 'QUERY',
  'INDEX', 'TOKEN', 'HOOKS', 'STATE', 'PROPS',
  'ROUTE', 'STORE', 'BUILD', 'DEBUG', 'CLONE',
  'MERGE', 'PATCH', 'SHELL', 'SWIFT', 'SCALA',
  'KAFKA', 'SPARK', 'FLOAT', 'PRINT', 'INPUT',
  'WHILE', 'BREAK', 'CATCH', 'THROW', 'SUPER',
  'YIELD', 'CONST', 'FINAL', 'FIELD', 'PARAM',
];

// Common 5-letter English words
const NORMAL_WORDS = [
  'ABOUT', 'ABOVE', 'AFTER', 'AGAIN', 'ALERT',
  'ALIVE', 'ALLOW', 'ALONE', 'ALONG', 'ANGEL',
  'ANGRY', 'APPLE', 'ARENA', 'ASIDE', 'BEGIN',
  'BELOW', 'BENCH', 'BLACK', 'BLANK', 'BLEND',
  'BLIND', 'BLOCK', 'BLOOM', 'BLOWN', 'BOARD',
  'BONES', 'BRAIN', 'BRAND', 'BRAVE', 'BREAD',
  'BREAK', 'BRIDE', 'BRIEF', 'BRING', 'BROAD',
  'BROWN', 'BUILD', 'BURST', 'BUYER', 'CANDY',
  'CARRY', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR',
  'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD',
  'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLIMB',
  'CLOSE', 'CLOTH', 'CLOUD', 'COACH', 'COAST',
  'COLOR', 'COUNT', 'COURT', 'COVER', 'CRAFT',
  'CRASH', 'CRAZY', 'CREAM', 'CRIME', 'CROSS',
  'CROWD', 'CROWN', 'CRUEL', 'CRUSH', 'CURVE',
  'CYCLE', 'DANCE', 'DEATH', 'DELTA', 'DEPTH',
  'DODGE', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT',
  'DRAIN', 'DREAM', 'DRESS', 'DRIFT', 'DRINK',
  'DRIVE', 'DROWN', 'EARLY', 'EARTH', 'EIGHT',
  'ELITE', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER',
  'EQUAL', 'ERROR', 'EVENT', 'EVERY', 'EXACT',
  'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FANCY',
  'FAULT', 'FAVOR', 'FEAST', 'FIBER', 'FIELD',
  'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FLAME',
  'FLASH', 'FLOAT', 'FLOOD', 'FLOOR', 'FLUID',
  'FOCUS', 'FORCE', 'FORGE', 'FORTH', 'FOUND',
  'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRONT',
  'FRUIT', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE',
  'GLORY', 'GOING', 'GRACE', 'GRADE', 'GRAIN',
  'GRAND', 'GRANT', 'GRASP', 'GRASS', 'GRAVE',
  'GREAT', 'GREEN', 'GRIND', 'GROSS', 'GROUP',
  'GROWN', 'GUARD', 'GUESS', 'GUEST', 'GUIDE',
  'GUILT', 'HAPPY', 'HARSH', 'HEART', 'HELLO',
  'HONOR', 'HORSE', 'HOTEL', 'HOUSE', 'HUMAN',
  'HUMOR', 'HURRY', 'IDEAL', 'IMAGE', 'IMPLY',
  'INNER', 'ISSUE', 'IVORY', 'JOINT', 'JUDGE',
  'JUICE', 'KNOCK', 'KNOWN', 'LABEL', 'LARGE',
  'LASER', 'LATER', 'LAUGH', 'LAYER', 'LEARN',
  'LEAST', 'LEAVE', 'LEGAL', 'LEMON', 'LEVEL',
  'LIGHT', 'LIMIT', 'LINEN', 'LIVER', 'LOGIC',
  'LOOSE', 'LOVER', 'LOWER', 'LUCKY', 'LUNCH',
  'MAGIC', 'MAJOR', 'MAKER', 'MANOR', 'MARCH',
  'MATCH', 'MAYBE', 'MAYOR', 'MEDIA', 'MERCY',
  'METAL', 'MIGHT', 'MINOR', 'MINUS', 'MODEL',
  'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT',
  'MOUSE', 'MOUTH', 'MOVED', 'MUSIC', 'NAVAL',
  'NERVE', 'NEVER', 'NIGHT', 'NOBLE', 'NOISE',
  'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCEAN',
  'OFFER', 'OFTEN', 'ORDER', 'OTHER', 'OUTER',
  'OWNED', 'OWNER', 'PAINT', 'PANEL', 'PANIC',
  'PAPER', 'PARTY', 'PATCH', 'PAUSE', 'PEACE',
  'PENNY', 'PHASE', 'PHONE', 'PHOTO', 'PIANO',
  'PIECE', 'PILOT', 'PITCH', 'PIXEL', 'PLACE',
  'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'PLAZA',
  'PLEAD', 'POINT', 'POUND', 'POWER', 'PRESS',
  'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR',
  'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'QUEEN',
  'QUEST', 'QUICK', 'QUIET', 'QUITE', 'QUOTA',
  'RADAR', 'RADIO', 'RAISE', 'RANGE', 'RAPID',
  'RATIO', 'REACH', 'READY', 'REALM', 'REIGN',
  'RELAX', 'REPLY', 'RIGHT', 'RIGID', 'RIVAL',
  'RIVER', 'ROBIN', 'ROBOT', 'ROCKY', 'ROMAN',
  'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL',
  'SALAD', 'SCALE', 'SCENE', 'SCOPE', 'SCORE',
  'SENSE', 'SERVE', 'SEVEN', 'SHALL', 'SHAPE',
  'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHIFT',
  'SHINE', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT',
  'SHOUT', 'SIGHT', 'SINCE', 'SIXTH', 'SIXTY',
  'SKILL', 'SLAVE', 'SLEEP', 'SLICE', 'SLIDE',
  'SLOPE', 'SMALL', 'SMART', 'SMELL', 'SMILE',
  'SMOKE', 'SNACK', 'SOLAR', 'SOLID', 'SOLVE',
  'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE',
  'SPEAK', 'SPEED', 'SPEND', 'SPINE', 'SPOKE',
  'SPORT', 'SPRAY', 'SQUAD', 'STAFF', 'STAGE',
  'STAKE', 'STAND', 'START', 'STATE', 'STEAL',
  'STEAM', 'STEEL', 'STEEP', 'STEER', 'STERN',
  'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD',
  'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK',
  'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE',
  'SUNNY', 'SUPER', 'SURGE', 'SWEET', 'SWEPT',
  'SWING', 'SWORD', 'SWORE', 'SWUNG', 'TABLE',
  'TAKEN', 'TASTE', 'TEACH', 'TEETH', 'THEME',
  'THERE', 'THICK', 'THING', 'THINK', 'THIRD',
  'THOSE', 'THREE', 'THREW', 'THROW', 'TIGHT',
  'TIMER', 'TIRED', 'TITLE', 'TODAY', 'TOKEN',
  'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TOXIC',
  'TRACE', 'TRACK', 'TRADE', 'TRAIL', 'TRAIN',
  'TRAIT', 'TRASH', 'TREAT', 'TREND', 'TRIAL',
  'TRIBE', 'TRICK', 'TRIED', 'TROOP', 'TRUCK',
  'TRULY', 'TRUST', 'TRUTH', 'TUMOR', 'TWICE',
  'TWIST', 'TYING', 'UNDER', 'UNION', 'UNITE',
  'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN',
  'USAGE', 'USUAL', 'UTTER', 'VALID', 'VALUE',
  'VIDEO', 'VIGOR', 'VIRUS', 'VISIT', 'VITAL',
  'VOCAL', 'VOICE', 'VOTER', 'WAGON', 'WASTE',
  'WATCH', 'WATER', 'WEIGH', 'WHEAT', 'WHERE',
  'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE',
  'WIDTH', 'WOMAN', 'WORLD', 'WORRY', 'WORSE',
  'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRITE',
  'WRONG', 'WROTE', 'YIELD', 'YOUNG', 'YOUTH',
];

type WordMode = 'tech' | 'normal';
type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

interface Letter {
  char: string;
  status: LetterStatus;
}

export default function TechWordle({ variant, onExit }: TechWordleProps) {
  const [answer, setAnswer] = useState('');
  const [guesses, setGuesses] = useState<Letter[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [wordMode, setWordMode] = useState<WordMode | null>(null); // null = not chosen yet
  const setHighScore = useStore((s) => s.setHighScore);

  const isGameBoy = variant === 'gameboy';
  const MAX_GUESSES = 6;

  const startGame = useCallback((mode: WordMode) => {
    const list = mode === 'tech' ? TECH_WORDS : NORMAL_WORDS;
    const word = list[Math.floor(Math.random() * list.length)];
    setAnswer(word.toUpperCase());
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setMessage('');
    setWordMode(mode);
    setGameStarted(true);
  }, []);

  const evaluateGuess = useCallback((guess: string): Letter[] => {
    const result: Letter[] = [];
    const answerChars = answer.split('');
    const guessChars = guess.split('');

    const used = new Array(5).fill(false);
    const guessUsed = new Array(5).fill(false);

    for (let i = 0; i < 5; i++) {
      if (guessChars[i] === answerChars[i]) {
        result[i] = { char: guessChars[i], status: 'correct' };
        used[i] = true;
        guessUsed[i] = true;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (guessUsed[i]) continue;
      const idx = answerChars.findIndex((c, j) => c === guessChars[i] && !used[j]);
      if (idx >= 0) {
        result[i] = { char: guessChars[i], status: 'present' };
        used[idx] = true;
      } else {
        result[i] = { char: guessChars[i], status: 'absent' };
      }
    }

    return result;
  }, [answer]);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5) {
      setShake(true);
      setMessage('Need 5 letters!');
      setTimeout(() => { setShake(false); setMessage(''); }, 1000);
      return;
    }

    const evaluated = evaluateGuess(currentGuess.toUpperCase());
    const newGuesses = [...guesses, evaluated];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess.toUpperCase() === answer) {
      setWon(true);
      setGameOver(true);
      setMessage('🎉 Correct!');
      const score = (MAX_GUESSES - newGuesses.length + 1) * 20;
      setHighScore('wordle', score);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      setMessage(`The word was: ${answer}`);
    }
  }, [currentGuess, guesses, answer, evaluateGuess, setHighScore]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return; }

      // Mode selection screen
      if (!gameStarted && wordMode === null) {
        if (e.key === '1') { startGame('normal'); return; }
        if (e.key === '2') { startGame('tech'); return; }
        return;
      }

      // Game over — restart with same mode
      if (gameOver) {
        if (e.key === 'Enter' && wordMode) { startGame(wordMode); }
        return;
      }

      if (!gameStarted) return;

      if (e.key === 'Enter') {
        submitGuess();
      } else if (e.key === 'Backspace') {
        setCurrentGuess((g) => g.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
        setCurrentGuess((g) => g + e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, gameOver, currentGuess, wordMode, onExit, startGame, submitGuess]);

  const getKeyStatus = (letter: string): LetterStatus => {
    let best: LetterStatus = 'empty';
    for (const guess of guesses) {
      for (const l of guess) {
        if (l.char === letter) {
          if (l.status === 'correct') return 'correct';
          if (l.status === 'present') best = 'present';
          if (l.status === 'absent' && best === 'empty') best = 'absent';
        }
      }
    }
    return best;
  };

  const getStatusColor = (status: LetterStatus) => {
    if (isGameBoy) {
      switch (status) {
        case 'correct': return 'bg-[#0f380f] text-[#9bbc0f] border-[#0f380f]';           // ■ dark green = correct position
        case 'present': return 'bg-[#8b8000] text-[#fffde7] border-[#8b8000]';            // ■ gold/yellow = in word, wrong spot
        case 'absent': return 'bg-[#9bbc0f]/30 text-[#306230]/40 border-[#306230]/20';    // ■ faded = not in word
        case 'empty': return 'border-[#306230] text-[#306230]';
      }
    }
    switch (status) {
      case 'correct': return 'bg-green-600 text-white border-green-600';   // ■ green = correct position
      case 'present': return 'bg-yellow-500 text-white border-yellow-500'; // ■ yellow = in word, wrong spot
      case 'absent': return 'bg-gray-800 text-gray-500 border-gray-700';   // ■ gray = not in word
      case 'empty': return 'border-green-800 text-green-400';
    }
  };

  const KEYBOARD = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ];

  const handleKeyboardClick = (key: string) => {
    if (gameOver) return;
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === '⌫') {
      setCurrentGuess((g) => g.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess((g) => g + key);
    }
  };

  return (
    <div
      className={isGameBoy ? 'p-3 flex flex-col h-full' : 'flex flex-col'}
      style={!isGameBoy ? { height: 'calc(100vh - 14rem)' } : undefined}
    >
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className={isGameBoy ? 'text-xs opacity-70' : 'text-green-400 text-xs'}>
          — WORDLE{wordMode === 'tech' ? ' (TECH)' : wordMode === 'normal' ? ' (NORMAL)' : ''} —
        </p>
        <button onClick={onExit} className={isGameBoy ? 'text-xs cursor-pointer underline' : 'text-green-600 text-xs cursor-pointer underline'}>BACK</button>
      </div>

      {/* Mode Selection Screen */}
      {!gameStarted && wordMode === null && (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <p className={`font-bold ${isGameBoy ? 'text-xl' : 'text-lg text-green-400'}`}>📝 WORDLE</p>
          <p className={isGameBoy ? 'text-sm mt-3' : 'text-xs text-green-600 mt-2'}>Guess the 5-letter word in 6 tries!</p>
          <p className={isGameBoy ? 'text-sm mt-2' : 'text-xs text-green-700 mt-1'}>🟩 = correct position • 🟨 = in word, wrong spot • ⬛ = not in word</p>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={() => startGame('normal')}
              className={`px-6 py-3 rounded cursor-pointer transition-all ${
                isGameBoy
                  ? 'border-2 border-[#306230] hover:bg-[#306230]/30 text-base font-bold'
                  : 'border border-green-700 hover:bg-green-900 text-green-400 text-sm'
              }`}
            >
              1️⃣ Normal Words (easier)
            </button>
            <button
              onClick={() => startGame('tech')}
              className={`px-6 py-3 rounded cursor-pointer transition-all ${
                isGameBoy
                  ? 'border-2 border-[#306230] hover:bg-[#306230]/30 text-base font-bold'
                  : 'border border-green-700 hover:bg-green-900 text-green-400 text-sm'
              }`}
            >
              2️⃣ Tech Words (harder)
            </button>
          </div>

          <p className={`mt-4 opacity-50 ${isGameBoy ? 'text-xs' : 'text-[10px] text-green-700'}`}>
            Press 1 or 2 on keyboard, or click
          </p>
        </div>
      )}

      {gameStarted && (
        <div className="flex-1 flex flex-col min-h-0">
          {message && (
            <div className={`text-center text-sm mb-1 shrink-0 ${won ? (isGameBoy ? 'text-[#0f380f] font-bold' : 'text-yellow-400 font-bold') : (isGameBoy ? '' : 'text-red-400')}`}>
              {message}
            </div>
          )}

          {/* Grid — rows share available height dynamically */}
          <div className={`flex flex-col items-center gap-1 mb-1 flex-1 min-h-0 justify-center ${shake ? 'animate-shake' : ''}`}>
            {Array.from({ length: MAX_GUESSES }, (_, row) => {
              const guess = guesses[row];
              const isCurrent = row === guesses.length && !gameOver;

              return (
                <div key={row} className="flex gap-1.5 flex-1 min-h-0">
                  {Array.from({ length: 5 }, (_, col) => {
                    let letter: Letter;
                    if (guess) {
                      letter = guess[col];
                    } else if (isCurrent) {
                      letter = { char: currentGuess[col] || '', status: 'empty' };
                    } else {
                      letter = { char: '', status: 'empty' };
                    }

                    return (
                      <div
                        key={col}
                        className={`aspect-square h-full max-h-12 border-2 flex items-center justify-center font-bold rounded transition-all duration-300 ${
                          isGameBoy ? 'text-sm' : 'text-xs'
                        } ${
                          getStatusColor(letter.status)
                        } ${isCurrent && col === currentGuess.length ? 'border-opacity-100' : ''}`}
                      >
                        {letter.char}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* On-screen keyboard — fixed at bottom */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            {KEYBOARD.map((row, ri) => (
              <div key={ri} className="flex gap-1">
                {row.map((key) => {
                  const status = key.length === 1 ? getKeyStatus(key) : 'empty';
                  const isWide = key === 'ENTER' || key === '⌫';

                  return (
                    <button
                      key={key}
                      onClick={() => handleKeyboardClick(key)}
                      className={`${isWide ? (isGameBoy ? 'px-2 text-[10px]' : 'px-1.5 text-[9px]') : (isGameBoy ? 'w-7 text-xs' : 'w-6 text-[10px]')} ${isGameBoy ? 'h-7' : 'h-7'} rounded flex items-center justify-center font-bold cursor-pointer active:scale-95 transition-all select-none ${
                        getStatusColor(status)
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {gameOver && (
            <p className={`text-center mt-1 animate-pulse shrink-0 ${isGameBoy ? 'text-xs' : 'text-[10px] text-green-500'}`}>
              Press ENTER to play again • ESC to exit
            </p>
          )}
        </div>
      )}
    </div>
  );
}
