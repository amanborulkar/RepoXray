import { RepoInfo, TreeItem, RepoFile } from '../types';

const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git', '.next', '__pycache__',
  '.venv', 'venv', 'env', 'coverage', '.nyc_output', 'vendor',
  '.turbo', '.vercel', 'out', 'target',
]);

const SKIP_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2',
  '.ttf', '.eot', '.otf', '.mp4', '.mp3', '.wav', '.pdf', '.zip',
  '.tar', '.gz', '.lock', '.sum', '.toml', '.snap',
]);

async function ghFetch<T>(path: string): Promise<T> {
  const res = await fetch(`/api/github/${path}`);
  if (res.status === 401) throw new Error('401: Bad GitHub token');
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    if (body.message?.includes('rate limit')) throw new Error('RATE_LIMIT');
    throw new Error('403: Private repo or forbidden');
  }
  if (res.status === 404) throw new Error('404: Repo not found');
  if (!res.ok) throw new Error(`GitHub error ${res.status}`);
  return res.json();
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const data = await ghFetch<any>(`repos/${owner}/${repo}`);
  return {
    owner,
    repo,
    fullName: data.full_name,
    description: data.description || 'No description provided.',
    stars: data.stargazers_count,
    forks: data.forks_count,
    language: data.language || 'Unknown',
    defaultBranch: data.default_branch,
    homepage: data.homepage || null,
    topics: data.topics || [],
  };
}

export async function fetchRepoTree(owner: string, repo: string, branch: string): Promise<TreeItem[]> {
  const data = await ghFetch<any>(
    `repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );
  return (data.tree as any[])
    .filter(item => {
      if (item.type !== 'blob') return false;
      const parts = item.path.split('/');
      if (parts.some((p: string) => SKIP_DIRS.has(p))) return false;
      const ext = '.' + item.path.split('.').pop()?.toLowerCase();
      if (SKIP_EXTS.has(ext)) return false;
      if (item.size && item.size > 500_000) return false;
      return true;
    })
    .map(item => ({
      path: item.path,
      type: item.type,
      sha: item.sha,
      size: item.size,
    }));
}

export function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
    py: 'Python', rs: 'Rust', go: 'Go', java: 'Java', cpp: 'C++', c: 'C',
    cs: 'C#', rb: 'Ruby', php: 'PHP', swift: 'Swift', kt: 'Kotlin',
    md: 'Markdown', json: 'JSON', yaml: 'YAML', yml: 'YAML',
    html: 'HTML', css: 'CSS', scss: 'SCSS', sh: 'Shell', bash: 'Shell',
    dockerfile: 'Docker', toml: 'TOML', xml: 'XML',
  };
  return map[ext] || ext.toUpperCase() || 'Text';
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  maxLines = 200
): Promise<string> {
  try {
    const data = await ghFetch<any>(`repos/${owner}/${repo}/contents/${path}`);
    if (data.encoding !== 'base64' || !data.content) return '';
    const decoded = atob(data.content.replace(/\n/g, ''));
    const lines = decoded.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n') + `\n\n// ... (truncated at ${maxLines} lines)`;
    }
    return decoded;
  } catch {
    return '';
  }
}

export async function fetchSelectedFiles(
  owner: string,
  repo: string,
  paths: string[],
  onProgress?: (done: number, total: number) => void
): Promise<RepoFile[]> {
  const results: RepoFile[] = [];
const BATCH_SIZE = 5;

  for (let i = 0; i < paths.length; i += BATCH_SIZE) {
    const batch = paths.slice(i, i + BATCH_SIZE);

    const settled = await Promise.allSettled(
      batch.map(path => fetchFileContent(owner, repo, path))
    );

    settled.forEach((result, idx) => {
      const path = batch[idx];
      const content = result.status === 'fulfilled' ? result.value : '';
      if (content) {
        results.push({
          path,
          content,
          language: detectLanguage(path),
          lines: content.split('\n').length,
          size: content.length,
        });
      }
    });

    onProgress?.(Math.min(i + BATCH_SIZE, paths.length), paths.length);
  }

  return results;
}
