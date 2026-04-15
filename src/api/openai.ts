// src/api/openai.ts

import { RepoFile, ClaudeAnalysis, ChatMessage } from '../types';

const BASE_URL = "https://repoxray-16ko.onrender.com";

// ── Analyze Repo ─────────────────────────────────────────
export async function analyzeRepo(
  repoName: string,
  files: RepoFile[]
): Promise<ClaudeAnalysis> {

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoName, files }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('Invalid API key');
    if (res.status === 429) throw new Error('RATE_LIMIT');
    throw new Error(err.error || `Server error ${res.status}`);
  }

  return res.json();
}

// ── Chat with streaming ──────────────────────────────────
export async function streamChat(
  question: string,
  history: ChatMessage[],
  context: {
    repoName: string;
    analysis: ClaudeAnalysis;
    files: RepoFile[];
  },
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {

  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      history,
      context
    }) // ✅ FIXED (removed extra comma)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);

    const lines = text
      .split('\n')
      .filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const json = line.slice(6).trim();

      if (json === '[DONE]') continue;

      try {
        const parsed = JSON.parse(json);
        const chunk = parsed.choices?.[0]?.delta?.content;

        if (chunk) onChunk(chunk);
      } catch {
        // ignore parsing errors
      }
    }
  }

  onDone();
}