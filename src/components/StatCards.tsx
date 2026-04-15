import React from 'react';
import { RepoInfo, RepoFile, ClaudeAnalysis } from '../types';
import { complexityLabel } from '../utils/helpers';

interface Props { repoInfo: RepoInfo; files: RepoFile[]; analysis: ClaudeAnalysis; complexity: number; }

export default function StatCards({ repoInfo, files, analysis, complexity }: Props) {
  const { color } = complexityLabel(complexity);
  const avgLines = files.length ? Math.round(files.reduce((s, f) => s + f.lines, 0) / files.length) : 0;

  const stats = [
    { icon: '📁', label: 'Files Analyzed', value: files.length.toString(), color: 'var(--accent)' },
    { icon: '🔗', label: 'Entry Points',   value: analysis.entryPoints.length.toString(), color: 'var(--accent2)' },
    { icon: '⭐', label: 'Stars',          value: repoInfo.stars.toLocaleString(), color: 'var(--amber)' },
    { icon: '⚡', label: 'Complexity',     value: `${complexity}/10`, color },
    { icon: '⚠',  label: 'Gotchas',        value: analysis.gotchas.length.toString(), color: analysis.gotchas.length > 0 ? 'var(--red)' : 'var(--green)' },
    { icon: '≈',  label: 'Avg File Lines', value: avgLines.toString(), color: 'var(--muted2)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
      {stats.map(s => (
        <div
          key={s.label}
          className="card"
          style={{ padding: '16px 18px', cursor: 'default', transition: 'all 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--card-h)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--card)'; }}
        >
          <div style={{ fontSize: 14, marginBottom: 8 }}>{s.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.5px', lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 5 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
