import { TreeItem } from '../types';

const ROOT_BONUS = 2;
const README_BONUS = 5;
const ENTRY_BONUS = 3;
const CONFIG_BONUS = 1;

const ENTRY_PATTERNS = [
  'main', 'index', 'app', 'server', 'start', 'run',
  'init', 'bootstrap', 'entry', 'cli',
];

const CONFIG_PATTERNS = [
  'config', 'settings', 'constants', 'env', 'setup',
  '.config.', 'webpack', 'vite', 'rollup', 'babel',
];

const IMPORTANT_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs',
  '.java', '.cs', '.rb', '.php', '.swift', '.kt', '.md',
]);

function scoreFile(item: TreeItem): number {
  const parts = item.path.split('/');
  const filename = parts[parts.length - 1].toLowerCase();
  const depth = parts.length - 1;
  const ext = '.' + filename.split('.').pop();
  let score = 0;

  if (!IMPORTANT_EXTS.has(ext)) return -1;

  // README is always top priority
  if (filename.startsWith('readme')) return 100 + README_BONUS;

  // Root level files are more important
  if (depth === 0) score += ROOT_BONUS * 3;
  else if (depth === 1) score += ROOT_BONUS;
  // Penalise deep nesting
  score -= depth;

  // Entry point names
  if (ENTRY_PATTERNS.some(p => filename.includes(p))) score += ENTRY_BONUS;

  // Config files
  if (CONFIG_PATTERNS.some(p => filename.includes(p))) score += CONFIG_BONUS;

  // Prefer src/ files over test files
  if (item.path.includes('test') || item.path.includes('spec') || item.path.includes('__test')) score -= 3;
  if (item.path.includes('/src/') || item.path.includes('/lib/') || item.path.includes('/core/')) score += 2;

  // Smaller files are often more digestible entry points
  if (item.size && item.size < 5000) score += 1;

  return score;
}

export function selectImportantFiles(tree: TreeItem[], maxFiles = 15): string[] {
  const scored = tree
    .map(item => ({ item, score: scoreFile(item) }))
    .filter(s => s.score >= 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxFiles).map(s => s.item.path);
}

export function buildFileTree(paths: string[]): Map<string, string[]> {
  const tree = new Map<string, string[]>();
  for (const path of paths) {
    const parts = path.split('/');
    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts.slice(0, i + 1).join('/');
      if (!tree.has(dir)) tree.set(dir, []);
    }
    const dir = parts.slice(0, -1).join('/') || '.';
    if (!tree.has(dir)) tree.set(dir, []);
    tree.get(dir)!.push(path);
  }
  return tree;
}
