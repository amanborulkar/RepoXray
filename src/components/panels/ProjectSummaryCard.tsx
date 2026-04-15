import React from 'react';
import { RepoInfo, ClaudeAnalysis } from '../../types';
import { complexityLabel } from '../../utils/helpers';

interface Props { repoInfo: RepoInfo; analysis: ClaudeAnalysis; complexity: number; }

export default function ProjectSummaryCard({ repoInfo, analysis, complexity }: Props) {
  const { label, color, bg } = complexityLabel(complexity);

  return (
    <div className="card fu" style={{ padding: '22px 24px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'Geist Mono, monospace', fontSize: 16, fontWeight: 600 }}>{repoInfo.fullName}</h2>
            <span className="tag tag-blue">{repoInfo.language}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.65 }}>{repoInfo.description}</p>
        </div>
        {/* Complexity badge */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{complexity}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>/10</div>
          <div className="tag" style={{ background: bg, color, fontSize: 10 }}>{label}</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { icon: '⭐', label: repoInfo.stars.toLocaleString() + ' stars' },
          { icon: '🍴', label: repoInfo.forks.toLocaleString() + ' forks' },
          { icon: '📁', label: repoInfo.topics.length + ' topics' },
        ].map(s => (
          <div key={s.label} style={{ fontSize: 12, color: 'var(--muted2)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>{s.icon}</span>{s.label}
          </div>
        ))}
        {repoInfo.homepage && (
          <a href={repoInfo.homepage} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            🌐 Homepage
          </a>
        )}
      </div>

      {/* Summary */}
      <p style={{ fontSize: 14, color: 'var(--muted2)', lineHeight: 1.75, marginBottom: 16, borderLeft: '3px solid var(--accent)', paddingLeft: 14 }}>
        {analysis.summary}
      </p>

      {/* Tech stack */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {analysis.techStack.map(t => (
          <span key={t} className="tag tag-gray">{t}</span>
        ))}
      </div>

      {/* Topics */}
      {repoInfo.topics.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {repoInfo.topics.map(t => (
            <span key={t} className="tag tag-blue" style={{ fontSize: 10 }}>#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
