import React, { useState } from 'react';
import { ClaudeAnalysis } from '../../types';

// ─── Entry Points ─────────────────────────────────────────────────────────────
export function EntryPointsList({ analysis, onFileClick }: { analysis: ClaudeAnalysis; onFileClick: (f: string) => void }) {
  return (
    <div className="card fu d2" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(129,140,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>◈</div>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Entry Points</h3>
        <span className="tag tag-blue" style={{ marginLeft: 'auto', fontSize: 10 }}>{analysis.entryPoints.length} files</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {analysis.entryPoints.map((ep, i) => (
          <div
            key={ep.file}
            onClick={() => onFileClick(ep.file)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px', borderRadius: 10,
              background: 'var(--card-h)', border: '1px solid var(--border)',
              cursor: 'pointer', transition: 'border-color 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(129,140,248,0.15)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {ep.priority}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, color: 'var(--accent)', marginBottom: 4, wordBreak: 'break-all' }}>{ep.file}</div>
              <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.55 }}>{ep.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Critical Files ───────────────────────────────────────────────────────────
export function CriticalFilesPanel({ analysis, onFileClick }: { analysis: ClaudeAnalysis; onFileClick: (f: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="card fu d3" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>★</div>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Critical Files</h3>
        <span className="tag tag-amber" style={{ marginLeft: 'auto', fontSize: 10 }}>{analysis.criticalFiles.length} files</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {analysis.criticalFiles.map(cf => {
          const open = expanded === cf.file;
          return (
            <div key={cf.file} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--border-h)')}
              onMouseOut={e => !open && (e.currentTarget.style.borderColor = 'var(--border)')}>
              <button
                onClick={() => setExpanded(open ? null : cf.file)}
                style={{ width: '100%', padding: '11px 14px', background: 'var(--card-h)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}
              >
                <span style={{ color: open ? 'var(--amber)' : 'var(--muted)', fontSize: 11, transition: 'color 0.2s' }}>▶</span>
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, color: open ? 'var(--amber)' : 'var(--muted2)', flex: 1, wordBreak: 'break-all' }}>{cf.file}</span>
                <button
                  onClick={e => { e.stopPropagation(); onFileClick(cf.file); }}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >View</button>
              </button>
              {open && (
                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, marginBottom: cf.keyPatterns?.length ? 10 : 0 }}>{cf.explanation}</p>
                  {cf.keyPatterns?.length && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {cf.keyPatterns.map(p => <span key={p} className="tag tag-gray" style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10 }}>{p}</span>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gotchas ──────────────────────────────────────────────────────────────────
const SEV = { low: { cls: 'tag-green', icon: '○', color: 'var(--green)' }, medium: { cls: 'tag-amber', icon: '△', color: 'var(--amber)' }, high: { cls: 'tag-red', icon: '⚠', color: 'var(--red)' } };

export function GotchasList({ analysis }: { analysis: ClaudeAnalysis }) {
  return (
    <div className="card fu d4" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚠</div>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Gotchas</h3>
        <span className="tag tag-red" style={{ marginLeft: 'auto', fontSize: 10 }}>{analysis.gotchas.length} warnings</span>
      </div>
      {analysis.gotchas.length === 0 ? (
        <div style={{ color: 'var(--green)', fontSize: 13, display: 'flex', gap: 8 }}>✓ No major gotchas found!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {analysis.gotchas.map((g, i) => {
            const s = SEV[g.severity] || SEV.medium;
            return (
              <div key={i} style={{ padding: '13px 14px', borderRadius: 10, background: 'var(--card-h)', border: `1px solid ${s.color}22`, borderLeft: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{g.title}</span>
                  <span className={`tag ${s.cls}`} style={{ marginLeft: 'auto', fontSize: 10, textTransform: 'capitalize' }}>{g.severity}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.65 }}>{g.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Reading Order Timeline ───────────────────────────────────────────────────
export function ReadingOrderTimeline({ analysis, onFileClick }: { analysis: ClaudeAnalysis; onFileClick: (f: string) => void }) {
  return (
    <div className="card fu d5" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>→</div>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Recommended Reading Order</h3>
      </div>
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: 13, top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {analysis.readingOrder.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Step number dot */}
              <div style={{ width: 27, height: 27, borderRadius: '50%', background: 'var(--bg-s, #0d0f1a)', border: '1.5px solid var(--green)', color: 'var(--green)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                {step.order}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingBottom: i < analysis.readingOrder.length - 1 ? 4 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onFileClick(step.file)}
                    style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', wordBreak: 'break-all' }}
                  >{step.file}</button>
                  <span className="tag tag-gray" style={{ fontSize: 10 }}>⏱ {step.timeEstimate}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.6 }}>{step.why}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
