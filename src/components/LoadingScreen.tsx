import React from 'react';

interface Props {
  step: string;
  progress: number;
  repo: string;
}

const STEPS = [
  { label: 'Connecting to GitHub',    icon: '⟁' },
  { label: 'Loading file tree',       icon: '◈' },
  { label: 'Selecting key files',     icon: '⚡' },
  { label: 'Reading source code',     icon: '◎' },
  { label: 'Analyzing with GPT-4o',   icon: '✦' },
  { label: 'Building dashboard',      icon: '✓' },
];

export default function LoadingScreen({ step, progress, repo }: Props) {
  const activeIdx = Math.min(Math.floor((progress / 100) * STEPS.length), STEPS.length - 1);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative', zIndex: 1,
    }}>

      {/* Logo */}
      <div className="logo-mark fsd" style={{ marginBottom: 48, fontSize: 20 }}>
        <div className="logo-icon" style={{ width: 36, height: 36, fontSize: 18 }}>⚡</div>
        <span>RepoXray</span>
      </div>

      {/* Pulsing orb */}
      <div className="loading-orb fsi" style={{ marginBottom: 36 }}>⚡</div>

      {/* Repo label */}
      <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 14, color: 'var(--brand-l)', marginBottom: 10, letterSpacing: '0.02em' }}>
        {repo}
      </div>

      {/* Step text */}
      <div style={{ fontSize: 15, color: 'var(--text-s)', marginBottom: 32, minHeight: 24 }}>
        {step}
      </div>

      {/* Progress bar */}
      <div className="progress" style={{ width: 360, marginBottom: 40 }}>
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--brand), var(--blue))',
            boxShadow: '0 0 12px rgba(16,185,129,0.4)',
          }}
        />
      </div>

      {/* Step list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 300 }}>
        {STEPS.map((s, i) => {
          const done    = i < activeIdx;
          const active  = i === activeIdx;
          const pending = i > activeIdx;
          return (
            <div
              key={s.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 14px', borderRadius: 10,
                background: active ? 'rgba(16,185,129,0.08)' : pending ? 'transparent' : 'transparent',
                border: active ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                opacity: pending ? 0.3 : 1,
              }}
            >
              {/* Icon */}
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: done ? 11 : 14,
                background: done ? 'var(--brand)' : active ? 'rgba(16,185,129,0.15)' : 'var(--card-h)',
                border: done ? 'none' : active ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border)',
                color: done ? 'white' : active ? 'var(--brand)' : 'var(--muted)',
                fontWeight: done ? 700 : 400,
              }}>
                {done ? '✓' : active ? <div className="spin" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> : s.icon}
              </div>
              <span style={{
                fontSize: 13, fontFamily: 'Geist Mono, monospace',
                color: done ? 'var(--muted2)' : active ? 'var(--text)' : 'var(--muted)',
                fontWeight: active ? 500 : 400,
              }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 48, fontSize: 11, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {Math.round(progress)}% complete
      </p>
    </div>
  );
}
