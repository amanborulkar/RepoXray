import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onAnalyze: (input: string) => void;
  error: string | null;
}

const DEMOS = ['facebook/react', 'vercel/next.js', 'tiangolo/fastapi', 'microsoft/typescript', 'golang/go'];

const FEATURES = [
  { icon: '⟁', label: 'Dependency Graph', color: 'var(--brand)' },
  { icon: '◈', label: 'AI Architecture',  color: 'var(--blue-l)' },
  { icon: '⚡', label: 'Live Q&A Chat',    color: 'var(--accent-l)' },
  { icon: '✓', label: 'Onboarding Guide', color: '#a78bfa' },
];

/* Compact repo cards — replaces the big opengraph image cards */
const POPULAR_REPOS = [
  { repo: 'facebook/react',       stars: '224k', lang: 'JavaScript', color: '#f7df1e', desc: 'UI library' },
  { repo: 'vercel/next.js',       stars: '122k', lang: 'TypeScript',  color: '#3178c6', desc: 'React framework' },
  { repo: 'tiangolo/fastapi',     stars: '76k',  lang: 'Python',      color: '#3572A5', desc: 'Fast API framework' },
  { repo: 'microsoft/typescript', stars: '100k', lang: 'TypeScript',  color: '#3178c6', desc: 'Typed JavaScript' },
  { repo: 'golang/go',            stars: '124k', lang: 'Go',          color: '#00add8', desc: 'Systems language' },
  { repo: 'rust-lang/rust',       stars: '97k',  lang: 'Rust',        color: '#dea584', desc: 'Memory-safe lang' },
];

export default function Hero({ onAnalyze, error }: Props) {
  const [input, setInput] = useState('');
  const [hoveredRepo, setHoveredRepo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const r = new URLSearchParams(window.location.search).get('repo');
    if (r) { setInput(r); onAnalyze(r); }
  }, []);

  const submit = () => { if (input.trim()) onAnalyze(input.trim()); };
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') submit(); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>

      {/* Scanline effect */}
      <div className="hero-scanline" />

      {/* Nav */}
      <nav style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', borderBottom: '1px solid var(--border)',
        background: 'rgba(8,8,9,0.75)', backdropFilter: 'blur(22px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div className="logo-mark">
          <div className="logo-icon">⚡</div>
          <span>RepoXray</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag tag-green" style={{ fontSize: 11, gap: 6 }}>
            <span className="pulse-dot" />
            GPT-4o
          </span>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="github-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 24px 40px' }}>

        {/* Badge */}
        <div className="fu tag tag-green" style={{ marginBottom: 24, fontSize: 11, gap: 7, padding: '5px 14px' }}>
          <span className="pulse-dot" />
          AI-Powered Codebase Intelligence
        </div>

        {/* Headline */}
        <h1 className="fu d1" style={{
          fontSize: 'clamp(2rem,5.2vw,3.8rem)', fontWeight: 700,
          letterSpacing: '-2px', textAlign: 'center', lineHeight: 1.06,
          marginBottom: 18, maxWidth: 720,
        }}>
          X-Ray any <span className="grad">GitHub repo</span><br />in seconds
        </h1>

        {/* Subtitle */}
        <p className="fu d2" style={{ fontSize: 15, color: 'var(--muted2)', textAlign: 'center', maxWidth: 460, lineHeight: 1.8, marginBottom: 40 }}>
          Paste a GitHub URL. Get dependency graphs, AI architecture analysis,
          gotcha warnings, and a live Q&A — instantly.
        </p>

        {/* Search bar */}
        <div className="fu d3" style={{ position: 'relative', width: '100%', maxWidth: 660, marginBottom: 12 }}>
          {/* GitHub icon inside input */}
          <svg style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)', width: 19, height: 19, color: 'var(--muted)', pointerEvents: 'none' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <input
            ref={inputRef}
            className="search-bar"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="github.com/facebook/react  or  facebook/react"
          />
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={!input.trim()}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '10px 20px', fontSize: 13, borderRadius: 11 }}
          >
            Analyze
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="fi" style={{ color: 'var(--red-l)', fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Try chips */}
        <div className="fu d4" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginBottom: 44 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center', marginRight: 2, fontFamily: 'Geist Mono,monospace' }}>Try:</span>
          {DEMOS.map(d => (
            <button key={d} className="chip" onClick={() => { setInput(d); onAnalyze(d); }}>{d}</button>
          ))}
        </div>

        {/* Feature pills */}
        <div className="fu d5" style={{ display: 'flex', gap: 9, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 52 }}>
          {FEATURES.map(f => (
            <div key={f.label} className="feature-pill">
              <span style={{ color: f.color, fontSize: 15 }}>{f.icon}</span>
              <span style={{ fontSize: 13 }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* ── Compact interactive repo cards (replaces big image cards) ── */}
        <div className="fu d6" style={{ width: '100%', maxWidth: 860 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'Geist Mono,monospace' }}>
            Click any repo to analyze it
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {POPULAR_REPOS.map((p, i) => (
              <div
                key={p.repo}
                className="repo-card"
                onClick={() => { setInput(p.repo); onAnalyze(p.repo); }}
                onMouseEnter={() => setHoveredRepo(p.repo)}
                onMouseLeave={() => setHoveredRepo(null)}
                style={{ animationDelay: `${0.5 + i * 0.07}s` }}
              >
                {/* Repo name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--muted)" style={{ flexShrink: 0 }}>
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11.5, fontWeight: 600, color: hoveredRepo === p.repo ? 'var(--brand-l)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
                    {p.repo}
                  </span>
                </div>

                {/* Desc */}
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{p.desc}</div>

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--muted)' }}>
                    <span style={{ color: '#f5c842' }}>★</span>{p.stars}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block', boxShadow: `0 0 5px ${p.color}80` }} />
                    {p.lang}
                  </span>
                  {hoveredRepo === p.repo && (
                    <span className="fi" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--brand-l)', fontFamily: 'Geist Mono, monospace' }}>
                      analyze →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fu d7" style={{ marginTop: 52, fontSize: 11, color: 'var(--muted)', fontFamily: 'Geist Mono,monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          3 weeks of ramp-up → 60 seconds with RepoXray
        </div>
      </div>
    </div>
  );
}
