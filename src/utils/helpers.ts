import fileDownload from 'js-file-download';
import { ClaudeAnalysis, AppError, ChecklistItem, RepoInfo, RepoFile } from '../types';

// ─── Cache ────────────────────────────────────────────────────────────────────
const TTL = 30 * 60 * 1000; // 30 min
const PREFIX = 'rxray_';    // FIX: was 'cbai_' in clearAll(), causing stale cache buildup

export const cache = {
  key: (owner: string, repo: string) => `${PREFIX}${owner}/${repo}`,

  save(owner: string, repo: string, data: object) {
    try {
      sessionStorage.setItem(this.key(owner, repo), JSON.stringify({ data, ts: Date.now() }));
    } catch (e) { console.warn('Cache write failed', e); }
  },

  load<T>(owner: string, repo: string): T | null {
    try {
      const raw = sessionStorage.getItem(this.key(owner, repo));
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > TTL) { sessionStorage.removeItem(this.key(owner, repo)); return null; }
      return data as T;
    } catch { return null; }
  },

  has(owner: string, repo: string): boolean { return this.load(owner, repo) !== null; },

  // FIX: was using wrong prefix 'cbai_' — never cleared anything
  clearAll() {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => sessionStorage.removeItem(k));
  },
};

// ─── Error Classifier ─────────────────────────────────────────────────────────
export function classifyError(err: unknown): AppError {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  if (msg.includes('api_key_missing') || msg.includes('api key'))
    return { type: 'API_KEY_MISSING', message: 'Add your OpenAI API key to .env file.', action: 'Get API Key', actionUrl: 'https://platform.openai.com/api-keys' };
  if (msg.includes('rate_limit') || msg.includes('rate limit'))
    return { type: 'RATE_LIMIT', message: 'API rate limit hit. Wait a moment and retry.', action: 'Check GitHub Limits', actionUrl: 'https://api.github.com/rate_limit' };
  if (msg.includes('401') || msg.includes('bad github token'))
    return { type: 'PRIVATE_REPO', message: 'Invalid or expired GitHub token.', action: 'Regenerate Token', actionUrl: 'https://github.com/settings/tokens' };
  if (msg.includes('403'))
    return { type: 'PRIVATE_REPO', message: 'Private repo. Add a GitHub token with repo access.', action: 'Create Token', actionUrl: 'https://github.com/settings/tokens' };
  if (msg.includes('404'))
    return { type: 'NOT_FOUND', message: 'Repository not found. Check the URL.' };
  if (msg.includes('timeout') || msg.includes('network') || msg.includes('fetch'))
    return { type: 'NETWORK_TIMEOUT', message: 'Network error. Check your connection.' };
  return { type: 'UNKNOWN', message: err instanceof Error ? err.message : 'An unexpected error occurred.' };
}

// ─── Complexity Score ─────────────────────────────────────────────────────────
// FIX: removed Math.random() — it caused non-deterministic scores on re-render
export function calcComplexity(fileCount: number, avgLines: number, highSeverityGotchas: number): number {
  let score = 0;
  score += Math.min(3, fileCount / 150);
  score += Math.min(3, avgLines / 150);
  score += Math.min(3, highSeverityGotchas);
  score += Math.min(1, (fileCount % 7) * 0.1); // deterministic variation
  return Math.min(10, Math.round(Math.max(1, score) * 10) / 10);
}

export function complexityLabel(score: number): { label: string; color: string; bg: string } {
  if (score <= 3) return { label: 'Simple',   color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
  if (score <= 6) return { label: 'Moderate', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
  return               { label: 'Complex',  color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
}

// ─── Checklist Generator ──────────────────────────────────────────────────────
export function generateChecklist(info: RepoInfo, analysis: ClaudeAnalysis): ChecklistItem[] {
  return [
    { id: 'readme',   label: `Read the README for ${info.repo}`,                              done: false, category: 'setup' },
    { id: 'clone',    label: 'Clone the repo locally',                                         done: false, category: 'setup' },
    { id: 'install',  label: 'Install dependencies',                                           done: false, category: 'setup' },
    { id: 'run',      label: 'Get the project running locally',                               done: false, category: 'setup' },
    { id: 'entry',    label: `Read entry point: ${analysis.entryPoints[0]?.file || 'index file'}`, done: false, category: 'explore' },
    { id: 'graph',    label: 'Review the dependency graph',                                    done: false, category: 'explore' },
    { id: 'critical', label: 'Read the top 3 critical files',                                 done: false, category: 'explore' },
    { id: 'arch',     label: 'Understand the architecture overview',                           done: false, category: 'understand' },
    { id: 'gotchas',  label: `Review ${analysis.gotchas.length} gotcha${analysis.gotchas.length !== 1 ? 's' : ''}`, done: analysis.gotchas.length === 0, category: 'understand' },
    { id: 'tests',    label: 'Run the test suite',                                             done: false, category: 'understand' },
  ];
}

// ─── Markdown Export ──────────────────────────────────────────────────────────
export function exportToMarkdown(info: RepoInfo, analysis: ClaudeAnalysis, files: RepoFile[]) {
  const md = `# Codebase Analysis: ${info.fullName}
> Generated ${new Date().toLocaleDateString()} by RepoXray

## Overview
${analysis.summary}

| Metric | Value |
|--------|-------|
| Language | ${info.language} |
| Stars | ⭐ ${info.stars.toLocaleString()} |
| Forks | 🍴 ${info.forks.toLocaleString()} |
| Files Analyzed | ${files.length} |

## Tech Stack
${analysis.techStack.map(t => `- ${t}`).join('\n')}

## Architecture
${analysis.architecture}

**Keywords:** ${analysis.architectureKeywords.join(', ')}

## Entry Points
${analysis.entryPoints.map(e => `${e.priority}. \`${e.file}\` — ${e.reason}`).join('\n')}

## Critical Files
${analysis.criticalFiles.map(f => `### \`${f.file}\`\n${f.explanation}`).join('\n\n')}

## Gotchas ⚠️
${analysis.gotchas.map(g => `**[${g.severity.toUpperCase()}] ${g.title}**\n${g.description}`).join('\n\n')}

## Recommended Reading Order
${analysis.readingOrder.map(r => `${r.order}. \`${r.file}\` (${r.timeEstimate}) — ${r.why}`).join('\n')}

---
*Generated by [RepoXray](${window.location.origin})*
`;
  fileDownload(md, `${info.owner}-${info.repo}-analysis.md`, 'text/markdown');
}

// ─── Share URL ────────────────────────────────────────────────────────────────
export function buildShareUrl(owner: string, repo: string): string {
  return `${window.location.origin}${window.location.pathname}?repo=${owner}/${repo}`;
}

export function parseShareUrl(): { owner: string; repo: string } | null {
  const r = new URLSearchParams(window.location.search).get('repo');
  if (!r) return null;
  const [owner, repo] = r.split('/');
  return owner && repo ? { owner, repo } : null;
}

// ─── Retry ────────────────────────────────────────────────────────────────────
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelay = 1000): Promise<T> {
  let last: unknown;
  for (let i = 0; i <= maxRetries; i++) {
    try { return await fn(); }
    catch (err) {
      last = err;
      if (i < maxRetries) await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i)));
    }
  }
  throw last;
}

// Re-export AppError type reference (avoids direct import in components)
export type { AppError };
