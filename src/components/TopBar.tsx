import React, { useState, useContext } from 'react';
import { RepoInfo, ClaudeAnalysis, RepoFile } from '../types';
import { exportToMarkdown, buildShareUrl } from '../utils/helpers';
import ThemeToggle from './ThemeToggle';

interface Props {
  repoInfo: RepoInfo;
  analysis: ClaudeAnalysis;
  files: RepoFile[];
  onBack: () => void;
}

// Particle mode context — App.tsx exposes this via window for TopBar access
declare global { interface Window { __particleSetMode?: (m: string) => void; } }

const PARTICLE_MODES = [
  { id: 'neural', label: '⬡ Neural', title: 'Neural network mode' },
  { id: 'galaxy', label: '✦ Galaxy', title: 'Galaxy spiral mode' },
  { id: 'flow',   label: '〰 Flow',  title: 'Fluid flow mode'   },
];

export default function TopBar({ repoInfo, analysis, files, onBack }: Props) {
  const [copied, setCopied] = useState(false);
  const [particleMode, setParticleMode] = useState('neural');

  const copy = async () => {
    await navigator.clipboard.writeText(buildShareUrl(repoInfo.owner, repoInfo.repo));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const switchParticle = (mode: string) => {
    setParticleMode(mode);
    // Communicate to App-level hook via custom event
    window.dispatchEvent(new CustomEvent('particle-mode', { detail: mode }));
  };

  return (
    <div className="topbar fi">
      {/* Logo + Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="logo-mark" style={{ fontSize: 15 }}>
          <div className="logo-icon" style={{ width: 26, height: 26, fontSize: 13 }}>⚡</div>
          <span>RepoXray</span>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          New
        </button>
      </div>

      {/* Repo info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', minWidth: 0 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--muted2)">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23A11.52 11.52 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.646 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
        </svg>
        <a
          href={`https://github.com/${repoInfo.fullName}`}
          target="_blank" rel="noreferrer"
          style={{ fontFamily: 'Geist Mono, monospace', fontSize: 13, color: 'var(--text)', textDecoration: 'none' }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--brand-l)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text)')}
        >
          {repoInfo.owner}/<strong>{repoInfo.repo}</strong>
        </a>
        <span className="tag tag-blue" style={{ fontSize: 10 }}>{repoInfo.language}</span>
        <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ color: '#f5c842' }}>★</span> {repoInfo.stars.toLocaleString()}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* Particle Mode Switcher */}
        <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '3px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {PARTICLE_MODES.map(m => (
            <button
              key={m.id}
              title={m.title}
              onClick={() => switchParticle(m.id)}
              style={{
                padding: '3px 9px', borderRadius: 6, fontSize: 10, cursor: 'pointer', border: 'none',
                background: particleMode === m.id ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: particleMode === m.id ? '#34d399' : 'var(--muted)',
                fontFamily: 'Geist Mono, monospace',
                transition: 'all 0.18s',
                boxShadow: particleMode === m.id ? '0 0 8px rgba(16,185,129,0.2)' : 'none',
              }}
            >{m.label}</button>
          ))}
        </div>

        <ThemeToggle />

        <button className="btn btn-ghost btn-sm" onClick={copy}>
          {copied
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share</>
          }
        </button>

        <button className="btn btn-ghost btn-sm" onClick={() => exportToMarkdown(repoInfo, analysis, files)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>

        <a href={`https://github.com/${repoInfo.fullName}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  );
}
