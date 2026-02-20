import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import Landing from './components/Landing/Landing';

import NetflixTheme from './themes/Netflix/NetflixTheme';
import TerminalTheme from './themes/Terminal/TerminalTheme';
import GPTTheme from './themes/GPT/GPTTheme';
import InstagramTheme from './themes/Instagram/InstagramTheme';
// import GameBoyTheme from './themes/GameBoy/GameBoyTheme';
// import StoryTheme from './themes/Story/StoryTheme';

function App() {
  const currentTheme = useStore((s) => s.currentTheme);

  const renderTheme = () => {
    switch (currentTheme) {
      case 'netflix':
        return <NetflixTheme />;
      case 'terminal':
        return <TerminalTheme />;
      case 'gpt':
        return <GPTTheme />;
      case 'instagram':
        return <InstagramTheme />;
      // case 'gameboy':
      //   return <GameBoyTheme />;
      // case 'story':
      //   return <StoryTheme />;
      case 'landing':
      default:
        return <Landing />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTheme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {renderTheme()}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
