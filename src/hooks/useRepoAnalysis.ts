import { useCallback, useReducer } from 'react';
import { AppState, AppPhase, RepoInfo, RepoFile, ClaudeAnalysis } from '../types';
import { fetchRepoInfo, fetchRepoTree, fetchSelectedFiles } from '../api/github';
import { analyzeRepo } from '../api/openai';
import { selectImportantFiles } from '../utils/fileSelector';
import { cache, classifyError, withRetry } from '../utils/helpers';

// ================= TYPES =================
type Action =
  | { type: 'SET_PHASE'; phase: AppPhase }
  | { type: 'SET_LOADING'; step: string; progress: number }
  | { type: 'SET_SUCCESS'; repoInfo: RepoInfo; files: RepoFile[]; analysis: ClaudeAnalysis; githubData: any | null }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET' };

// ================= INITIAL STATE =================
const INITIAL: AppState = {
  phase: 'hero',
  repoInfo: null,
  files: [],
  analysis: null,
  githubData: null,
  error: null,
  loadingStep: '',
  loadingProgress: 0,
};

// ================= REDUCER =================
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'SET_LOADING':
      return {
        ...state,
        phase: 'loading',
        loadingStep: action.step,
        loadingProgress: action.progress,
      };

    case 'SET_SUCCESS':
      return {
        ...state,
        phase: 'dashboard',
        repoInfo: action.repoInfo,
        files: action.files,
        analysis: action.analysis,
        githubData: action.githubData ?? null,
        error: null,
      };

    case 'SET_ERROR':
      return { ...state, phase: 'hero', error: action.error };

    case 'RESET':
      return { ...INITIAL };

    default:
      return state;
  }
}

// ================= HOOK =================
export function useRepoAnalysis() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const analyze = useCallback(async (rawInput: string) => {
    let owner = '';
    let repo = '';

    // ===== Parse input =====
    try {
      const clean = rawInput
        .trim()
        .replace(/^https?:\/\/github\.com\//, '')
        .replace(/\/$/, '');

      const parts = clean.split('/');

      if (parts.length < 2) throw new Error('INVALID_URL');

      owner = parts[0];
      repo = parts[1];

      if (!owner || !repo) throw new Error('INVALID_URL');

    } catch {
      dispatch({
        type: 'SET_ERROR',
        error: 'Enter a valid GitHub URL: github.com/owner/repo',
      });
      return;
    }

    dispatch({
      type: 'SET_LOADING',
      step: 'Connecting to GitHub...',
      progress: 5,
    });

    try {
      // ===== Cache =====
      const cached = cache.load<{
        repoInfo: RepoInfo;
        files: RepoFile[];
        analysis: ClaudeAnalysis;
        githubData: any | null;
      }>(owner, repo);

      if (cached) {
        dispatch({
          type: 'SET_LOADING',
          step: 'Loading from cache...',
          progress: 90,
        });

        await new Promise(r => setTimeout(r, 400));

        dispatch({ type: 'SET_SUCCESS', ...cached });
        return;
      }

      // ===== 1. Repo info =====
      dispatch({
        type: 'SET_LOADING',
        step: 'Fetching repository info...',
        progress: 10,
      });

      const repoInfo = await withRetry(() => fetchRepoInfo(owner, repo));

      // ===== 2. File tree =====
      dispatch({
        type: 'SET_LOADING',
        step: 'Loading file tree...',
        progress: 20,
      });

      const tree = await withRetry(() =>
        fetchRepoTree(owner, repo, repoInfo.defaultBranch)
      );

      // ===== 3. Select files =====
      dispatch({
        type: 'SET_LOADING',
        step: 'Selecting important files...',
        progress: 30,
      });

      const selectedPaths = selectImportantFiles(tree, 15);

      // ===== 4. Fetch files =====
      dispatch({
        type: 'SET_LOADING',
        step: `Reading ${selectedPaths.length} files...`,
        progress: 35,
      });

      const files = await fetchSelectedFiles(
        owner,
        repo,
        selectedPaths,
        (done, total) => {
          const progress = 35 + Math.round((done / total) * 30);

          dispatch({
            type: 'SET_LOADING',
            step: `Reading files (${done}/${total})...`,
            progress,
          });
        }
      );

      // ===== 5. AI Analysis =====
      dispatch({
        type: 'SET_LOADING',
        step: 'Analyzing repository with AI...',
        progress: 70,
      });

      const { analysis, githubData } = await analyzeRepo(`${owner}/${repo}`, files);

      dispatch({
        type: 'SET_LOADING',
        step: 'Finalizing...',
        progress: 95,
      });

      await new Promise(r => setTimeout(r, 300));

      // ===== Cache Save =====
      cache.save(owner, repo, { repoInfo, files, analysis, githubData });

      // ===== Success =====
      dispatch({
        type: 'SET_SUCCESS',
        repoInfo,
        files,
        analysis,
        githubData,
      });

    } catch (err) {
      const appError = classifyError(err);

      dispatch({
        type: 'SET_ERROR',
        error: appError.message,
      });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { state, analyze, reset };
}