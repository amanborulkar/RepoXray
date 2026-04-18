// ─── GitHub ──────────────────────────────────────────────────────────────────
export interface RepoInfo {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  defaultBranch: string;
  homepage: string | null;
  topics: string[];
}

export interface TreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
}

export interface RepoFile {
  path: string;
  content: string;
  language: string;
  lines: number;
  size: number;
}

// ─── Claude Analysis ─────────────────────────────────────────────────────────
export interface EntryPoint {
  file: string;
  reason: string;
  priority: number;
}

export interface CriticalFile {
  file: string;
  explanation: string;
  keyPatterns?: string[];
}

export interface Gotcha {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ReadingStep {
  order: number;
  file: string;
  why: string;
  timeEstimate: string;
}

export interface ClaudeAnalysis {
  summary: string;
  techStack: string[];
  architecture: string;
  architectureKeywords: string[];
  entryPoints: EntryPoint[];
  criticalFiles: CriticalFile[];
  gotchas: Gotcha[];
  readingOrder: ReadingStep[];
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

// ─── Dependency Graph ────────────────────────────────────────────────────────
export interface GraphNode {
  id: string;
  name: string;
  path: string;
  type: 'entry' | 'module' | 'external' | 'circular';
  importCount: number;
  importedByCount: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

export interface DependencyGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ─── App State ────────────────────────────────────────────────────────────────
export type AppPhase = 'hero' | 'loading' | 'dashboard';

export interface AppState {
  phase: AppPhase;
  repoInfo: RepoInfo | null;
  files: RepoFile[];
  analysis: ClaudeAnalysis | null;
  githubData: any | null;
  error: string | null;
  loadingStep: string;
  loadingProgress: number;
}

// ─── Checklist ────────────────────────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  category: 'setup' | 'explore' | 'understand';
}

// ─── Error ────────────────────────────────────────────────────────────────────
export type ErrorType =
  | 'PRIVATE_REPO'
  | 'INVALID_URL'
  | 'RATE_LIMIT'
  | 'NETWORK_TIMEOUT'
  | 'NOT_FOUND'
  | 'API_KEY_MISSING'
  | 'UNKNOWN';

export interface AppError {
  type: ErrorType;
  message: string;
  action?: string;
  actionUrl?: string;
}
