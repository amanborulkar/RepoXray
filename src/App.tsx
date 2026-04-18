import React from 'react';
import { motion } from 'framer-motion'; // ✅ ADD
import { useRepoAnalysis } from './hooks/useRepoAnalysis';
import Hero from './components/Hero';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';

export default function App() {
  const { state, analyze, reset } = useRepoAnalysis();

  const repoSlug = state.repoInfo
    ? `${state.repoInfo.owner}/${state.repoInfo.repo}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}        // ✨ smooth entry
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ minHeight: '100vh', position: 'relative' }}
      className="bg-gradient-to-br from-blue-900 via-black to-purple-900 text-white"
    >
      {/* 🔥 Animated Background Orbs */}
      <motion.div
        className="orb orb-1"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="orb orb-2"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="orb orb-3"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      {/* ✨ HERO */}
      {state.phase === 'hero' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Hero onAnalyze={analyze} error={state.error} />
        </motion.div>
      )}

      {/* ⚡ LOADING */}
      {state.phase === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <LoadingScreen
            step={state.loadingStep}
            progress={state.loadingProgress}
            repo={repoSlug}
          />
        </motion.div>
      )}

      {/* 💎 DASHBOARD */}
      {state.phase === 'dashboard' && state.repoInfo && state.analysis && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Dashboard
            repoInfo={state.repoInfo}
            files={state.files}
            analysis={state.analysis}
            githubData={state.githubData}
            onBack={reset}
          />
        </motion.div>
      )}
    </motion.div>
  );
}