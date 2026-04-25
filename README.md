# RepoXray — AI Codebase Intelligence

> Understand any GitHub repository in 60 seconds.  
> AI-powered dependency graphs, architecture analysis, and live Q&A.

---

## 🚀 Quick Start

### 1. Clone / unzip the project

### 2. Set up environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
OPENROUTER_API_KEY=sk-or-v1-...    # Required — get at openrouter.ai
GITHUB_TOKEN=github_pat_...        # Optional — avoids rate limits
PORT=4000
```

Get your OpenRouter key at: https://openrouter.ai/keys

### 3. Install & start backend

```bash
cd backend
npm install
npm start
# → Server at http://localhost:4000
```

### 4. Install & start frontend

In a new terminal:
```bash
npm install
npm run dev
# → App at http://localhost:5173
```

### 5. Open the app

Navigate to **http://localhost:5173** and paste any GitHub repo URL.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot reach backend at localhost:4000" | Run `cd backend && npm start` |
| "AI API key not configured" | Add `OPENROUTER_API_KEY` to `backend/.env` |
| "Invalid API key" | Check your key at openrouter.ai/keys |
| GitHub rate limit errors | Add `GITHUB_TOKEN` to `backend/.env` |
| Particle animation not showing | Reload — canvas needs a frame to initialize |

---

## ✨ Features

- **🧠 AI Analysis** — GPT-4o powered architecture analysis via OpenRouter
- **🕸️ Dependency Graph** — Interactive visual file dependency graph
- **💬 Live Q&A** — Streaming chat about any codebase
- **✅ Onboarding Checklist** — AI-generated ramp-up guide
- **📊 Repo Stats** — Stars, commits, contributors, language breakdown
- **⬡ Particle Modes** — Neural / Galaxy / Flow background animations
- **🌙 Dark / Light themes** — Full theme support

---

## 🔧 Architecture

```
RepoXray/
├── src/                    # React frontend (Vite + TypeScript)
│   ├── App.tsx             # Root — canvas, neural SVGs, routing
│   ├── particle-bg.js      # React hook for canvas particle system
│   ├── api/
│   │   ├── github.ts       # GitHub REST API client
│   │   └── openai.ts       # OpenRouter API client (analyze + chat)
│   ├── components/
│   │   ├── Hero.tsx        # Landing page
│   │   ├── Dashboard.tsx   # Main analysis dashboard (tabs)
│   │   ├── ChatPanel.tsx   # Streaming chat UI
│   │   ├── TopBar.tsx      # Nav + particle mode switcher
│   │   └── ...
│   └── hooks/
│       ├── useRepoAnalysis.ts  # State machine for fetch + analyze
│       └── useChat.ts          # Streaming chat state
└── backend/                # Express API server
    ├── server.js           # Routes: /api/analyze, /api/chat, /api/github-stats
    └── githubData.js       # GitHub stats fetcher
```

---

## 🔑 API Keys

| Key | Required | Where to get |
|-----|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `GITHUB_TOKEN` | Optional | [github.com/settings/tokens](https://github.com/settings/tokens) |

The app uses **`openai/gpt-4o`** via OpenRouter for all AI features.
