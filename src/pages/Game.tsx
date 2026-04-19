import React, { useState, useEffect } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { Board } from '../components/Board';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Share, ShieldCheck, Diamond, Sparkles, Pause, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tile } from '../components/Tile';

const MOCK_TILE = { id: 'm', symbol: '🀇', color: 'emerald' };

export const Game = () => {
  const { play, toggleMute, isEnabled } = useAudioEngine();
  const { grid, activePiece, hintPiece, score, level, hintsRemaining, gameOver, isPaused, togglePause, moveLeft, moveRight, moveDown, rotate, hardDrop, restart } = useGameEngine(play);
  const navigate = useNavigate();
  const [muted, setMuted] = useState(!isEnabled());
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    const first = localStorage.getItem('meld_firstRun');
    if (!first) {
      setTutorialStep(1);
    }
  }, []);

  const handleNextTutorial = () => {
    if (tutorialStep >= 3) {
      setTutorialStep(0);
      localStorage.setItem('meld_firstRun', 'true');
    } else {
      setTutorialStep(s => s + 1);
    }
  };

  // Pause the game under the hood if tutorial is active to prevent blocks from falling
  useEffect(() => {
    if (tutorialStep > 0 && !isPaused) {
      togglePause();
    } else if (tutorialStep === 0 && isPaused && !gameOver) {
      togglePause();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialStep]);

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col items-center overflow-hidden font-sans relative selection:bg-emerald-500/30 w-full h-[100dvh]">
      
      {/* Header */}
      <header className="w-full max-w-lg mx-auto p-4 flex items-center justify-between z-20 shrink-0 border-b border-emerald-900/40 bg-obsidian/80 backdrop-blur-md">
        <h1 className="font-display text-2xl tracking-[4px] uppercase text-emerald-light italic leading-none">MELD</h1>
        
        <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.02)] px-4 py-2 rounded-full border border-[rgba(255,255,255,0.05)]">
          <span className="text-[10px] uppercase font-mono text-stone-text tracking-widest hidden sm:inline">Score</span>
          <strong className="text-white text-sm font-mono">{score}</strong>
          <div className="w-[1px] h-3 bg-glass-border"></div>
          <span className="text-[10px] uppercase font-mono text-stone-text tracking-widest hidden sm:inline">Level</span>
          <strong className="text-white text-sm font-mono">{level}</strong>
        </div>

        <div className="flex gap-2">
          <button onClick={() => tutorialStep === 0 && !gameOver && togglePause()} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] transition text-stone-text hover:text-white">
            {isPaused && tutorialStep === 0 ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button onClick={() => setIsShopOpen(true)} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] transition relative group">
            <Diamond size={18} className="text-amber-400 group-hover:scale-110 transition" />
            {hintsRemaining === 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
          </button>
          <button onClick={() => navigate('/vault')} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] transition text-stone-text">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid Centered */}
      <main className="flex-1 w-full flex items-center justify-center relative p-2 md:p-6 mb-32 z-10 shrink min-h-0">
        <Board grid={grid} activePiece={activePiece} hintPiece={hintPiece} />
        
        {/* Game Over Screen */}
        <AnimatePresence>
          {gameOver && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-x-4 top-1/4 z-40 flex flex-col items-center justify-center bg-obsidian/90 backdrop-blur-xl p-6 text-center border border-emerald-900 shadow-2xl rounded-2xl max-w-sm mx-auto"
            >
              <h2 className="text-3xl font-display uppercase tracking-[2px] mb-2 text-emerald-light italic">Game Over</h2>
              <p className="text-stone-text font-mono mb-6 pb-6 border-b border-white/10 w-full text-sm">Final Score: <span className="text-white">{score}</span></p>
              <button onClick={restart} className="btn btn-primary w-full text-sm">Play Again</button>
            </motion.div>
          )}

          {/* Pause Screen Overlay */}
          {isPaused && !gameOver && tutorialStep === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-x-4 top-1/4 z-40 flex flex-col items-center justify-center bg-obsidian/90 backdrop-blur-xl p-6 text-center border border-emerald-900 shadow-2xl rounded-2xl max-w-sm mx-auto"
            >
              <h2 className="text-3xl font-display uppercase tracking-[2px] mb-6 text-emerald-light italic">Paused</h2>
              <button onClick={togglePause} className="btn btn-primary w-full text-sm">Resume Game</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Constraints & Controls - Floating slightly above bottom */}
      <div className="absolute bottom-4 left-0 right-0 w-full max-w-md mx-auto px-4 z-30 flex flex-col gap-2 pointer-events-none">
        
        {/* Hints Counter */}
        <div className="self-center flex items-center gap-1 bg-obsidian/60 backdrop-blur border border-emerald-900/50 rounded-full px-3 py-1 mb-1 shadow-lg pointer-events-auto">
          <Sparkles size={12} className={hintsRemaining > 0 ? "text-emerald-400" : "text-stone-text"} />
          <span className="text-[10px] uppercase font-mono text-stone-text tracking-widest">{hintsRemaining} Oracle Hints</span>
        </div>

        {/* Buttons Overlay */}
        <div className="grid grid-cols-4 gap-2 w-full pointer-events-auto">
          <button onPointerDown={(e) => { e.preventDefault(); moveLeft(); }} className="h-14 relative overflow-hidden rounded-xl bg-gradient-to-b from-[#334155] to-[#0f172a] border border-black/80 flex items-center justify-center text-white transition active:scale-95 active:translate-y-[2px] text-xl font-bold font-display shadow-[inset_0_2px_3px_rgba(255,255,255,0.2),inset_0_-4px_4px_rgba(0,0,0,0.9),0_5px_15px_rgba(0,0,0,0.9)] hover:brightness-110 border-t-white/20 border-b-black">
             <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
             ←
          </button>
          <button onPointerDown={(e) => { e.preventDefault(); rotate(); }} className="h-14 relative overflow-hidden rounded-xl bg-gradient-to-b from-[#334155] to-[#0f172a] border border-black/80 flex items-center justify-center text-white transition active:scale-95 active:translate-y-[2px] text-xl font-bold font-display shadow-[inset_0_2px_3px_rgba(255,255,255,0.2),inset_0_-4px_4px_rgba(0,0,0,0.9),0_5px_15px_rgba(0,0,0,0.9)] hover:brightness-110 border-t-white/20 border-b-black">
             <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
             ↻
          </button>
          <button onPointerDown={(e) => { e.preventDefault(); moveDown(); }} className="h-14 relative overflow-hidden rounded-xl bg-gradient-to-b from-[#334155] to-[#0f172a] border border-black/80 flex items-center justify-center text-white transition active:scale-95 active:translate-y-[2px] text-xl font-bold font-display shadow-[inset_0_2px_3px_rgba(255,255,255,0.2),inset_0_-4px_4px_rgba(0,0,0,0.9),0_5px_15px_rgba(0,0,0,0.9)] hover:brightness-110 border-t-white/20 border-b-black">
             <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
             ↓
          </button>
          <button onPointerDown={(e) => { e.preventDefault(); moveRight(); }} className="h-14 relative overflow-hidden rounded-xl bg-gradient-to-b from-[#334155] to-[#0f172a] border border-black/80 flex items-center justify-center text-white transition active:scale-95 active:translate-y-[2px] text-xl font-bold font-display shadow-[inset_0_2px_3px_rgba(255,255,255,0.2),inset_0_-4px_4px_rgba(0,0,0,0.9),0_5px_15px_rgba(0,0,0,0.9)] hover:brightness-110 border-t-white/20 border-b-black">
             <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
             →
          </button>
          <button onPointerDown={(e) => { e.preventDefault(); hardDrop(); }} className="col-span-4 h-14 relative overflow-hidden rounded-xl bg-gradient-to-b from-[#10b981] to-[#064E3B] border border-black/80 flex items-center justify-center text-white transition active:scale-95 active:translate-y-[2px] text-xs font-bold font-display tracking-[4px] shadow-[inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-4px_4px_rgba(0,0,0,0.6),0_5px_15px_rgba(16,185,129,0.5)] uppercase hover:brightness-110 border-t-white/50 border-b-black text-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
             <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
             <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">DROP</span>
          </button>
        </div>
      </div>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {tutorialStep > 0 && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="absolute inset-0 z-50 bg-obsidian/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
             onClick={handleNextTutorial}
          >
             <motion.div initial={{ y: 20 }} animate={{ y: 0 }} key={tutorialStep} className="bg-[rgba(255,255,255,0.03)] border border-emerald-900 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-3xl p-8 max-w-xs w-full flex flex-col items-center text-center">
                 <div className="w-32 h-32 mb-8 flex items-center justify-center relative">
                    {tutorialStep === 1 && (
                      <motion.div initial={{y:-60, opacity: 0}} animate={{y:0, opacity: 1}} transition={{type: 'spring', bounce: 0.5}} className="grid grid-cols-2 gap-[1px] w-[80px] h-[80px]">
                         <Tile data={MOCK_TILE as any}/>
                         <Tile data={MOCK_TILE as any}/>
                         <Tile data={MOCK_TILE as any}/>
                         <Tile data={MOCK_TILE as any}/>
                      </motion.div>
                    )}
                    {tutorialStep === 2 && (
                      <motion.div animate={{scale: [1, 1.1, 1]}} transition={{repeat: Infinity, duration: 1.5}} className="flex gap-[1px] w-[120px] h-[40px]">
                         <Tile data={{...MOCK_TILE, isRemoving: true} as any}/>
                         <Tile data={{...MOCK_TILE, isRemoving: true} as any}/>
                         <Tile data={{...MOCK_TILE, isRemoving: true} as any}/>
                      </motion.div>
                    )}
                    {tutorialStep === 3 && (
                      <motion.div animate={{scale: [1, 0, 1], opacity: [1, 0, 1]}} transition={{repeat: Infinity, duration: 1}} className="grid gap-[1px] grid-cols-3 grid-rows-3 w-[120px] h-[120px]">
                         {Array(9).fill(0).map((_, i) => <Tile key={i} data={{...MOCK_TILE, color: 'blue', isBlasting: true} as any}/>)}
                      </motion.div>
                    )}
                 </div>
                 
                 <h3 className="text-xl font-display text-emerald-light italic mb-2 tracking-[1px]">
                   {tutorialStep === 1 && "Stack with purpose."}
                   {tutorialStep === 2 && "Match the stones to Fracture the grid."}
                   {tutorialStep === 3 && "Color chains clear the chaos."}
                 </h3>
                 <p className="text-stone-text text-sm mb-6 max-w-[200px] leading-relaxed">
                   {tutorialStep === 1 && "The blocks are falling. Position them carefully."}
                   {tutorialStep === 2 && "Three matching symbols will trigger a fracture."}
                   {tutorialStep === 3 && "Fractures blast adjacent tiles of the same color."}
                 </p>
                 <p className="text-[10px] text-stone-text uppercase tracking-[3px] opacity-70 animate-pulse">Tap to continue</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {isShopOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShopOpen(false)}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-4"
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="bg-obsidian border border-emerald-900 shadow-2xl rounded-t-3xl rounded-b-xl w-full max-w-sm mx-auto p-6 flex flex-col gap-6"
            >
              <div className="text-center pb-4 border-b border-white/5">
                <h2 className="text-xl font-display text-emerald-light flex items-center justify-center gap-2 italic uppercase tracking-widest">
                  <Diamond size={18} /> Supporters Vault
                </h2>
                <p className="text-[10px] text-stone-text mt-2 uppercase tracking-widest">Trade Shards for Oracle Hints</p>
              </div>

              <div className="flex flex-col gap-3">
                <button className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-xl py-3 px-4 w-full flex items-center justify-between hover:bg-[rgba(255,255,255,0.08)] transition">
                  <div className="flex items-center gap-2">
                     <Diamond size={14} className="text-emerald-400" />
                     <span className="font-bold text-sm tracking-wide">3 Oracle Hints</span>
                  </div>
                  <span className="text-emerald-light font-mono text-sm">$0.99</span>
                </button>
                <button className="bg-[rgba(6,78,59,0.3)] border border-emerald-500/30 shadow-[0_0_20px_rgba(6,78,59,0.2)] rounded-xl py-3 px-4 w-full flex items-center justify-between hover:bg-[rgba(6,78,59,0.5)] transition">
                  <div className="flex items-center gap-2">
                     <Diamond size={14} className="text-emerald-400" />
                     <span className="font-bold text-sm tracking-wide">Infinite Hints (24h)</span>
                  </div>
                  <span className="font-mono text-white text-sm">$3.99</span>
                </button>
              </div>
              <button className="text-[10px] uppercase tracking-widest text-stone-text hover:text-emerald-light transition mt-2 mb-2 p-2" onClick={() => setIsShopOpen(false)}>Close Vault</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
