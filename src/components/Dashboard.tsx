import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion'; // ✅ ADD
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

type Tab = 'overview' | 'graph' | 'chat' | 'checklist';

interface Props {
  repoInfo: RepoInfo;
  files: RepoFile[];
  analysis: ClaudeAnalysis;
  onBack: () => void;
}

export default function Dashboard({ repoInfo, files, analysis, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [drawerFile, setDrawer] = useState<RepoFile | null>(null);
  const [checklist] = useState<ChecklistItem[]>(() => generateChecklist(repoInfo, analysis));

  const complexity = useMemo(() => {
    const avgLines = files.length ? files.reduce((s, f) => s + f.lines, 0) / files.length : 0;
    return calcComplexity(files.length, avgLines, analysis.gotchas.filter(g => g.severity === 'high').length);
  }, [files, analysis]);

  const graphData = useMemo(() => buildDependencyGraph(files), [files]);
  const chat = useChat(repoInfo, analysis, files);

  const openFile = (path: string) => {
    const found = files.find(f => f.path === path || f.path.includes(path));
    if (found) setDrawer(found);
  };

  const askAboutFile = (file: RepoFile) => {
    setDrawer(null);
    setTab('chat');
    setTimeout(() => {
      chat.send(`Explain what the file \`${file.path}\` does and its role.`);
    }, 100);
  };

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'graph', label: 'Graph' },
    { key: 'chat', label: 'Q&A Chat' },
    { key: 'checklist', label: 'Checklist' },
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
        
        {/* ✨ Stats Animation */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <StatCards repoInfo={repoInfo} files={files} analysis={analysis} complexity={complexity} />
        </motion.div>

        {/* 💎 Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          {TABS.map(t => (
            <motion.button
              key={t.key}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: tab === t.key ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* ✨ CONTENT SWITCH */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >

          {/* ── Overview ── */}
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

          {/* ── Graph ── */}
          {tab === 'graph' && (
            <DependencyGraph graphData={graphData} onNodeClick={openFile} />
          )}

          {/* ── Chat ── */}
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
                borderRadius: 16
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

          {/* ── Checklist ── */}
          {tab === 'checklist' && (
            <OnboardingChecklist items={checklist} />
          )}
        </motion.div>
      </div>

      <FileDrawer file={drawerFile} onClose={() => setDrawer(null)} onAskAbout={askAboutFile} />
    </motion.div>
  );
}