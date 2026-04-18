import React from "react";

/* RepoStats.tsx — Paste into src/components/RepoStats.tsx
   Pass the `githubData` object from your backend API response as the `data` prop.
   Example: <RepoStats data={repoData.githubData} />
*/

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572a5",
  Rust: "#dea584", Go: "#00add8", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c",
  Vue: "#41b883", Svelte: "#ff3e00", Ruby: "#701516", PHP: "#4f5d95",
  Swift: "#fa7343", Kotlin: "#7f52ff", Shell: "#89e051",
};

function StatCard({
  icon, label, value, color,
}: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="stat-card fu" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div className="stat-value" style={{ color }}>{value?.toLocaleString?.() ?? value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

interface RepoStatsProps {
  data: {
    meta: {
      name: string;
      fullName: string;
      description: string;
      stars: number;
      forks: number;
      watchers: number;
      openIssues: number;
      defaultBranch: string;
      createdAt: string;
      pushedAt: string;
      size: number;
      license: string;
      topics: string[];
      homepage?: string;
      visibility: string;
      isArchived?: boolean;
      isFork?: boolean;
      subscribers?: number;
    };
    languages: Record<string, string>;
    contributors: { login: string; avatar: string; contributions: number; url: string }[];
    recentCommits: { sha: string; message: string; author: string; date: string }[];
    releases: { name: string; tag: string; publishedAt: string; prerelease: boolean; body?: string }[];
    openIssues: { number: number; title: string; labels: string[]; createdAt: string; user: string; url: string }[];
    openPRs: { number: number; title: string; user: string; createdAt: string; url: string }[];
    branches: string[];
    weeklyCommits?: number[];
  };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtKB(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function RepoStats({ data }: RepoStatsProps) {
  const { meta, languages, contributors, recentCommits, releases, openIssues, openPRs, branches, weeklyCommits } = data;

  const langEntries = Object.entries(languages);
  const maxBar = Math.max(...(weeklyCommits || [1]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "16px 0" }}>

      {/* ── Stat grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <StatCard icon="⭐" label="Stars"    value={meta.stars}      color="var(--accent-l)" />
        <StatCard icon="🍴" label="Forks"    value={meta.forks}      color="var(--accent2-l)" />
        <StatCard icon="👁" label="Watchers" value={meta.watchers}   color="var(--blue-l)" />
        <StatCard icon="🐛" label="Issues"   value={meta.openIssues} color="var(--red-l)" />
      </div>

      {/* ── Meta row: license, visibility, size, created ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {meta.license !== "None" && <span className="tag tag-green">⚖️ {meta.license}</span>}
        <span className={`tag ${meta.visibility === "public" ? "tag-blue" : "tag-amber"}`}>
          {meta.visibility === "public" ? "🌐 Public" : "🔒 Private"}
        </span>
        {meta.isArchived && <span className="tag tag-amber">📦 Archived</span>}
        {meta.isFork && <span className="tag tag-gray">🍴 Fork</span>}
        <span className="tag tag-gray">💾 {fmtKB(meta.size)}</span>
        <span className="tag tag-gray">📅 Created {fmtDate(meta.createdAt)}</span>
        <span className="tag tag-gray">🕐 Pushed {fmtDate(meta.pushedAt)}</span>
      </div>

      {/* ── Topics ── */}
      {meta.topics?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {meta.topics.map((t) => (
            <span key={t} className="tag tag-purple">#{t}</span>
          ))}
        </div>
      )}

      {/* ── Language bar ── */}
      {langEntries.length > 0 && (
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Languages
          </div>
          <div className="lang-bar" style={{ marginBottom: 10 }}>
            {langEntries.map(([lang, pct]) => (
              <div
                key={lang}
                className="lang-bar-seg"
                title={`${lang}: ${pct}`}
                style={{
                  width: pct,
                  background: LANG_COLORS[lang] || "var(--muted)",
                  transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {langEntries.map(([lang, pct]) => (
              <span key={lang} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{
                  width: 9, height: 9, borderRadius: "50%",
                  background: LANG_COLORS[lang] || "var(--muted)",
                  display: "inline-block", flexShrink: 0,
                }} />
                <span style={{ color: "var(--text-s)" }}>{lang}</span>
                <span style={{ color: "var(--muted)" }}>{pct}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Commit activity sparkline ── */}
      {weeklyCommits && weeklyCommits.length > 0 && (
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Commit Activity (last 12 weeks)
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
            {weeklyCommits.map((count, i) => (
              <div
                key={i}
                title={`${count} commits`}
                style={{
                  flex: 1,
                  height: maxBar > 0 ? `${Math.max((count / maxBar) * 100, 4)}%` : "4%",
                  background: count > 0
                    ? `linear-gradient(to top, var(--brand), var(--accent2))`
                    : "var(--border)",
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.6s cubic-bezier(0.16,1,0.3,1)",
                  transitionDelay: `${i * 30}ms`,
                  opacity: count > 0 ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Recent commits ── */}
      {recentCommits.length > 0 && (
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Recent Commits
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {recentCommits.map((c, i) => (
              <div
                key={i}
                className="fu"
                style={{
                  animationDelay: `${i * 0.04}s`,
                  display: "flex", gap: 10, alignItems: "center",
                  padding: "7px 0",
                  borderBottom: i < recentCommits.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span className="tag tag-gray" style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", flexShrink: 0 }}>
                  {c.sha}
                </span>
                <span style={{ fontSize: 12, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.message}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{c.author}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Contributors ── */}
      {contributors.length > 0 && (
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Contributors
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {contributors.map((c, i) => (
              <a
                key={i}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                title={`${c.login} — ${c.contributions} commits`}
                style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
              >
                <img
                  src={c.avatar}
                  alt={c.login}
                  className="contributor-avatar"
                />
                <span style={{ fontSize: 10, color: "var(--muted2)", maxWidth: 44, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.login}
                </span>
                <span style={{ fontSize: 9, color: "var(--muted)" }}>{c.contributions}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Branches + Open PRs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Branches */}
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            🌿 Branches
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {branches.slice(0, 8).map((b, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 12, fontFamily: "'Geist Mono', monospace",
                color: b === meta.defaultBranch ? "var(--brand-l)" : "var(--muted2)",
                padding: "3px 0",
              }}>
                <span style={{ fontSize: 10 }}>⎇</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b}</span>
                {b === meta.defaultBranch && (
                  <span className="tag tag-green" style={{ fontSize: 9, padding: "1px 6px" }}>default</span>
                )}
              </div>
            ))}
            {branches.length > 8 && (
              <span style={{ fontSize: 11, color: "var(--muted)", paddingTop: 2 }}>+{branches.length - 8} more</span>
            )}
          </div>
        </div>

        {/* Open PRs */}
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            🔀 Open PRs
          </div>
          {openPRs.length === 0 ? (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>No open pull requests</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {openPRs.slice(0, 5).map((pr, i) => (
                <a
                  key={i}
                  href={pr.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", display: "flex", gap: 7, alignItems: "center", fontSize: 12 }}
                >
                  <span className="tag tag-purple" style={{ fontSize: 10 }}>#{pr.number}</span>
                  <span style={{ color: "var(--text-s)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {pr.title}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Open Issues ── */}
      {openIssues.length > 0 && (
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            🐛 Open Issues
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {openIssues.map((issue, i) => (
              <a
                key={i}
                href={issue.url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none", display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0", borderBottom: i < openIssues.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <span className="tag tag-red" style={{ fontSize: 10, flexShrink: 0 }}>#{issue.number}</span>
                <span style={{ flex: 1, fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {issue.title}
                </span>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {issue.labels?.slice(0, 2).map((l, j) => (
                    <span key={j} className="tag tag-amber" style={{ fontSize: 9, padding: "1px 5px" }}>{l}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Releases ── */}
      {releases.length > 0 && (
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            🚀 Releases
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {releases.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "5px 0", borderBottom: i < releases.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span className="tag tag-green" style={{ fontSize: 10, flexShrink: 0 }}>{r.tag}</span>
                <span style={{ flex: 1, fontSize: 12, color: "var(--text)" }}>{r.name}</span>
                {r.prerelease && <span className="tag tag-amber" style={{ fontSize: 9 }}>pre</span>}
                <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{fmtDate(r.publishedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
