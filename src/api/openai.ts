import { RepoFile, ClaudeAnalysis, ChatMessage } from '../types';

// ── Analyze Repo ──────────────────────────────────────────
export async function analyzeRepo(
  repoName: string,
  files: RepoFile[]
): Promise<{ analysis: ClaudeAnalysis; githubData: any | null }> {

  let res: Response;
  try {

    res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoName, files }),
    });
  } catch (networkErr) {
    throw new Error(
      'Cannot reach the backend. ' +
      'Make sure to run: cd backend && npm start'
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('Invalid API key — check OPENROUTER_API_KEY in backend/.env');
    if (res.status === 429) throw new Error('RATE_LIMIT: Too many requests. Wait a moment and retry.');
    if (res.status === 500) throw new Error(err.error || 'AI server error. Check backend logs.');
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  const { githubData, ...analysis } = data;
  return { analysis: analysis as ClaudeAnalysis, githubData: githubData ?? null };
}

// ── Chat with streaming ───────────────────────────────────
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

  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history, context }),
    });
  } catch (networkErr) {
    throw new Error(
      'Cannot reach the backend. ' +
      'Run: cd backend && npm start'
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep incomplete last line in buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const json = trimmed.slice(6).trim();
      if (json === '[DONE]') continue;

      try {
        const parsed = JSON.parse(json);
        const chunk = parsed.choices?.[0]?.delta?.content;
        if (chunk) onChunk(chunk);
      } catch {
        // ignore malformed SSE lines
      }
    }
  }

  // Process any remaining buffer
  if (buffer.startsWith('data: ')) {
    const json = buffer.slice(6).trim();
    if (json && json !== '[DONE]') {
      try {
        const parsed = JSON.parse(json);
        const chunk = parsed.choices?.[0]?.delta?.content;
        if (chunk) onChunk(chunk);
      } catch { /* ignore */ }
    }
  }

  onDone();
}
