import React, { useState } from 'react';
import { ChecklistItem } from '../types';

interface Props { items: ChecklistItem[]; }

const CAT = { setup: { label: '🛠 Setup', color: 'var(--accent)' }, explore: { label: '🔍 Explore', color: 'var(--accent2)' }, understand: { label: '🧠 Understand', color: 'var(--green)' } };

export default function OnboardingChecklist({ items }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set(items.filter(i => i.done).map(i => i.id)));

  const toggle = (id: string) =>
    setChecked(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const pct = Math.round((checked.size / items.length) * 100);

  return (
    <div className="card fu" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>✓</span>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Onboarding Checklist</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{checked.size}/{items.length}</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: pct === 100 ? 'var(--green)' : 'var(--text)' }}>{pct}%</div>
        </div>
      </div>

      <div className="progress" style={{ marginBottom: 20, height: 5 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
      </div>

      {pct === 100 && (
        <div className="fi" style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', fontSize: 13, color: 'var(--green)', textAlign: 'center' }}>
          🎉 Onboarding complete! You&apos;re ready to contribute.
        </div>
      )}

      {(['setup', 'explore', 'understand'] as const).map(cat => {
        const catItems = items.filter(i => i.category === cat);
        if (!catItems.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: CAT[cat].color, marginBottom: 10 }}>
              {CAT[cat].label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {catItems.map(item => {
                const done = checked.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 13px', borderRadius: 10, cursor: 'pointer',
                      background: done ? 'rgba(52,211,153,0.06)' : 'var(--card)',
                      border: `1px solid ${done ? 'rgba(52,211,153,0.2)' : 'var(--border)'}`,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={e => { if (!done) e.currentTarget.style.borderColor = 'var(--border-h)'; }}
                    onMouseOut={e => { if (!done) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0, transition: 'all 0.2s',
                      background: done ? 'var(--green)' : 'transparent',
                      border: `1.5px solid ${done ? 'var(--green)' : 'var(--border-h)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11,
                    }}>
                      {done && '✓'}
                    </div>
                    <span style={{ fontSize: 13, color: done ? 'var(--muted)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
