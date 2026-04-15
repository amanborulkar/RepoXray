export function extractImports(code: string): string[] {
  const imports = new Set<string>();

  // ES6 static imports
  const es6 = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g;
  // CommonJS
  const cjs = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  // Dynamic import
  const dyn = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  // Python
  const py1 = /^from\s+([\w.]+)\s+import/gm;
  const py2 = /^import\s+([\w.]+)/gm;

  let m: RegExpExecArray | null;
  while ((m = es6.exec(code)))  imports.add(m[1]);
  while ((m = cjs.exec(code)))  imports.add(m[1]);
  while ((m = dyn.exec(code)))  imports.add(m[1]);
  while ((m = py1.exec(code)))  imports.add(m[1]);
  while ((m = py2.exec(code)))  imports.add(m[1]);

  return Array.from(imports);
}

export function isInternal(path: string): boolean {
  return path.startsWith('.') || path.startsWith('/') || path.startsWith('@/') || path.startsWith('~/');
}

export function normalizePath(importPath: string, fromFile: string): string {
  // Strip extensions
  return importPath.replace(/\.[jt]sx?$/, '').replace(/^\.\//, '');
}
