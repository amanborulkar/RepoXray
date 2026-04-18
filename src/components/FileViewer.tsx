import { useEffect, useState, useCallback } from "react";

/* ── Language detection ─────────────────────────────────────────────── */
const LANG_MAP: Record<string, string> = {
  ts: "TypeScript", tsx: "TSX", js: "JavaScript", jsx: "JSX",
  py: "Python", rs: "Rust", go: "Go", java: "Java",
  cpp: "C++", c: "C", cs: "C#", rb: "Ruby", php: "PHP",
  swift: "Swift", kt: "Kotlin", md: "Markdown", json: "JSON",
  yaml: "YAML", yml: "YAML", toml: "TOML", html: "HTML",
  css: "CSS", scss: "SCSS", sass: "SASS", sh: "Shell",
  bash: "Bash", sql: "SQL", env: "Env", txt: "Text",
  xml: "XML", vue: "Vue", svelte: "Svelte", lock: "Lockfile",
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", TSX: "#3178c6",
  JavaScript: "#f1e05a", JSX: "#f1e05a",
  Python: "#3572a5", Rust: "#dea584", Go: "#00add8",
  Java: "#b07219", "C++": "#f34b7d", C: "#555555",
  HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c",
  Markdown: "#083fa1", JSON: "#292929", Shell: "#89e051",
  Bash: "#89e051", SQL: "#e38c00", Vue: "#41b883",
  Svelte: "#ff3e00",
};

function getLang(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return LANG_MAP[ext] || ext.toUpperCase() || "Text";
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/* ── Props ────────────────────────────────────────────────────────────── */
interface Props {
  owner: string;
  repo: string;
  path: string;
  onClose: () => void;
}

interface FileMeta {
  name: string;
  path: string;
  size: number;
  sha: string;
  html_url: string;
  encoding: string;
}

interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
  authorEmail: string;
}

/* ── Component ─────────────────────────────────────────────────────────── */
export default function FileViewer({ owner, repo, path, onClose }: Props) {
  const [content, setContent]   = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [commit, setCommit]     = useState<CommitInfo | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState(false);

  const filename = path.split("/").pop() || path;
  const lang     = getLang(filename);
  const langColor = LANG_COLORS[lang] || "#888888";

  /* ── Fetch file + last commit in parallel ── */
  useEffect(() => {
    const token = (import.meta as any).env?.VITE_GITHUB_TOKEN;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } : { Accept: "application/vnd.github+json" };

    setLoading(true);
    setError("");
    setContent(null);
    setFileMeta(null);
    setCommit(null);

    const base = `https://api.github.com/repos/${owner}/${repo}`;

    Promise.all([
      fetch(`${base}/contents/${path}`, { headers }),
      fetch(`${base}/commits?path=${encodeURIComponent(path)}&per_page=1`, { headers }),
    ])
      .then(([fr, cr]) => Promise.all([fr.json(), cr.json()]))
      .then(([file, commits]) => {
        if (file.message) {
          setError(file.message);
          return;
        }
        if (file.encoding !== "base64") {
          setError("Binary or unsupported file — cannot display.");
          return;
        }

        const decoded = atob(file.content.replace(/\n/g, ""));
        setContent(decoded);
        setFileMeta({
          name:     file.name,
          path:     file.path,
          size:     file.size,
          sha:      file.sha,
          html_url: file.html_url,
          encoding: file.encoding,
        });

        if (Array.isArray(commits) && commits[0]) {
          const c = commits[0];
          setCommit({
            sha:         c.sha.slice(0, 7),
            message:     c.commit.message.split("\n")[0],
            author:      c.commit.author.name,
            date:        fmtDate(c.commit.author.date),
            authorEmail: c.commit.author.email,
          });
        }
      })
      .catch(() => setError("Failed to load file. Check your network or token."))
      .finally(() => setLoading(false));
  }, [owner, repo, path]);

  /* ── Close on Escape ── */
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  /* ── Copy handler ── */
  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = content?.split("\n") || [];

  return (
    <div
      className="file-viewer-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="file-viewer">

        {/* ── Header ── */}
        <div className="file-viewer-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {/* Language color dot */}
            <span style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
              background: langColor,
              boxShadow: `0 0 8px ${langColor}88`,
            }} />
            {/* Filename */}
            <span style={{
              fontWeight: 700, fontSize: 14, color: "var(--text)",
              fontFamily: "'Geist Mono', monospace",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {filename}
            </span>
            <span className="tag tag-cyan" style={{ fontSize: 10, flexShrink: 0 }}>{lang}</span>
            {/* Path breadcrumb */}
            {path.includes("/") && (
              <span style={{
                fontSize: 11, color: "var(--muted)", fontFamily: "'Geist Mono', monospace",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {path.split("/").slice(0, -1).join(" / ")}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleCopy}
              disabled={!content}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy
                </>
              )}
            </button>

            {fileMeta?.html_url && (
              <a
                href={fileMeta.html_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ textDecoration: "none" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                GitHub
              </a>
            )}

            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Close
            </button>
          </div>
        </div>

        {/* ── Meta strip ── */}
        {!loading && !error && fileMeta && (
          <div className="file-viewer-meta">
            <span title="File size">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              {fmtSize(fileMeta.size)}
            </span>
            <span title="Line count">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              {lines.length} lines
            </span>
            <span title="SHA" style={{ fontFamily: "'Geist Mono', monospace" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
              {fileMeta.sha.slice(0, 7)}
            </span>
            {commit && (
              <>
                <span title="Last author">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {commit.author}
                </span>
                <span title="Last commit date">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {commit.date}
                </span>
                <span title="Last commit message" style={{ color: "var(--muted2)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {commit.message.length > 65 ? commit.message.slice(0, 65) + "…" : commit.message}
                </span>
                <span className="tag tag-gray" style={{ fontSize: 10 }}>#{commit.sha}</span>
              </>
            )}
          </div>
        )}

        {/* ── Code body ── */}
        <div className="file-viewer-body">
          {loading ? (
            /* Shimmer skeleton */
            <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", gap: 9 }}>
              {[...Array(18)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{
                    height: 13,
                    width: `${40 + Math.sin(i * 1.7) * 30 + Math.cos(i * 0.9) * 20}%`,
                    opacity: 0.7 - i * 0.025,
                  }}
                />
              ))}
            </div>
          ) : error ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: 60, gap: 12, color: "var(--red-l)",
              textAlign: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: 14 }}>{error}</span>
            </div>
          ) : (
            /* Line-numbered code table */
            <table className="code-table">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="code-line">
                    <td className="code-line-num">{i + 1}</td>
                    <td className="code-line-text">{line || "\u00A0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
