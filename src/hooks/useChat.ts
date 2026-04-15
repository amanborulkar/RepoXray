import { useCallback, useReducer, useRef } from 'react';
import { ChatMessage, ClaudeAnalysis, RepoFile, RepoInfo } from '../types';
import { streamChat } from '../api/openai';

interface ChatState {
  messages: ChatMessage[];
  streaming: boolean;
  streamingText: string;
  error: string | null;
}

type Action =
  | { type: 'ADD_USER'; content: string }
  | { type: 'STREAM_CHUNK'; chunk: string }
  | { type: 'STREAM_DONE' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR' };

const INITIAL: ChatState = { messages: [], streaming: false, streamingText: '', error: null };

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

function reducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case 'ADD_USER':
      return {
        ...state,
        messages: [...state.messages, { id: nextId(), role: 'user', content: action.content, timestamp: Date.now() }],
        streaming: true,
        streamingText: '',
        error: null,
      };
    case 'STREAM_CHUNK':
      return { ...state, streamingText: state.streamingText + action.chunk };
    case 'STREAM_DONE':
      return {
        ...state,
        streaming: false,
        streamingText: '',
        messages: [
          ...state.messages,
          { id: nextId(), role: 'assistant', content: state.streamingText, timestamp: Date.now() },
        ],
      };
    case 'SET_ERROR':
      return { ...state, streaming: false, streamingText: '', error: action.error };
    case 'CLEAR':
      return INITIAL;
    default:
      return state;
  }
}

export const STARTER_QUESTIONS = [
  'What does this codebase do in plain English?',
  'Where should I start reading the code?',
  'What are the most important design patterns used?',
  'What are the biggest gotchas for a new developer?',
  'How is authentication handled?',
  'How is the project structured?',
];

export function useChat(
  repoInfo: RepoInfo | null,
  analysis: ClaudeAnalysis | null,
  files: RepoFile[]
) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const abortRef = useRef(false);

  const send = useCallback(async (question: string) => {
    if (!repoInfo || !analysis || state.streaming) return;
    abortRef.current = false;
    dispatch({ type: 'ADD_USER', content: question });

    try {
      await streamChat(
        question,
        state.messages,
        { repoName: repoInfo.fullName, analysis, files },
        chunk => { if (!abortRef.current) dispatch({ type: 'STREAM_CHUNK', chunk }); },
        () => { if (!abortRef.current) dispatch({ type: 'STREAM_DONE' }); }
      );
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Chat error' });
    }
  }, [repoInfo, analysis, files, state.messages, state.streaming]);

  const clear = useCallback(() => {
    abortRef.current = true;
    dispatch({ type: 'CLEAR' });
  }, []);

  return { ...state, send, clear };
}
