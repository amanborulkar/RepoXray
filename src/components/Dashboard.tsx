import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RepoInfo, RepoFile, ClaudeAnalysis, ChecklistItem } from '../types';
import { calcComplexity, generateChecklist } from '../utils/helpers';
import { buildDependencyGraph } from '../utils/graphBuilder';
import { useChat, STARTER_QUESTIONS } from '../hooks/useChat';

import TopBar from './TopBar';
import StatCards from './StatCards';
import ProjectSummaryCard from './panels/ProjectSummaryCard';
import ArchitecturePanel from './panels/ArchitecturePanel';
import { EntryPointsList, CriticalFilesPanel, GotchasList, ReadingOrderTimeline } from './panels/AnalysisPanels';
import ChatPanel from './ChatPanel';
import DependencyGraph from './DependencyGraph';
import OnboardingChecklist from './OnboardingChecklist';
import FileDrawer from './FileDrawer';
import RepoStats from './RepoStats';
import FileViewer from './FileViewer';

type Tab = 'overview' | 'graph' | 'chat' | 'checklist' | 'stats';

interface Props {
  repoInfo: RepoInfo;
  files: RepoFile[];
  analysis: ClaudeAnalysis;
  githubData?: any;
  onBack: () => void;
}

export default function Dashboard({ repoInfo, files, analysis, githubData: initialGithubData, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [drawerFile, setDrawer] = useState<RepoFile | null>(null);
  const [viewerPath, setViewerPath] = useState<string | null>(null);
  const [checklist] = useState<ChecklistItem[]>(() => generateChecklist(repoInfo, analysis));

  // githubData: use what came from analyze, OR fetch it independently on demand
  const [githubData, setGithubData] = useState<any>(initialGithubData ?? null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Auto-fetch stats when the Stats tab is opened and data isn't available yet
  useEffect(() => {
    if (tab !== 'stats' || githubData) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError('');
      try {
        const res = await fetch(
          `/api/github-stats/${repoInfo.owner}/${repoInfo.repo}`
        );
        const json = await res.json();
        if (json.githubData) {
          setGithubData(json.githubData);
        } else {
          setStatsError(json.error || 'No data returned from server');
        }
      } catch (err: any) {
        setStatsError(err.message || 'Could not reach backend');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [tab, githubData, repoInfo.owner, repoInfo.repo]);

  const complexity = useMemo(() => {
    const avgLines = files.length ? files.reduce((s, f) => s + f.lines, 0) / files.length : 0;
    return calcComplexity(files.length, avgLines, analysis.gotchas.filter(g => g.severity === 'high').length);
  }, [files, analysis]);

  const graphData = useMemo(() => buildDependencyGraph(files), [files]);
  const chat = useChat(repoInfo, analysis, files);

  const openFile = (path: string) => {
    const found = files.find(f => f.path === path || f.path.includes(path));
    if (found) {
      setDrawer(found);
    } else {
      setViewerPath(path);
    }
  };

  const askAboutFile = (file: RepoFile) => {
    setDrawer(null);
    setTab('chat');
    setTimeout(() => {
      chat.send(`Explain what the file \`${file.path}\` does and its role.`);
    }, 100);
  };

  const TABS = [
    { key: 'overview',  label: '📋 Overview'  },
    { key: 'graph',     label: '🕸️ Graph'      },
    { key: 'chat',      label: '💬 Q&A Chat'   },
    { key: 'checklist', label: '✅ Checklist'  },
    { key: 'stats',     label: '📊 Repo Stats' },
  ] as { key: Tab; label: string }[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <TopBar repoInfo={repoInfo} analysis={analysis} files={files} onBack={onBack} />

      <div style={{ flex: 1, maxWidth: 1400, margin: '0 auto', width: '100%', padding: '28px 24px' }}>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <StatCards repoInfo={repoInfo} files={files} analysis={analysis} complexity={complexity} />
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: tab === t.key
                  ? 'linear-gradient(135deg, var(--brand), var(--accent2))'
                  : 'rgba(255,255,255,0.07)',
                border: tab === t.key ? '1px solid transparent' : '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
                color: tab === t.key ? 'white' : 'var(--muted2)',
                fontSize: 13,
                fontWeight: tab === t.key ? 600 : 400,
                fontFamily: "'Geist', sans-serif",
                boxShadow: tab === t.key ? '0 0 18px rgba(16,185,129,0.25)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
                transform: 'translateZ(0)',
              }}
              onMouseEnter={e => { if (tab !== t.key) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) translateZ(0)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateZ(0)'; }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(1px) translateZ(0)'; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateZ(0)'; }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <ProjectSummaryCard repoInfo={repoInfo} analysis={analysis} complexity={complexity} />
                <EntryPointsList analysis={analysis} onFileClick={openFile} />
                <GotchasList analysis={analysis} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <ArchitecturePanel analysis={analysis} />
                <CriticalFilesPanel analysis={analysis} onFileClick={openFile} />
                <ReadingOrderTimeline analysis={analysis} onFileClick={openFile} />
              </div>
            </div>
          )}

          {tab === 'graph' && (
            <DependencyGraph graphData={graphData} onNodeClick={openFile} />
          )}

          {tab === 'chat' && (
            <motion.div
              className="card"
              style={{
                height: 620,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 16,
              }}
            >
              <ChatPanel
                messages={chat.messages}
                streaming={chat.streaming}
                streamingText={chat.streamingText}
                error={chat.error}
                onSend={chat.send}
                onClear={chat.clear}
                ready={true}
                starterQuestions={STARTER_QUESTIONS}
              />
            </motion.div>
          )}

          {tab === 'checklist' && (
            <OnboardingChecklist items={checklist} />
          )}

          {/* ── Repo Stats tab ── */}
          {tab === 'stats' && (
            statsLoading ? (
              /* Loading shimmer */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1,2,3].map(i => (
                  <div key={i} className="card skeleton" style={{ height: 100, borderRadius: 14 }} />
                ))}
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>
                  Fetching GitHub stats…
                </div>
              </div>
            ) : statsError ? (
              /* Error state with retry */
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--red-l)', marginBottom: 8 }}>
                  Could not load GitHub Stats
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                  {statsError}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setStatsError(''); setGithubData(null); }}
                >
                  🔄 Retry
                </button>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 16 }}>
                  Make sure the backend is running at <code>localhost:4000</code> and
                  add <code>GITHUB_TOKEN</code> to <code>backend/.env</code> to avoid rate limits.
                </div>
              </div>
            ) : githubData ? (
              <RepoStats data={githubData} />
            ) : null
          )}
        </motion.div>
      </div>

      <FileDrawer file={drawerFile} onClose={() => setDrawer(null)} onAskAbout={askAboutFile} />

      {viewerPath && (
        <FileViewer
          owner={repoInfo.owner}
          repo={repoInfo.repo}
          path={viewerPath}
          onClose={() => setViewerPath(null)}
        />
      )}
    </motion.div>
  );
}
