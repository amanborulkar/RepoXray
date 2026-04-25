import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRepoAnalysis } from './hooks/useRepoAnalysis';
import { useParticleBG } from './particle-bg.js';
import Hero from './components/Hero';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';

/* ─── Neural Brain Left SVG (fixed position, full height) ─── */
function NeuralLeft() {
  return (
    <div className="brain-neural-left">
      <svg viewBox="0 0 160 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="bnGlowL"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="bnGlowLs"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="bnFadeL" x1="0" x2="1"><stop offset="0" stopColor="var(--bg)" stopOpacity="0"/><stop offset="1" stopColor="var(--bg)" stopOpacity="1"/></linearGradient>
        </defs>
        <path className="bn-synapse" d="M36,55 C82,70 78,100 118,118"     stroke="#10b981" strokeWidth="1.3" opacity=".65" style={{animationDelay:'0s'}}/>
        <path className="bn-synapse" d="M118,118 C78,142 62,168 36,192"   stroke="#3b82f6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'.9s'}}/>
        <path className="bn-synapse" d="M36,192 C84,214 90,240 120,262"   stroke="#10b981" strokeWidth="1.3" opacity=".65" style={{animationDelay:'1.8s'}}/>
        <path className="bn-synapse" d="M120,262 C62,284 44,314 26,340"   stroke="#8b5cf6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'2.7s'}}/>
        <path className="bn-synapse" d="M26,340 C78,362 85,382 114,402"   stroke="#10b981" strokeWidth="1.3" opacity=".65" style={{animationDelay:'.5s'}}/>
        <path className="bn-synapse" d="M114,402 C72,420 58,442 42,460"   stroke="#3b82f6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'1.4s'}}/>
        <path className="bn-synapse" d="M42,460 C84,478 88,502 118,520"   stroke="#8b5cf6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'.7s'}}/>
        <path className="bn-synapse" d="M118,520 C72,542 60,568 32,588"   stroke="#10b981" strokeWidth="1.3" opacity=".65" style={{animationDelay:'2.2s'}}/>
        <path className="bn-synapse" d="M32,588 C80,610 86,634 116,652"   stroke="#3b82f6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'1.1s'}}/>
        <path className="bn-synapse" d="M116,652 C70,672 55,696 38,714"   stroke="#8b5cf6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'3.1s'}}/>
        {/* cross-links */}
        <path className="bn-synapse" d="M36,55 C6,110 10,160 36,192"      stroke="#8b5cf6" strokeWidth=".9" opacity=".35" style={{animationDelay:'2.1s'}}/>
        <path className="bn-synapse" d="M118,118 C146,178 144,228 120,262" stroke="#3b82f6" strokeWidth=".9" opacity=".35" style={{animationDelay:'3.2s'}}/>
        <path className="bn-synapse" d="M36,192 C6,248 10,300 26,340"     stroke="#10b981" strokeWidth=".9" opacity=".35" style={{animationDelay:'1.1s'}}/>
        <path className="bn-synapse" d="M120,262 C145,320 138,370 114,402" stroke="#8b5cf6" strokeWidth=".9" opacity=".35" style={{animationDelay:'3.8s'}}/>
        <path className="bn-synapse" d="M26,340 C4,396 8,448 42,460"      stroke="#3b82f6" strokeWidth=".9" opacity=".35" style={{animationDelay:'.3s'}}/>
        <path className="bn-synapse" d="M114,402 C142,460 140,514 118,520" stroke="#10b981" strokeWidth=".9" opacity=".35" style={{animationDelay:'4.2s'}}/>
        {/* Primary neurons */}
        <circle className="bn-neuron" cx="36"  cy="55"  r="5.5" fill="#10b981" filter="url(#bnGlowL)" style={{animationDelay:'0s'}}/>
        <circle className="bn-neuron" cx="118" cy="118" r="5"   fill="#3b82f6" filter="url(#bnGlowL)" style={{animationDelay:'.7s'}}/>
        <circle className="bn-neuron" cx="36"  cy="192" r="5.5" fill="#8b5cf6" filter="url(#bnGlowL)" style={{animationDelay:'1.3s'}}/>
        <circle className="bn-neuron" cx="120" cy="262" r="5"   fill="#10b981" filter="url(#bnGlowL)" style={{animationDelay:'2s'}}/>
        <circle className="bn-neuron" cx="26"  cy="340" r="5.5" fill="#3b82f6" filter="url(#bnGlowL)" style={{animationDelay:'.4s'}}/>
        <circle className="bn-neuron" cx="114" cy="402" r="5"   fill="#8b5cf6" filter="url(#bnGlowL)" style={{animationDelay:'1.6s'}}/>
        <circle className="bn-neuron" cx="42"  cy="460" r="5"   fill="#10b981" filter="url(#bnGlowL)" style={{animationDelay:'2.5s'}}/>
        <circle className="bn-neuron" cx="118" cy="520" r="5.5" fill="#3b82f6" filter="url(#bnGlowL)" style={{animationDelay:'.8s'}}/>
        <circle className="bn-neuron" cx="32"  cy="588" r="5"   fill="#8b5cf6" filter="url(#bnGlowL)" style={{animationDelay:'1.9s'}}/>
        <circle className="bn-neuron" cx="116" cy="652" r="5"   fill="#10b981" filter="url(#bnGlowL)" style={{animationDelay:'3s'}}/>
        <circle className="bn-neuron" cx="38"  cy="714" r="4.5" fill="#3b82f6" filter="url(#bnGlowL)" style={{animationDelay:'2.4s'}}/>
        {/* Micro nodes */}
        <circle className="bn-neuron-faint" cx="76" cy="86"  r="2.8" fill="#10b981" filter="url(#bnGlowLs)" style={{animationDelay:'.3s'}}/>
        <circle className="bn-neuron-faint" cx="74" cy="154" r="2.5" fill="#3b82f6" filter="url(#bnGlowLs)" style={{animationDelay:'1.7s'}}/>
        <circle className="bn-neuron-faint" cx="78" cy="228" r="2.8" fill="#8b5cf6" filter="url(#bnGlowLs)" style={{animationDelay:'.8s'}}/>
        <circle className="bn-neuron-faint" cx="68" cy="302" r="2.5" fill="#10b981" filter="url(#bnGlowLs)" style={{animationDelay:'2.4s'}}/>
        <circle className="bn-neuron-faint" cx="70" cy="372" r="2.8" fill="#3b82f6" filter="url(#bnGlowLs)" style={{animationDelay:'1.2s'}}/>
        <circle className="bn-neuron-faint" cx="76" cy="432" r="2.5" fill="#8b5cf6" filter="url(#bnGlowLs)" style={{animationDelay:'.6s'}}/>
        <circle className="bn-neuron-faint" cx="74" cy="492" r="2.8" fill="#10b981" filter="url(#bnGlowLs)" style={{animationDelay:'2s'}}/>
        <circle className="bn-neuron-faint" cx="70" cy="556" r="2.5" fill="#3b82f6" filter="url(#bnGlowLs)" style={{animationDelay:'1.5s'}}/>
        <circle className="bn-neuron-faint" cx="76" cy="622" r="2.8" fill="#8b5cf6" filter="url(#bnGlowLs)" style={{animationDelay:'.4s'}}/>
        <circle className="bn-neuron-faint" cx="72" cy="684" r="2.5" fill="#10b981" filter="url(#bnGlowLs)" style={{animationDelay:'2.8s'}}/>
        <rect x="128" y="0" width="32" height="900" fill="url(#bnFadeL)"/>
      </svg>
    </div>
  );
}

/* ─── Neural Brain Top-Right SVG ─── */
function NeuralTopRight() {
  return (
    <div className="brain-neural-topright">
      <svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="bnGlowR"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="bnGlowRs"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="bnFadeB" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--bg)" stopOpacity="0"/><stop offset="1" stopColor="var(--bg)" stopOpacity="1"/></linearGradient>
        </defs>
        <path className="bn-synapse" d="M262,18 C224,26 198,40 172,54"    stroke="#10b981" strokeWidth="1.3" opacity=".65" style={{animationDelay:'.3s'}}/>
        <path className="bn-synapse" d="M262,18 C272,48 272,72 262,96"    stroke="#3b82f6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'1.2s'}}/>
        <path className="bn-synapse" d="M172,54 C206,62 236,74 262,96"    stroke="#8b5cf6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'.8s'}}/>
        <path className="bn-synapse" d="M172,54 C180,82 192,104 196,126"  stroke="#10b981" strokeWidth="1.3" opacity=".65" style={{animationDelay:'2.2s'}}/>
        <path className="bn-synapse" d="M262,96 C236,108 216,116 196,126" stroke="#3b82f6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'1.6s'}}/>
        <path className="bn-synapse" d="M262,96 C272,120 272,142 264,164" stroke="#10b981" strokeWidth="1.3" opacity=".65" style={{animationDelay:'.2s'}}/>
        <path className="bn-synapse" d="M196,126 C220,138 244,150 264,164" stroke="#8b5cf6" strokeWidth="1.3" opacity=".65" style={{animationDelay:'1.9s'}}/>
        <path className="bn-synapse" d="M196,126 C180,140 168,152 160,154" stroke="#3b82f6" strokeWidth=".9"  opacity=".38" style={{animationDelay:'.6s'}}/>
        <path className="bn-synapse" d="M196,126 C210,154 214,176 220,198" stroke="#10b981" strokeWidth="1.1" opacity=".55" style={{animationDelay:'1.4s'}}/>
        <path className="bn-synapse" d="M264,164 C248,176 234,186 220,198" stroke="#8b5cf6" strokeWidth="1.1" opacity=".55" style={{animationDelay:'2.6s'}}/>
        <path className="bn-synapse" d="M160,154 C180,170 202,184 220,198" stroke="#3b82f6" strokeWidth=".9"  opacity=".38" style={{animationDelay:'1s'}}/>
        <circle className="bn-neuron" cx="262" cy="18"  r="5.5" fill="#10b981" filter="url(#bnGlowR)" style={{animationDelay:'0s'}}/>
        <circle className="bn-neuron" cx="172" cy="54"  r="5"   fill="#3b82f6" filter="url(#bnGlowR)" style={{animationDelay:'.8s'}}/>
        <circle className="bn-neuron" cx="262" cy="96"  r="5.5" fill="#8b5cf6" filter="url(#bnGlowR)" style={{animationDelay:'1.5s'}}/>
        <circle className="bn-neuron" cx="196" cy="126" r="5.5" fill="#10b981" filter="url(#bnGlowR)" style={{animationDelay:'.4s'}}/>
        <circle className="bn-neuron" cx="264" cy="164" r="5"   fill="#3b82f6" filter="url(#bnGlowR)" style={{animationDelay:'1.9s'}}/>
        <circle className="bn-neuron" cx="160" cy="154" r="4.5" fill="#8b5cf6" filter="url(#bnGlowR)" style={{animationDelay:'1.1s'}}/>
        <circle className="bn-neuron" cx="220" cy="198" r="5"   fill="#10b981" filter="url(#bnGlowR)" style={{animationDelay:'2.3s'}}/>
        <circle className="bn-neuron-faint" cx="228" cy="34"  r="2.8" fill="#3b82f6" filter="url(#bnGlowRs)" style={{animationDelay:'.5s'}}/>
        <circle className="bn-neuron-faint" cx="220" cy="74"  r="2.5" fill="#10b981" filter="url(#bnGlowRs)" style={{animationDelay:'1.3s'}}/>
        <circle className="bn-neuron-faint" cx="232" cy="134" r="2.8" fill="#8b5cf6" filter="url(#bnGlowRs)" style={{animationDelay:'1.8s'}}/>
        <circle className="bn-neuron-faint" cx="242" cy="180" r="2.5" fill="#3b82f6" filter="url(#bnGlowRs)" style={{animationDelay:'.9s'}}/>
        <rect x="0" y="178" width="300" height="42" fill="url(#bnFadeB)"/>
      </svg>
    </div>
  );
}

/* ─── Canvas Particle Background — mounted once, persists across all pages ─── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setMode } = useParticleBG(canvasRef, 'neural');

  // Listen to mode-change events dispatched by TopBar
  useEffect(() => {
    const handler = (e: CustomEvent) => setMode(e.detail);
    window.addEventListener('particle-mode', handler as EventListener);
    return () => window.removeEventListener('particle-mode', handler as EventListener);
  }, [setMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}

/* ─── Root App ─── */
export default function App() {
  const { state, analyze, reset } = useRepoAnalysis();

  const repoSlug = state.repoInfo
    ? `${state.repoInfo.owner}/${state.repoInfo.repo}`
    : '';

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#04060e' }}>

      {/* ✨ Particle canvas — always rendered, never unmounted */}
      <ParticleCanvas />

      {/* 🧠 Neural brain decorations — persistent on all pages */}
      <NeuralLeft />
      <NeuralTopRight />

      {/* 🔥 Animated gradient orbs */}
      <motion.div className="orb orb-1" animate={{ y: [0,-20,0] }} transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }} style={{zIndex:1, pointerEvents:'none'}}/>
      <motion.div className="orb orb-2" animate={{ y: [0,20,0]  }} transition={{ duration:8, repeat:Infinity, ease:'easeInOut' }} style={{zIndex:1, pointerEvents:'none'}}/>
      <motion.div className="orb orb-3" animate={{ y: [0,-15,0] }} transition={{ duration:7, repeat:Infinity, ease:'easeInOut' }} style={{zIndex:1, pointerEvents:'none'}}/>

      {/* Page content — sits above canvas */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ✨ HERO */}
        {state.phase === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          >
            <Hero onAnalyze={analyze} error={state.error} />
          </motion.div>
        )}

        {/* ⚡ LOADING */}
        {state.phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
            key="dashboard"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
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
      </div>
    </div>
  );
}
