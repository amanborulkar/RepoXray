import { RepoFile, DependencyGraphData, GraphNode, GraphLink } from '../types';
import { extractImports, isInternal } from './importParser';

function detectCycles(adj: Map<string, string[]>): Set<string> {
  const circular = new Set<string>();
  const visiting = new Set<string>();
  const visited  = new Set<string>();

  function dfs(node: string, path: string[]): boolean {
    if (visited.has(node)) return false;
    if (visiting.has(node)) { path.forEach(n => circular.add(n)); circular.add(node); return true; }
    visiting.add(node);
    for (const neighbor of adj.get(node) || []) dfs(neighbor, [...path, node]);
    visiting.delete(node);
    visited.add(node);
    return false;
  }

  for (const node of adj.keys()) dfs(node, []);
  return circular;
}

export function buildDependencyGraph(files: RepoFile[]): DependencyGraphData {
  const pathSet = new Set(files.map(f => f.path));
  const adj = new Map<string, string[]>();
  const importedBy = new Map<string, number>();

  for (const file of files) {
    const imports = extractImports(file.content).filter(isInternal);
    const resolved = imports
      .map(imp => files.find(f => f.path.includes(imp.replace(/^\.\.?\//, ''))))
      .filter((f): f is RepoFile => !!f)
      .map(f => f.path);

    adj.set(file.path, resolved);
    resolved.forEach(r => importedBy.set(r, (importedBy.get(r) || 0) + 1));
  }

  const circular = detectCycles(adj);

  const nodes: GraphNode[] = files.map(file => ({
    id: file.path,
    name: file.path.split('/').pop() || file.path,
    path: file.path,
    type: circular.has(file.path)
      ? 'circular'
      : (importedBy.get(file.path) || 0) === 0
        ? 'entry'
        : 'module',
    importCount: adj.get(file.path)?.length || 0,
    importedByCount: importedBy.get(file.path) || 0,
  }));

  const links: GraphLink[] = [];
  adj.forEach((deps, source) => {
    deps.forEach(target => { if (pathSet.has(target)) links.push({ source, target }); });
  });

  return { nodes, links };
}
