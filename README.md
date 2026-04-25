# RepoXray — AI Codebase Intelligence

Understand any GitHub repository in minutes through automated analysis, dependency visualization, and contextual Q&A.

---

## Overview

RepoXray is an AI-powered developer tool that analyzes codebases and presents structured insights, including architecture, dependencies, and onboarding guidance. It also provides an interactive chat interface to explore repositories in depth.

---

## Features

* AI-driven architecture and code analysis (via GPT-4o)
* Interactive dependency graph visualization
* Context-aware chat for repository exploration
* Repository statistics (stars, commits, contributors, languages)
* Automated onboarding and reading guidance
* Theme support (dark/light)
* Responsive UI with modern design patterns

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd RepoXray
```

---

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
OPENROUTER_API_KEY=your_api_key_here
GITHUB_TOKEN=your_github_token_here
PORT=4000
```

* `OPENROUTER_API_KEY` (required): Obtain from https://openrouter.ai/keys
* `GITHUB_TOKEN` (optional): Helps avoid GitHub API rate limits

---

### 3. Start the backend server

```bash
cd backend
npm install
npm start
```

Server runs at: http://localhost:4000

---

### 4. Start the frontend

```bash
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

### 5. Use the application

Open http://localhost:5173 and enter any GitHub repository URL.

---

## Project Structure

```
RepoXray/
├── src/                    # Frontend (React + Vite + TypeScript)
│   ├── api/                # API integration layer
│   ├── components/         # UI components
│   ├── hooks/              # Custom React hooks
│   └── App.tsx             # Application root
│
└── backend/                # Backend (Node.js + Express)
    ├── server.js           # API routes
    └── githubData.js       # GitHub data integration
```

---

## Troubleshooting

| Issue                      | Resolution                                  |
| -------------------------- | ------------------------------------------- |
| Backend not reachable      | Ensure `npm start` is running in `/backend` |
| Missing API key            | Add `OPENROUTER_API_KEY` to `.env`          |
| Invalid API key            | Regenerate key from OpenRouter              |
| GitHub rate limit exceeded | Add `GITHUB_TOKEN`                          |
| UI not rendering properly  | Refresh the application                     |

---

## API Keys

| Variable           | Required | Description                       |
| ------------------ | -------- | --------------------------------- |
| OPENROUTER_API_KEY | Yes      | Used for AI-powered analysis      |
| GITHUB_TOKEN       | No       | Prevents GitHub API rate limiting |

---

## Architecture Summary

1. Fetch repository data using GitHub API
2. Process code using AI via OpenRouter
3. Generate structured analysis output
4. Render insights and enable interactive exploration

---

## Technology Stack

* React (Vite + TypeScript)
* Node.js with Express
* OpenRouter API (GPT-4o)
* GitHub REST API

---

## Future Enhancements

* In-repository code search
* Test coverage insights
* Multi-model AI support
* Repository comparison tools

---

## License

Add your preferred license here.

---

## Contribution

Contributions are welcome. Please open an issue or submit a pull request.
