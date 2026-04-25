// ================== IMPORTS ==================
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { fetchGitHubData } from "./githubData.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Increase payload limit for large repos ──
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => res.send("🚀 RepoXray Backend Running"));
app.get("/api/health", (req, res) => res.json({ ok: true, model: "openai/gpt-4o", timestamp: new Date().toISOString() }));

// ── GitHub proxy ──
app.get("/api/github/*", async (req, res) => {
  const path = req.params[0];
  // BUG FIX: forward query string (e.g. ?recursive=1) — req.params[0] only has
  // the path segment, stripping everything after '?'. Without this fix the
  // recursive tree API call returns only the root level and no subdirectory
  // files are ever analyzed.
  const qs = new URLSearchParams(req.query).toString();
  const url = `https://api.github.com/${path}${qs ? `?${qs}` : ""}`;
  try {
    const headers = { "Accept": "application/vnd.github.v3+json", "User-Agent": "RepoXray/1.0" };
    if (process.env.GITHUB_TOKEN) headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    // BUG FIX: mirror GitHub's actual status code so the frontend's 401/403/404
    // checks in ghFetch() work correctly. Previously always returned 200.
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "GitHub fetch failed", details: err.message });
  }
});

// ── GitHub Stats endpoint ──
app.get("/api/github-stats/:owner/:repo", async (req, res) => {
  const { owner, repo } = req.params;
  try {
    console.log(`📊 Fetching GitHub stats for ${owner}/${repo}`);
    const githubData = await fetchGitHubData(owner, repo);
    console.log(`✅ GitHub stats OK for ${owner}/${repo}`);
    res.json({ githubData });
  } catch (err) {
    console.error(`❌ GitHub stats failed for ${owner}/${repo}:`, err.message);
    res.status(500).json({ error: err.message, githubData: null });
  }
});

// ================== AI HELPERS ==================
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-4o";

function checkAPIKey(res) {
  if (!OPENROUTER_KEY) {
    console.error("❌ OPENROUTER_API_KEY is not set in backend/.env");
    res.status(500).json({
      error: "AI API key not configured. Add OPENROUTER_API_KEY to backend/.env"
    });
    return false;
  }
  return true;
}

async function callOpenRouter(messages, opts = {}) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "RepoXray",
    },
    body: JSON.stringify({
      model: MODEL,
      ...opts,
      messages,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const msg = errBody?.error?.message || errBody?.message || `OpenRouter ${response.status}`;
    throw new Error(msg);
  }

  return response;
}

function ensureAnalysis(d) {
  if (!d || typeof d !== "object") d = {};
  if (!d.summary) d.summary = "Analysis unavailable.";
  if (!Array.isArray(d.techStack)) d.techStack = ["Unknown"];
  if (!d.architecture) d.architecture = "Architecture not detected.";
  if (!Array.isArray(d.architectureKeywords)) d.architectureKeywords = [];
  if (!Array.isArray(d.entryPoints) || !d.entryPoints.length) {
    d.entryPoints = [{ file: "index.js", reason: "Main entry point", priority: 1 }];
  }
  if (!Array.isArray(d.criticalFiles) || !d.criticalFiles.length) {
    d.criticalFiles = [{ file: "main.js", explanation: "Core logic", keyPatterns: [] }];
  }
  if (!Array.isArray(d.gotchas) || !d.gotchas.length) {
    d.gotchas = [{ title: "Review async handling", description: "Check for missing error boundaries.", severity: "medium" }];
  }
  if (!Array.isArray(d.readingOrder) || !d.readingOrder.length) {
    d.readingOrder = [{ order: 1, file: "index.js", why: "Start here", timeEstimate: "5 min" }];
  }
  return d;
}

// ================== AI ANALYZE ==================
app.post("/api/analyze", async (req, res) => {
  if (!checkAPIKey(res)) return;

  const { repoName, files } = req.body;
  if (!repoName || !Array.isArray(files)) {
    return res.status(400).json({ error: "repoName and files required" });
  }

  const parts = repoName.trim().split("/");
  const owner = parts[0] || "";
  const repo = parts[1] || "";
  console.log(`🔍 Analyzing ${repoName} (${files.length} files)`);

  // Truncate file content to avoid token limits
  const fileBlock = files
    .map((f) => `FILE: ${f.path}\n${(f.content || "").slice(0, 3000)}`)
    .join("\n\n---\n\n");

  const userPrompt = `You are a world-class senior software architect with 15+ years of experience.

Analyze this GitHub repository and return a comprehensive expert analysis.

Repository: ${repoName}

Files:
${fileBlock}

STRICT RULES:
- Return ONLY valid JSON, nothing else
- No markdown fences, no explanations outside JSON
- NEVER leave arrays empty
- Be specific — mention actual file names from the code above
- Write summaries as if explaining to a smart junior developer

Return EXACT JSON:
{
  "summary": "2-3 sentence explanation of what this project does and why it exists",
  "techStack": ["list of actual technologies, frameworks, libraries detected"],
  "architecture": "Clear explanation of the architecture pattern and how major pieces connect",
  "architectureKeywords": ["e.g. REST API", "React SPA"],
  "entryPoints": [
    { "file": "actual/path", "reason": "why this is entry point", "priority": 1 }
  ],
  "criticalFiles": [
    { "file": "actual/path", "explanation": "what it does and why", "keyPatterns": ["patterns used"] }
  ],
  "gotchas": [
    { "title": "issue title", "description": "detailed explanation", "severity": "low|medium|high" }
  ],
  "readingOrder": [
    { "order": 1, "file": "actual/path", "why": "reason to read this first", "timeEstimate": "X min" }
  ]
}

MINIMUMS: entryPoints ≥ 3, criticalFiles ≥ 5, gotchas ≥ 4, readingOrder ≥ 6`;

  const aiPromise = callOpenRouter(
    [
      { role: "system", content: "You are an expert software architect. Return ONLY valid JSON. No markdown. No preamble." },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.3, max_tokens: 650 }
  );

  const githubPromise =
    owner && repo
      ? fetchGitHubData(owner, repo).catch((err) => {
          console.warn("⚠️ GitHub stats non-fatal:", err.message);
          return null;
        })
      : Promise.resolve(null);

  try {
    const [aiResponse, githubData] = await Promise.all([aiPromise, githubPromise]);
    console.log(`✅ GitHub stats: ${githubData ? "OK" : "null"}`);

    const data = await aiResponse.json();

    // Detect OpenRouter errors
    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }

    const raw = data.choices?.[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.warn("⚠️ JSON parse failed, using fallback. Raw:", clean.slice(0, 200));
      parsed = {};
    }

    res.json({ ...ensureAnalysis(parsed), githubData });
  } catch (err) {
    console.error("❌ /api/analyze error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ================== AI CHAT ==================
app.post("/api/chat", async (req, res) => {
  if (!checkAPIKey(res)) return;

  const { question, history = [], context } = req.body;
  if (!question || !context) {
    return res.status(400).json({ error: "question and context required" });
  }

  const fileContext = (context.files || [])
    .slice(0, 15)
    .map((f) => `📄 ${f.path} (${f.lines} lines, ${f.language})`)
    .join("\n");

  const criticalCtx = (context.analysis?.criticalFiles || [])
    .map((cf) => `• ${cf.file}: ${cf.explanation}`)
    .join("\n");

  const gotchasCtx = (context.analysis?.gotchas || [])
    .map((g) => `• [${(g.severity||'').toUpperCase()}] ${g.title}: ${g.description}`)
    .join("\n");

  const systemPrompt = `You are RepoXray AI — the world's most knowledgeable codebase guide.

You are like a brilliant senior engineer who has spent hours reading this repository.

═══════════════════════════════════════════════
REPOSITORY: ${context.repoName}
═══════════════════════════════════════════════

📋 SUMMARY:
${context.analysis?.summary || 'Not available'}

🛠️ TECH STACK:
${(context.analysis?.techStack || []).join(" · ")}

🏗️ ARCHITECTURE:
${context.analysis?.architecture || 'Not available'}

📂 KEY FILES:
${fileContext}

🔑 CRITICAL FILES:
${criticalCtx}

⚠️ GOTCHAS:
${gotchasCtx}

═══════════════════════════════════════════════
HOW TO RESPOND:
═══════════════════════════════════════════════
- Be warm, sharp, specific to THIS repo
- Start with a 1-sentence direct answer
- Use markdown: headers, bullets, code blocks
- Mention ACTUAL file names from this repo
- For simple questions: 150-250 words
- For architecture questions: 300-500 words
- NEVER give generic answers
- NEVER say "I don't have access to the full code"`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: question },
  ];

  try {
    const response = await callOpenRouter(messages, {
      stream: true,
      temperature: 0.6,
      max_tokens: 400,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch (err) {
    console.error("❌ /api/chat error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 RepoXray server at http://localhost:${PORT}`);
  if (!OPENROUTER_KEY) {
    console.warn("⚠️  WARNING: OPENROUTER_API_KEY is not set! AI features will fail.");
    console.warn("   Add it to backend/.env");
  } else {
    console.log(`✅ AI ready — model: ${MODEL}`);
  }
});
