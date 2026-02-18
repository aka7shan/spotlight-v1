# 🎭 Spotlight — Interactive Multi-Theme Portfolio

An interactive portfolio website that lets visitors choose how they want to experience it. Pick a theme that matches your vibe!

## 🎨 Available Themes

| Theme | Style |
|-------|-------|
| 🎬 **Netflix** | Browse skills & projects like a streaming catalog |
| 📸 **Instagram** | Scroll through a social-media-style feed |
| 💻 **Terminal** | Interact via a command-line interface |
| 🤖 **GPT** | Chat-style conversation with an AI persona |
| 🎮 **GameBoy** | Retro handheld console experience |
| 📰 **Reddit** | Reddit-style threads and discussions |

## 🕹️ Easter Eggs

There are hidden surprises scattered throughout — try to find them all! Here are some hints:
- Gamers know a certain famous cheat code...
- The Terminal has more commands than you'd expect
- Type the magic words and things might happen

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** — lightning-fast dev server & build
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — smooth animations & transitions
- **Zustand** — lightweight state management

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/aka7shan/spotlight-v1.git
cd spotlight-v1

# 2. Install dependencies
npm install

# 3. Start dev server
npx vite
```

The app will be running at **http://localhost:5173**

### Build for Production

```bash
npx vite build
```

The output will be in the `dist/` folder — ready to deploy.

## 📁 Project Structure

```
src/
├── components/Landing/   # Theme selection page
├── data/portfolio.ts     # Portfolio content & data
├── store/useStore.ts     # Global state (theme, XP, achievements)
├── themes/
│   ├── Netflix/
│   ├── Instagram/
│   ├── Terminal/
│   ├── GPT/
│   ├── GameBoy/
│   └── Story/
└── App.tsx               # Theme router
```

## 📄 License

MIT
