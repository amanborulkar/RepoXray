import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onAnalyze: (input: string) => void;
  error: string | null;
}

const DEMOS = ['facebook/react', 'vercel/next.js', 'tiangolo/fastapi', 'microsoft/typescript', 'golang/go'];

const FEATURES = [
  { icon: '◈', label: 'Dependency Graph', color: 'var(--brand)' },
  { icon: '⟁', label: 'AI Architecture',  color: 'var(--blue-l)' },
  { icon: '⚡', label: 'Live Q&A Chat',    color: 'var(--accent-l)' },
  { icon: '✓', label: 'Onboarding Guide', color: '#a78bfa' },
];

const POPULAR_REPOS = [
  { repo: 'facebook/react',       stars: '224k', lang: 'JavaScript', color: '#f7df1e', desc: 'UI library' },
  { repo: 'vercel/next.js',       stars: '122k', lang: 'TypeScript',  color: '#3178c6', desc: 'React framework' },
  { repo: 'tiangolo/fastapi',     stars: '76k',  lang: 'Python',      color: '#3572A5', desc: 'Fast API framework' },
  { repo: 'microsoft/typescript', stars: '100k', lang: 'TypeScript',  color: '#3178c6', desc: 'Typed JavaScript' },
  { repo: 'golang/go',            stars: '124k', lang: 'Go',          color: '#00add8', desc: 'Systems language' },
  { repo: 'rust-lang/rust',       stars: '97k',  lang: 'Rust',        color: '#dea584', desc: 'Memory-safe lang' },
];

function XRayLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="55%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
        <filter id="gf1"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" stroke="url(#lg1)" strokeWidth="1" fill="rgba(16,185,129,0.06)"/>
      <circle cx="16" cy="13.5" r="5.5" fill="url(#lg1)" filter="url(#gf1)" opacity="0.9"/>
      <path d="M12 9.8 L10.2 7.2 L13.2 9.2" fill="url(#lg1)"/>
      <path d="M20 9.8 L21.8 7.2 L18.8 9.2" fill="url(#lg1)"/>
      <path d="M11.8 19 Q8.5 21.5 7.5 23.5" stroke="url(#lg1)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M16 19.5 L16 24" stroke="url(#lg1)" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M20.2 19 Q23.5 21.5 24.5 23.5" stroke="url(#lg1)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <line x1="10.8" y1="12.5" x2="21.2" y2="12.5" stroke="#10b981" strokeWidth="0.9" opacity="0.8"/>
      <line x1="10.5" y1="14.5" x2="21.5" y2="14.5" stroke="#3b82f6" strokeWidth="0.7" opacity="0.5"/>
      <circle cx="16" cy="13.5" r="2.2" fill="rgba(16,185,129,0.3)"/>
      <circle cx="16" cy="13.5" r="1.1" fill="white" opacity="0.95"/>
      <circle cx="4" cy="9" r="1.2" fill="#10b981" opacity="0.6"/>
      <circle cx="28" cy="9" r="1.2" fill="#3b82f6" opacity="0.6"/>
      <circle cx="16" cy="30" r="1.2" fill="#8b5cf6" opacity="0.6"/>
    </svg>
  );
}

export default function Hero({ onAnalyze, error }: Props) {
  const [input, setInput] = useState('');
  const [hoveredRepo, setHoveredRepo] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
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
      <div className="hero-scanline" />

      <nav style={{
        height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', borderBottom: '1px solid var(--border)',
        background: 'rgba(8,8,9,0.82)', backdropFilter: 'blur(24px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.12))',
            border: '1px solid rgba(16,185,129,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 22px rgba(16,185,129,0.2)',
          }}>
            <XRayLogo size={22} />
          </div>
          <span style={{ color: '#ebebec' }}>Repo<span className="grad">Xray</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag tag-green" style={{ fontSize: 11, gap: 6 }}>
            <span className="pulse-dot" />
            GPT-4o Powered
          </span>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="github-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 24px 40px' }}>

        <div className="fu tag tag-green" style={{ marginBottom: 24, fontSize: 11, gap: 7, padding: '5px 14px' }}>
          <span className="pulse-dot" />
          AI-Powered Codebase Intelligence
        </div>

        <h1 className="fu d1" style={{
          fontSize: 'clamp(2rem,5.2vw,3.8rem)', fontWeight: 700,
          letterSpacing: '-2px', textAlign: 'center', lineHeight: 1.06,
          marginBottom: 18, maxWidth: 720, color: '#ebebec',
        }}>
          X-Ray any <span className="grad">GitHub repo</span><br />in seconds
        </h1>

        <p className="fu d2" style={{ fontSize: 15, color: 'var(--muted2)', textAlign: 'center', maxWidth: 460, lineHeight: 1.8, marginBottom: 40 }}>
          Paste a GitHub URL. Get dependency graphs, AI architecture analysis,
          gotcha warnings, and a live Q&A — instantly.
        </p>

        {/* SEARCH BAR — fully fixed */}
        <div className="fu d3" style={{ position: 'relative', width: '100%', maxWidth: 660, marginBottom: 12 }}>
          <svg style={{
            position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)',
            width: 19, height: 19, pointerEvents: 'none', zIndex: 2,
            color: focused ? '#34d399' : '#666672', transition: 'color 0.25s',
          }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="github.com/facebook/react  or  facebook/react"
            autoComplete="off"
            spellCheck={false}
            style={{
              display: 'block',
              width: '100%',
              padding: '17px 148px 17px 52px',
              background: focused ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${focused ? '#10b981' : 'rgba(255,255,255,0.13)'}`,
              borderRadius: 16,
              color: '#ebebec',
              caretColor: '#10b981',
              fontSize: 15,
              fontFamily: '"Geist Mono", "Fira Code", monospace',
              letterSpacing: '0.01em',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
              boxShadow: focused
                ? '0 0 0 4px rgba(16,185,129,0.10), 0 0 40px rgba(16,185,129,0.10)'
                : 'none',
              position: 'relative',
              zIndex: 1,
            }}
          />

          <button
            onClick={submit}
            disabled={!input.trim()}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              padding: '10px 20px', fontSize: 13, borderRadius: 11, zIndex: 2,
              background: input.trim()
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'rgba(255,255,255,0.06)',
              color: input.trim() ? '#fff' : '#666672',
              border: input.trim() ? 'none' : '1px solid rgba(255,255,255,0.07)',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              fontFamily: '"Geist", sans-serif',
              fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: input.trim() ? '0 0 20px rgba(16,185,129,0.3)' : 'none',
            }}
          >
            Analyze
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="fi" style={{ color: '#f87171', fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <div className="fu d4" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginBottom: 44 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center', marginRight: 2, fontFamily: 'Geist Mono,monospace' }}>Try:</span>
          {DEMOS.map(d => (
            <button key={d} className="chip" onClick={() => { setInput(d); onAnalyze(d); }}>{d}</button>
          ))}
        </div>

        <div className="fu d5" style={{ display: 'flex', gap: 9, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 52 }}>
          {FEATURES.map(f => (
            <div key={f.label} className="feature-pill">
              <span style={{ color: f.color, fontSize: 15 }}>{f.icon}</span>
              <span style={{ fontSize: 13 }}>{f.label}</span>
            </div>
          ))}
        </div>

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--muted)" style={{ flexShrink: 0 }}>
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11.5, fontWeight: 600, color: hoveredRepo === p.repo ? '#34d399' : '#ebebec', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
                    {p.repo}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{p.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--muted)' }}>
                    <span style={{ color: '#f5c842' }}>★</span>{p.stars}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block', boxShadow: `0 0 5px ${p.color}80` }} />
                    {p.lang}
                  </span>
                  {hoveredRepo === p.repo && (
                    <span className="fi" style={{ marginLeft: 'auto', fontSize: 10, color: '#34d399', fontFamily: 'Geist Mono, monospace' }}>
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
