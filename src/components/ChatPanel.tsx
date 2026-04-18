import React, { useEffect, useRef, useState, useCallback } from 'react';
import TypingIndicator from './TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatMessage } from '../types';

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  streamingText: string;
  error: string | null;
  onSend: (q: string) => void;
  onClear: () => void;
  ready: boolean;
  starterQuestions: string[];
}

/* ── 6 clean, short questions — no difficulty levels ── */
const DEMO_QUESTIONS = [
  { q: "What does this codebase do?",        icon: '🔍' },
  { q: "Where should I start reading?",      icon: '📂' },
  { q: "What's the tech stack?",             icon: '🛠️' },
  { q: "Key design patterns used?",          icon: '🏗️' },
  { q: "Gotchas for new developers?",        icon: '⚠️' },
  { q: "How does data flow end-to-end?",     icon: '⚡' },
];

/* ── RepoXray AI avatar ── */
function AIAvatar() {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))',
      border: '1px solid rgba(16,185,129,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 16px rgba(16,185,129,0.15)',
    }}>
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="av1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="100%" stopColor="#3b82f6"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="13" r="6" fill="url(#av1)" opacity="0.9"/>
        <path d="M12 9.2 L10.2 7 L13.2 9" fill="url(#av1)"/>
        <path d="M20 9.2 L21.8 7 L18.8 9" fill="url(#av1)"/>
        <path d="M12 19 Q9 21 8 23" stroke="url(#av1)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M16 19.5 L16 23.5" stroke="url(#av1)" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M20 19 Q23 21 24 23" stroke="url(#av1)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <line x1="10.5" y1="12" x2="21.5" y2="12" stroke="#10b981" strokeWidth="1" opacity="0.8"/>
        <circle cx="16" cy="13" r="1.4" fill="white" opacity="0.95"/>
      </svg>
    </div>
  );
}

/* ── Typing indicator ── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ── Code block ── */
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ position: 'relative', marginTop: 10, marginBottom: 4, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px', background: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: 11, color: '#666672', fontFamily: 'Geist Mono,monospace' }}>{language || 'code'}</span>
        <button onClick={copy} style={{
          fontSize: 11, padding: '3px 10px', borderRadius: 6,
          background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)',
          border: copied ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
          color: copied ? '#34d399' : '#8f8f9c', cursor: 'pointer',
          transition: 'all 0.2s', fontFamily: 'Geist Mono,monospace',
        }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'javascript'}
        customStyle={{ margin: 0, borderRadius: 0, background: 'rgba(0,0,0,0.5)', fontSize: 13, padding: '14px' }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

/* ── Message bubble ── */
function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 20, justifyContent: isUser ? 'flex-end' : 'flex-start' }}
    >
      {!isUser && <AIAvatar />}
      <div style={{ maxWidth: '80%' }}>
        {!isUser && (
          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginBottom: 5, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.03em' }}>
            RepoXray AI
          </div>
        )}
        <div style={{
          padding: isUser ? '12px 16px' : '14px 18px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
          background: isUser
            ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
            : 'rgba(255,255,255,0.055)',
          border: isUser ? 'none' : '1px solid rgba(255,255,255,0.07)',
          fontSize: 14,
          lineHeight: 1.7,
          color: '#ebebec',
          letterSpacing: '0.01em',
          boxShadow: isUser
            ? '0 4px 20px rgba(16,185,129,0.25)'
            : '0 2px 12px rgba(0,0,0,0.2)',
        }}>
          {isUser ? (
            <span style={{ fontFamily: "'Geist', sans-serif", fontWeight: 500 }}>{msg.content}</span>
          ) : (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline) {
                    return <CodeBlock language={match?.[1] || ''} value={String(children).replace(/\n$/, '')} />;
                  }
                  return (
                    <code style={{
                      background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: 5, padding: '1px 6px', fontSize: '0.88em', color: '#34d399',
                      fontFamily: 'Geist Mono, monospace',
                    }} {...props}>{children}</code>
                  );
                },
                p({ children }: any) { return <p style={{ margin: '0 0 10px', lineHeight: 1.7, fontFamily: "'Geist', sans-serif" }}>{children}</p>; },
                ul({ children }: any) { return <ul style={{ margin: '6px 0', paddingLeft: 20, lineHeight: 1.8 }}>{children}</ul>; },
                ol({ children }: any) { return <ol style={{ margin: '6px 0', paddingLeft: 20, lineHeight: 1.8 }}>{children}</ol>; },
                li({ children }: any) { return <li style={{ margin: '4px 0', fontFamily: "'Geist', sans-serif" }}>{children}</li>; },
                strong({ children }: any) { return <strong style={{ color: '#ebebec', fontWeight: 600 }}>{children}</strong>; },
                h3({ children }: any) { return <h3 style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 8px', color: '#ebebec', letterSpacing: '-0.01em' }}>{children}</h3>; },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
        </div>
        {isUser && (
          <div style={{ fontSize: 10, color: '#4a4a56', textAlign: 'right', marginTop: 4, fontFamily: 'Geist Mono,monospace' }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'white',
          boxShadow: '0 0 16px rgba(59,130,246,0.25)',
        }}>U</div>
      )}
    </motion.div>
  );
}

/* ── Streaming bubble ── */
function StreamingBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 20 }}
    >
      <AIAvatar />
      <div style={{ maxWidth: '80%' }}>
        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginBottom: 5, fontFamily: 'Geist Mono,monospace' }}>
          RepoXray AI
        </div>
        <div style={{
          padding: '14px 18px', borderRadius: '4px 18px 18px 18px',
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(16,185,129,0.15)',
          fontSize: 14, lineHeight: 1.7, color: '#ebebec',
          boxShadow: '0 0 20px rgba(16,185,129,0.06)',
        }}>
          {text ? (
            <span style={{ whiteSpace: 'pre-wrap', fontFamily: "'Geist', sans-serif" }}>
              {text}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                style={{ color: '#10b981', fontWeight: 400 }}
              >▋</motion.span>
            </span>
          ) : (
            <TypingDots />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Single question chip — no difficulty color ── */
function DemoQButton({ q, icon, onSend }: { q: string; icon: string; onSend: (q: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSend(q)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
        background: hovered ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(16,185,129,0.28)' : 'rgba(255,255,255,0.07)'}`,
        textAlign: 'left', width: '100%',
        transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: hovered ? '0 4px 16px rgba(16,185,129,0.1)' : 'none',
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize: 13, color: hovered ? '#d4d4d8' : '#8f8f9c',
        lineHeight: 1.45, flex: 1,
        fontFamily: "'Geist', sans-serif",
        fontWeight: hovered ? 500 : 400,
        transition: 'color 0.15s, font-weight 0.15s',
        letterSpacing: '-0.01em',
      }}>{q}</span>
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="#10b981" strokeWidth="2.5"
        style={{ flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}
      >
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    </motion.button>
  );
}

/* ── Welcome state — clean grid, no difficulty labels ── */
function WelcomeState({ onSend }: { onSend: (q: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 50, height: 50, borderRadius: 14, margin: '0 auto 14px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))',
          border: '1px solid rgba(16,185,129,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(16,185,129,0.1)',
        }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="wl1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
            <circle cx="16" cy="13" r="6.5" fill="url(#wl1)" opacity="0.9"/>
            <path d="M12 9 L10 6.5 L13.2 9" fill="url(#wl1)"/>
            <path d="M20 9 L22 6.5 L18.8 9" fill="url(#wl1)"/>
            <path d="M12 19 Q9 21 7.5 23" stroke="url(#wl1)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M16 19.5 L16 24" stroke="url(#wl1)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M20 19 Q23 21 24.5 23" stroke="url(#wl1)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <line x1="10.2" y1="12" x2="21.8" y2="12" stroke="#10b981" strokeWidth="1.1" opacity="0.85"/>
            <circle cx="16" cy="13" r="1.6" fill="white" opacity="0.95"/>
          </svg>
        </div>

        <div style={{
          fontSize: 16, fontWeight: 600, color: '#ebebec',
          marginBottom: 7, letterSpacing: '-0.02em',
          fontFamily: "'Geist', sans-serif",
        }}>
          Ask anything about this repo
        </div>
        <div style={{
          fontSize: 13, color: '#666672', lineHeight: 1.6,
          fontFamily: "'Geist', sans-serif",
          maxWidth: 300, margin: '0 auto',
        }}>
          Full codebase analyzed. Ask about architecture, patterns, or where to start.
        </div>
      </div>

      {/* Questions — clean 2-column grid, no dividers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        {DEMO_QUESTIONS.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <DemoQButton q={d.q} icon={d.icon} onSend={onSend} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main ChatPanel ── */
export default function ChatPanel({ messages, streaming, streamingText, error, onSend, onClear, ready }: Props) {
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const showWelcome = messages.length === 0 && !streaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const send = useCallback(() => {
    if (!input.trim() || streaming) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, streaming, onSend]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>

      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#10b981',
            boxShadow: '0 0 8px #10b981',
            animation: 'dotPulse 2s ease-in-out infinite',
          }}/>
          <span style={{
            fontSize: 13, fontWeight: 600, color: '#ebebec',
            fontFamily: "'Geist', sans-serif", letterSpacing: '-0.02em',
          }}>
            AI Code Assistant
          </span>
          <span style={{ fontSize: 11, color: '#4a4a56', fontFamily: 'Geist Mono,monospace' }}>GPT-4o</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            style={{
              padding: '4px 10px', borderRadius: 7, fontSize: 11,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
              color: '#f87171', cursor: 'pointer', fontFamily: 'Geist Mono,monospace',
              transition: 'all 0.18s',
            }}
          >Clear</button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: showWelcome ? '0' : '20px 16px 8px',
        scrollBehavior: 'smooth',
      }}>
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <WelcomeState key="welcome" onSend={(q) => onSend(q)} />
          ) : (
            <div key="messages">
              {messages.map(m => <Bubble key={m.id} msg={m} />)}
              {streaming && (
                streamingText
                  ? <StreamingBubble text={streamingText} />
                  : <TypingIndicator />
              )}
            </div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              display: 'flex', gap: 8, alignItems: 'center',
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              fontSize: 13, color: '#f87171', margin: '8px 0',
              fontFamily: "'Geist', sans-serif",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div
          animate={{
            borderColor: inputFocused ? 'rgba(16,185,129,0.45)' : 'rgba(255,255,255,0.09)',
            boxShadow: inputFocused
              ? '0 0 0 3px rgba(16,185,129,0.09), 0 0 30px rgba(16,185,129,0.08)'
              : 'none',
          }}
          style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: 'rgba(255,255,255,0.04)',
            padding: '10px 10px 10px 14px',
            borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.09)',
            transition: 'border-color 0.25s, box-shadow 0.25s',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKey}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={ready ? "Ask anything about this codebase…" : "Analyzing repo…"}
            disabled={!ready || streaming}
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              background: 'transparent', color: '#ebebec', caretColor: '#10b981',
              fontSize: 14, lineHeight: 1.6,
              fontFamily: "'Geist', sans-serif",
              letterSpacing: '-0.01em',
              padding: '2px 0', minHeight: 24, maxHeight: 140, overflowY: 'auto',
              opacity: ready ? 1 : 0.5,
            }}
          />
          <motion.button
            whileHover={input.trim() && !streaming ? { scale: 1.06 } : {}}
            whileTap={input.trim() && !streaming ? { scale: 0.95 } : {}}
            onClick={send}
            disabled={!input.trim() || streaming || !ready}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: input.trim() && !streaming
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'rgba(255,255,255,0.06)',
              border: 'none',
              cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: input.trim() && !streaming ? '0 0 16px rgba(16,185,129,0.3)' : 'none',
            }}
          >
            {streaming ? (
              <div style={{
                width: 14, height: 14,
                border: '2px solid rgba(255,255,255,0.2)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }}/>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </motion.button>
        </motion.div>
        <div style={{
          textAlign: 'center', marginTop: 7,
          fontSize: 10.5, color: '#3a3a46',
          fontFamily: 'Geist Mono,monospace',
        }}>
          Shift+Enter for new line · Enter to send
        </div>
      </div>

    </div>
  );
}