// ================== IMPORTS ==================
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { fetchGitHubData } from "./githubData.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("🚀 RepoXray Backend Running"));
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/github/*", async (req, res) => {
  const path = req.params[0];
  const url = `https://api.github.com/${path}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "GitHub fetch failed" });
  }
});

// ================== DEDICATED GITHUB STATS ENDPOINT ==================
// Frontend can call this independently: GET /api/github-stats/owner/repo
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

// ================== AI ANALYZE ==================
app.post('/api/analyze', async (req, res) => {
  const { repoName, files } = req.body;

  if (!repoName || !Array.isArray(files)) {
    return res.status(400).json({ error: 'repoName and files required' });
  }

  // Parse owner/repo
  const parts = repoName.trim().split('/');
  const owner = parts[0] || '';
  const repo  = parts[1] || '';

  console.log(`🔍 Analyzing ${repoName} (owner="${owner}" repo="${repo}")`);

  const fileBlock = files
    .map(f => `FILE: ${f.path}\n${f.content}`)
    .join('\n\n');

  const userPrompt = `
You are a world-class senior software architect with 15+ years of experience.

Analyze this GitHub repository and give a thorough, expert analysis that will help developers understand it quickly.

Repository: ${repoName}

Files:
${fileBlock}

STRICT RULES:
- Return ONLY valid JSON, nothing else
- No markdown fences, no explanations outside JSON
- NEVER leave arrays empty
- Be specific — mention actual file names and function names from the code above
- Write summaries as if explaining to a smart junior developer

Return EXACT JSON structure:
{
  "summary": "2-3 sentence plain-English explanation of what this project does and why it exists",
  "techStack": ["list of actual technologies, frameworks, libraries detected"],
  "architecture": "Clear explanation of the architectural pattern (e.g. MVC, microservices, monolith) and how the major pieces connect",
  "architectureKeywords": ["e.g. REST API", "React SPA", "Express middleware"],

  "entryPoints": [
    { "file": "actual/path/from/files", "reason": "specific reason why this is the entry point", "priority": 1 }
  ],

  "criticalFiles": [
    { "file": "actual/path", "explanation": "what this file does and why it matters", "keyPatterns": ["actual patterns or functions used"] }
  ],

  "gotchas": [
    { "title": "specific issue title", "description": "detailed explanation of the gotcha, what goes wrong and why", "severity": "low|medium|high" }
  ],

  "readingOrder": [
    { "order": 1, "file": "actual/path", "why": "specific reason to read this file at this order", "timeEstimate": "X min" }
  ]
}

MINIMUMS:
- entryPoints: at least 3 real files
- criticalFiles: at least 5 real files
- gotchas: at least 4 real gotchas
- readingOrder: at least 6 files in logical reading sequence
`;

  // ── Run AI analysis AND GitHub stats fetch IN PARALLEL ──
  const aiPromise = fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert software architect. Return ONLY valid JSON. No markdown fences. No preamble. Just the JSON object."
        },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    })
  });

  const githubPromise = (owner && repo)
    ? fetchGitHubData(owner, repo).catch(err => {
        console.error("⚠️ GitHub stats fetch failed (non-fatal):", err.message);
        return null;
      })
    : Promise.resolve(null);

  try {
    // Both run at the same time — AI is slow, GitHub is fast
    const [aiResponse, githubData] = await Promise.all([aiPromise, githubPromise]);

    console.log(`✅ GitHub stats: ${githubData ? 'OK' : 'null'}`);

    const data = await aiResponse.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(clean); }
    catch { parsed = {}; }

    function ensureData(d) {
      if (!d || typeof d !== "object") d = {};
      if (!d.summary) d.summary = "AI analysis unavailable.";
      if (!Array.isArray(d.techStack)) d.techStack = ["Unknown"];
      if (!d.architecture) d.architecture = "Architecture not available.";
      if (!Array.isArray(d.architectureKeywords)) d.architectureKeywords = ["General"];
      if (!Array.isArray(d.entryPoints) || d.entryPoints.length === 0) {
        d.entryPoints = [
          { file: "index.js", reason: "Main entry point", priority: 1 },
          { file: "app.js", reason: "Application setup", priority: 2 },
          { file: "server.js", reason: "Server initialization", priority: 3 }
        ];
      }
      if (!Array.isArray(d.criticalFiles) || d.criticalFiles.length === 0) {
        d.criticalFiles = [
          { file: "main.js", explanation: "Core application logic", keyPatterns: ["initialization"] }
        ];
      }
      if (!Array.isArray(d.gotchas) || d.gotchas.length === 0) {
        d.gotchas = [
          { title: "Missing error handling", description: "Several async functions lack proper error boundaries.", severity: "medium" }
        ];
      }
      if (!Array.isArray(d.readingOrder) || d.readingOrder.length === 0) {
        d.readingOrder = [
          { order: 1, file: "index.js", why: "Start here to understand initialization", timeEstimate: "5 min" }
        ];
      }
      return d;
    }

    res.json({ ...ensureData(parsed), githubData });

  } catch (err) {
    console.error("❌ /api/analyze error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ================== AI CHAT ==================
app.post('/api/chat', async (req, res) => {
  const { question, history = [], context } = req.body;

  if (!question || !context) {
    return res.status(400).json({ error: 'question and context required' });
  }

  const fileContext = context.files
    .slice(0, 15)
    .map(f => `📄 ${f.path} (${f.lines} lines, ${f.language})`)
    .join('\n');

  const criticalFilesContext = context.analysis.criticalFiles
    ? context.analysis.criticalFiles.map(cf => `• ${cf.file}: ${cf.explanation}`).join('\n')
    : '';

  const gotchasContext = context.analysis.gotchas
    ? context.analysis.gotchas.map(g => `• [${g.severity.toUpperCase()}] ${g.title}: ${g.description}`).join('\n')
    : '';

  const systemPrompt = `You are RepoXray AI — the world's most knowledgeable and friendly codebase guide.

You are like a brilliant senior engineer who has spent hours reading this exact repository and now sits beside the developer, ready to explain anything clearly, deeply, and conversationally.

═══════════════════════════════════════════════
REPOSITORY: ${context.repoName}
═══════════════════════════════════════════════

📋 SUMMARY:
${context.analysis.summary}

🛠️ TECH STACK:
${context.analysis.techStack.join(' · ')}

🏗️ ARCHITECTURE:
${context.analysis.architecture}

📂 KEY FILES:
${fileContext}

🔑 CRITICAL FILES:
${criticalFilesContext}

⚠️ GOTCHAS TO KNOW:
${gotchasContext}

═══════════════════════════════════════════════
HOW TO RESPOND:
═══════════════════════════════════════════════

PERSONALITY:
- Be warm, sharp, and direct — like a brilliant tech mentor
- Never be robotic or generic — always be specific to THIS repo
- Show genuine enthusiasm when explaining elegant code patterns
- Use "we", "you'll notice", "the interesting thing here is..." naturally

FORMAT:
- Start with a 1-sentence direct answer to the question
- Use structured markdown: headers, bullets, code blocks where helpful
- Mention ACTUAL file names from this repo (e.g. \`src/components/Hero.tsx\`)
- Give concrete examples from the actual codebase when possible
- Code snippets should be in proper \`\`\`language blocks

DEPTH:
- For simple questions: 150-250 words, clear and punchy
- For architecture/deep questions: 300-500 words, structured with headers
- For advanced questions: go deep, don't shy away from complexity

NEVER:
- Give a generic answer that could apply to any codebase
- Say "I don't have access to the full code" — you DO have the analysis above
- Use filler phrases like "Great question!" or "Certainly!"
- Repeat the question back to the user`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: question }
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages,
        stream: true,
        temperature: 0.6,
        max_tokens: 1200,
      })
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value));
    }

    res.end();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RepoXray server at http://localhost:${PORT}`);
});
