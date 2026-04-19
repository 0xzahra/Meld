import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronLeft, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Vault = () => {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const navigate = useNavigate();

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setUnlocked(true);
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const highscore = localStorage.getItem('meld_highscore') || '0';

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col items-center p-6 font-sans relative w-full h-[100dvh]">
      <header className="w-full max-w-md mb-12 flex items-center relative z-10">
        <button onClick={() => navigate('/')} className="absolute left-0 p-2 text-stone-text hover:text-emerald-light transition">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-display text-[24px] tracking-[4px] text-emerald-light uppercase italic">System Vault</h1>
      </header>

      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center z-10">
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.form 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleUnlock}
              className="glass-panel w-full"
            >
              <div className="mx-auto w-20 h-20 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center border border-[rgba(16,185,129,0.2)] shadow-[0_0_30px_rgba(6,78,59,0.3)] mb-6">
                <Lock size={32} className="text-emerald-light" />
              </div>
              
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-[10px] uppercase tracking-[2px] text-stone-text opacity-80">Vault Passcode</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-light transition font-mono tracking-widest text-center text-xl"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              
              <button 
                type="submit"
                className="btn btn-primary w-full text-[12px] py-4 shadow-lg"
              >
                Authenticate
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel w-full flex flex-col gap-6"
            >
              <div className="flex items-center gap-3 text-emerald-light mb-2">
                <Database size={20} />
                <h2 className="text-lg font-display uppercase tracking-[2px]">Local Metrics</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[rgba(255,255,255,0.02)] border border-glass-border rounded-xl p-4 flex flex-col gap-2">
                  <span className="text-[10px] text-stone-text uppercase tracking-widest">High Score</span>
                  <span className="text-2xl font-display text-white">{highscore}</span>
                </div>
                
                <div className="bg-[rgba(255,255,255,0.02)] border border-glass-border rounded-xl p-4 flex flex-col gap-2">
                  <span className="text-[10px] text-stone-text uppercase tracking-widest">Games Played</span>
                  <span className="text-2xl font-display text-white">N/A</span>
                </div>
                
                <div className="bg-[rgba(255,255,255,0.02)] border border-glass-border rounded-xl p-4 flex flex-col gap-2 col-span-2">
                  <span className="text-[10px] text-stone-text uppercase tracking-widest">Game Constants</span>
                  <div className="text-xs font-mono text-emerald-light/70 space-y-1 mt-2">
                    <p>GRID_WIDTH: 10</p>
                    <p>GRID_HEIGHT: 20</p>
                    <p>COLORS: 5</p>
                    <p>SYMBOLS: 5</p>
                    <p>FRACTURE_THRESH: 3</p>
                  </div>
                </div>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
