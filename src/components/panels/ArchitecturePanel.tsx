import React from 'react';
import { ClaudeAnalysis } from '../../types';

interface Props { analysis: ClaudeAnalysis; }

export default function ArchitecturePanel({ analysis }: Props) {
  return (
    <div className="card fu d1" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,211,238,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⟁</div>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Architecture Overview</h3>
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.75, marginBottom: 16 }}>
        {analysis.architecture}
      </p>

      {analysis.architectureKeywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {analysis.architectureKeywords.map(k => (
            <span key={k} className="tag" style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--accent2)', fontSize: 11 }}>{k}</span>
          ))}
        </div>
      )}
    </div>
  );
}
