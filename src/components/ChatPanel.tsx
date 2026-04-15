import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChatMessage } from '../types';
import SyntaxHighlighter from 'react-syntax-highlighter';

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

// 💎 Bubble
function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16
      }}
    >
      <div style={{
        maxWidth: '75%',
        padding: '14px 16px',
        borderRadius: 16,
        background: isUser
          ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
          : 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 14,
        lineHeight: 1.6,
        color: 'white'
      }}>
        {isUser ? msg.content : (
          <ReactMarkdown
            components={{
              code({ inline, className, children }: any) {
                const match = /language-(\w+)/.exec(className || '');

                return !inline ? (
                  <div style={{ position: 'relative', marginTop: 10 }}>
                    <button
                      onClick={() => navigator.clipboard.writeText(String(children))}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: 10,
                        fontSize: 11,
                        background: '#111',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Copy
                    </button>

                    <SyntaxHighlighter
                      style={oneDark}
                      language={match?.[1] || 'javascript'}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code style={{
                    background: '#222',
                    padding: '2px 6px',
                    borderRadius: 4
                  }}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
}

// 🤖 Streaming
function StreamingBubble({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{
        maxWidth: '75%',
        padding: '14px 16px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {text}
        <span style={{ marginLeft: 5 }}>▋</span>
      </div>
    </motion.div>
  );
}

export default function ChatPanel({
  messages,
  streaming,
  streamingText,
  error,
  onSend,
  onClear,
  ready,
  starterQuestions
}: Props) {

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const send = () => {
    if (!input.trim() || streaming) return;
    onSend(input);
    setInput('');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent'
    }}>

      {/* 💬 Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px'
      }}>
        {messages.map(m => <Bubble key={m.id} msg={m} />)}
        {streaming && <StreamingBubble text={streamingText} />}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      {/* ✨ Input */}
      <div style={{
        padding: 16,
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{
          display: 'flex',
          gap: 10,
          background: 'rgba(255,255,255,0.06)',
          padding: 8,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this repo..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              background: 'transparent',
              color: 'white',
              padding: '8px'
            }}
          />

          <button
            onClick={send}
            style={{
              background: '#4f46e5',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 10,
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}