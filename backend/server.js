// ================== IMPORTS ==================
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// ================== INIT ==================
const app = express();
const PORT = process.env.PORT || 4000;

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());

// ================== HEALTH ==================
app.get("/", (req, res) => {
  res.send("🚀 RepoXray Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ================== GITHUB PROXY ==================
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

// ================== AI ANALYZE ==================
app.post('/api/analyze', async (req, res) => {
  const { repoName, files } = req.body;

  if (!repoName || !Array.isArray(files)) {
    return res.status(400).json({ error: 'repoName and files required' });
  }

  const fileBlock = files
    .map(f => `FILE: ${f.path}\n${f.content}`)
    .join('\n\n');

  const userPrompt = `
You are a senior software architect.

Analyze this repository deeply.

STRICT RULES:
- Return ONLY valid JSON
- No markdown, no explanation
- NEVER leave arrays empty

Repository: ${repoName}

Files:
${fileBlock}

Return EXACT JSON:

{
  "summary": "2-3 sentence explanation",
  "techStack": ["tech1", "tech2"],
  "architecture": "clear explanation",
  "architectureKeywords": ["MVC"],

  "entryPoints": [
    { "file": "path", "reason": "why important", "priority": 1 }
  ],

  "criticalFiles": [
    { "file": "path", "explanation": "why important", "keyPatterns": ["pattern"] }
  ],

  "gotchas": [
    { "title": "issue", "description": "problem", "severity": "low" }
  ],

  "readingOrder": [
    { "order": 1, "file": "path", "why": "reason", "timeEstimate": "5 min" }
  ]
}

MINIMUM:
- entryPoints: 3
- criticalFiles: 5
- gotchas: 3
- readingOrder: 5
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          { role: "system", content: "Return only JSON." },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    const raw = data.choices?.[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(clean);
    } catch {
      parsed = {};
    }

    function ensureData(d) {
      if (!d || typeof d !== "object") d = {};

      if (!d.summary) d.summary = "AI-generated summary unavailable.";
      if (!Array.isArray(d.techStack)) d.techStack = ["Unknown"];
      if (!d.architecture) d.architecture = "Architecture not available.";
      if (!Array.isArray(d.architectureKeywords)) d.architectureKeywords = ["General"];

      if (!Array.isArray(d.entryPoints) || d.entryPoints.length === 0) {
        d.entryPoints = [
          { file: "index.js", reason: "Main entry", priority: 1 },
          { file: "app.js", reason: "Core logic", priority: 2 },
          { file: "server.js", reason: "Backend start", priority: 3 }
        ];
      }

      if (!Array.isArray(d.criticalFiles) || d.criticalFiles.length === 0) {
        d.criticalFiles = [
          { file: "main.js", explanation: "Core logic", keyPatterns: ["core"] },
          { file: "routes.js", explanation: "Routing", keyPatterns: ["routing"] },
          { file: "config.js", explanation: "Config", keyPatterns: ["config"] }
        ];
      }

      if (!Array.isArray(d.gotchas) || d.gotchas.length === 0) {
        d.gotchas = [
          { title: "Error handling", description: "Missing try/catch", severity: "medium" }
        ];
      }

      if (!Array.isArray(d.readingOrder) || d.readingOrder.length === 0) {
        d.readingOrder = [
          { order: 1, file: "index.js", why: "Start here", timeEstimate: "5 min" }
        ];
      }

      return d;
    }

    parsed = ensureData(parsed);

    res.json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== AI CHAT ==================
app.post('/api/chat', async (req, res) => {
  const { question, history = [], context } = req.body;

  if (!question || !context) {
    return res.status(400).json({ error: 'question and context required' });
  }

  const systemPrompt = `
You are a friendly and highly skilled senior software engineer.

Your job is to help a developer understand a GitHub repository.

Be:
- Friendly 😊
- Clear and simple
- Helpful like a mentor
- Not too long, not too short

Repository: ${context.repoName}

Summary:
${context.analysis.summary}

Tech Stack:
${context.analysis.techStack.join(', ')}

Architecture:
${context.analysis.architecture}

Important Files:
${context.files.slice(0, 10).map(f => `- ${f.path}`).join('\n')}

RESPONSE STYLE:
- Start with a short friendly sentence
- Use bullet points for clarity
- Mention file names when possible
- Give simple examples if helpful
- Avoid complex jargon
- Keep answers clean and structured

DO NOT:
- Be robotic
- Give unnecessary long paragraphs
- Repeat same thing
`;


  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-5),
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
        model: "anthropic/claude-3-haiku",
        messages,
        stream: true
      })
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

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

// ================== START ==================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});