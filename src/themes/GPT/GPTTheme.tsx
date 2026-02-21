import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData, funFacts } from '../../data/portfolio';
import { useStore } from '../../store/useStore';
import TechTrivia from '../../games/TechTrivia';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedPrompts = [
  '👋 Tell me about yourself',
  '💼 What is your work experience?',
  '🚀 Show me your projects',
  '🛠️ What are your technical skills?',
  '🎓 What is your education?',
  '📜 What certifications do you have?',
  '📧 How can I contact you?',
  '🎲 Tell me a fun fact',
  '🧠 Play tech trivia quiz',
];

function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('about') || lower.includes('yourself') || lower.includes('who are you') || lower.includes('tell me about')) {
    useStore.getState().visitSection('about');
    return `# ${portfolioData.name}\n**${portfolioData.title}**\n\n${portfolioData.summary}\n\nI'm currently working at **Amdocs** as a Software Engineer, building full-stack applications with React, Python, and AWS. Previously, I was a Full Stack Developer at **Dresma**.\n\nI graduated from **Thapar Institute of Engineering and Technology** with a B.Tech in CSE (8.6 CGPA).\n\nWant to know more about my experience, skills, or projects? Just ask! 😊`;
  }

  if (lower.includes('experience') || lower.includes('work') || lower.includes('job') || lower.includes('career')) {
    useStore.getState().visitSection('experience');
    let response = `# 💼 Work Experience\n\n`;
    portfolioData.experience.forEach((exp) => {
      response += `## ${exp.company} — ${exp.role}\n`;
      response += `📅 ${exp.duration}${exp.location ? ` | 📍 ${exp.location}` : ''}\n`;
      response += `**Tech:** ${exp.techStack}\n\n`;
      exp.bullets.forEach((b) => {
        response += `• ${b}\n`;
      });
      response += '\n---\n\n';
    });
    return response;
  }

  if (lower.includes('project')) {
    useStore.getState().visitSection('projects');
    let response = `# 🚀 Projects\n\n`;
    portfolioData.projects.forEach((proj) => {
      response += `## ${proj.name} (${proj.year})\n`;
      response += `**Tech:** ${proj.techStack}\n\n`;
      proj.bullets.forEach((b) => {
        response += `• ${b}\n`;
      });
      response += '\n';
    });
    return response;
  }

  // Quiz/trivia check MUST come before skills (because 'tech trivia' contains 'tech')
  if (lower.includes('quiz') || lower.includes('trivia') || lower.includes('game') || lower.includes('play')) {
    return `__TRIGGER_QUIZ__`;
  }

  if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack') || lower.includes('language')) {
    useStore.getState().visitSection('skills');
    let response = `# 🛠️ Technical Skills\n\n`;
    portfolioData.skills.forEach((cat) => {
      response += `**${cat.category}:** ${cat.skills.join(', ')}\n\n`;
    });
    return response;
  }

  if (lower.includes('education') || lower.includes('college') || lower.includes('university') || lower.includes('degree')) {
    useStore.getState().visitSection('education');
    const edu = portfolioData.education[0];
    return `# 🎓 Education\n\n**${edu.institution}**\n${edu.degree}\n📅 ${edu.duration} | 📊 ${edu.gpa}\n📍 ${edu.location}`;
  }

  if (lower.includes('certif')) {
    useStore.getState().visitSection('certifications');
    let response = `# 📜 Certifications\n\n`;
    portfolioData.certifications.forEach((cert) => {
      response += `• **${cert.name}** — ${cert.issuer}\n`;
    });
    return response;
  }

  if (lower.includes('contact') || lower.includes('email') || lower.includes('phone') || lower.includes('reach') || lower.includes('hire')) {
    useStore.getState().visitSection('contact');
    return `# 📬 Contact Me\n\n📧 **Email:** ${portfolioData.email}\n📱 **Phone:** ${portfolioData.phone}\n🔗 **LinkedIn:** ${portfolioData.linkedin}\n💻 **LeetCode:** ${portfolioData.leetcode}\n\nFeel free to reach out! I'm always open to discussing new opportunities. 🚀`;
  }

  if (lower.includes('fun') || lower.includes('random') || lower.includes('joke') || lower.includes('fact')) {
    const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
    return `# 🎲 Fun Fact\n\n> ${fact}\n\nWant another one? Just ask! 😄`;
  }

  if (lower.includes('resume') || lower.includes('cv') || lower.includes('download')) {
    return `# 📄 Resume\n\nI'd love to share my full resume with you! Please reach out via email:\n\n📧 **${portfolioData.email}**\n\nOr connect with me on LinkedIn: **${portfolioData.linkedin}**`;
  }

  // Default response
  return `I can tell you about many things! Here are some topics:\n\n• **About me** — Who I am and what I do\n• **Experience** — My work history\n• **Projects** — Things I've built\n• **Skills** — My technical toolkit\n• **Education** — Academic background\n• **Certifications** — Professional certs\n• **Contact** — How to reach me\n• **Fun facts** — Random things about me\n\nJust ask about any of these! 😊`;
}

export default function GPTTheme() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `# 👋 Hey! I'm Akarshan-4o\n\nI'm an AI version of **${portfolioData.name}**, a ${portfolioData.title}.\n\nAsk me anything about my experience, skills, projects, or just say hi! You can also click the suggested prompts below.\n\n*Powered by vibes and caffeine ☕*`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTrivia, setShowTrivia] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    const userMessage: Message = { role: 'user', content: msgText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

    const response = generateResponse(msgText);
    setIsTyping(false);

    if (response === '__TRIGGER_QUIZ__') {
      setMessages((prev) => [...prev, { role: 'assistant', content: '# 🧠 Tech Trivia Time!\n\nLet me test your knowledge! Launching the quiz now...' }]);
      setTimeout(() => setShowTrivia(true), 500);
      return;
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-xl font-bold mb-2">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-semibold mb-1 mt-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={i} className="border-l-3 border-emerald-500 pl-3 py-1 my-2 italic text-gray-300">
            {line.slice(2)}
          </blockquote>
        );
      }
      if (line.startsWith('• ')) {
        return <li key={i} className="ml-4 mb-1 list-disc text-gray-300">{renderInline(line.slice(2))}</li>;
      }
      if (line === '---') {
        return <hr key={i} className="border-gray-700 my-3" />;
      }
      if (line === '') {
        return <br key={i} />;
      }
      return <p key={i} className="text-gray-300 mb-1">{renderInline(line)}</p>;
    });
  };

  const renderInline = (text: string) => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Italic: *text*
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-gray-400">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#212121] flex flex-col">
      {/* Header */}
      <div className="bg-[#212121] border-b border-gray-700/50 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            ← Back
          </button>
          <div className="h-5 w-px bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
              A
            </div>
            <div>
              <span className="text-white font-medium text-sm">Akarshan-4o</span>
              <span className="text-gray-500 text-xs ml-2">Portfolio Model</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`flex gap-3 mb-6 ${msg.role === 'user' ? 'justify-end' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm shrink-0 mt-1">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-[#2f2f2f] rounded-3xl px-5 py-3 text-white'
                      : 'text-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm">{renderMarkdown(msg.content)}</div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm shrink-0 mt-1">
                    👤
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              className="flex gap-3 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="flex items-center gap-1 py-3">
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}

          {/* Suggested prompts - show only at start */}
          {messages.length <= 1 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-sm text-gray-300 border border-gray-700 rounded-xl px-4 py-3 hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700/50 bg-[#212121] px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-[#2f2f2f] rounded-2xl border border-gray-600/50 focus-within:border-gray-500">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Akarshan-4o anything..."
              className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 pr-12 resize-none outline-none text-sm min-h-[44px] max-h-[120px] rounded-2xl"
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 bottom-2 w-8 h-8 bg-white disabled:bg-gray-600 text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              ↑
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            Akarshan-4o can make mistakes. Consider verifying important information. 😉
          </p>
        </div>
      </div>

      {/* Trivia overlay */}
      {showTrivia && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <TechTrivia variant="gpt" onExit={() => setShowTrivia(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

