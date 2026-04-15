import React, { useEffect, useRef } from 'react';
import { RepoFile } from '../types';

interface Props {
  file: RepoFile | null;
  onClose: () => void;
  onAskAbout: (file: RepoFile) => void;
}

function langColor(lang: string): string {
  const map: Record<string, string> = {
    TypeScript: 'var(--accent)', JavaScript: 'var(--amber)', Python: 'var(--green)',
    Go: 'var(--accent2)', Rust: 'var(--red)', Markdown: 'var(--muted2)',
  };
  return map[lang] || 'var(--muted2)';
}

export default function FileDrawer({ file, onClose, onAskAbout }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (file && drawerRef.current) drawerRef.current.scrollTop = 0;
  }, [file]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          opacity: file ? 1 : 0, pointerEvents: file ? 'all' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 90,
          width: 'min(680px, 95vw)',
          background: '#0b0d18',
          borderLeft: '1px solid var(--border)',
          transform: file ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {file && (
          <>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 13, wordBreak: 'break-all', marginBottom: 4 }}>{file.path}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="tag tag-gray" style={{ fontSize: 10, color: langColor(file.language) }}>{file.language}</span>
                  <span className="tag tag-gray" style={{ fontSize: 10 }}>{file.lines} lines</span>
                  <span className="tag tag-gray" style={{ fontSize: 10 }}>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => onAskAbout(file)}>
                  💬 Ask about this
                </button>
                <button className="btn btn-ghost btn-sm" onClick={onClose}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Code */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 0' }}>
              <pre style={{
                fontFamily: 'Geist Mono, monospace', fontSize: 12, lineHeight: 1.7,
                color: 'var(--muted2)', tabSize: 2, margin: 0,
              }}>
                {file.content.split('\n').map((line, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', gap: 0 }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ width: 44, padding: '0 12px', color: 'var(--muted)', fontSize: 11, textAlign: 'right', flexShrink: 0, userSelect: 'none', borderRight: '1px solid var(--border)' }}>
                      {i + 1}
                    </span>
                    <span style={{ padding: '0 16px', flex: 1 }}>{line || ' '}</span>
                  </div>
                ))}
              </pre>
            </div>
          </>
        )}
      </div>
    </>
  );
}
