import React from 'react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { TileData } from '../hooks/useGameEngine';

interface TileProps {
  data: TileData | null;
  className?: string;
}

export const Tile: React.FC<TileProps> = ({ data, className }) => {
  if (!data) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: data.isRemoving ? 1.15 : data.isBlasting ? 0 : 1, 
        opacity: data.isRemoving ? 0 : data.isBlasting ? 0 : data.isHint ? 0.6 : 1,
        rotate: data.isRemoving ? [0, -5, 5, -5, 0] : 0
      }}
      transition={{ duration: data.isRemoving || data.isBlasting ? 0.25 : 0.1 }}
      style={{
        background: data.isRemoving || data.isHint
          ? 'linear-gradient(135deg, #10b981 0%, #064E3B 100%)' 
          : 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
        boxShadow: data.isRemoving || data.isHint
          ? 'inset 0 2px 2px rgba(255,255,255,0.6), inset 0 -4px 4px rgba(0,0,0,0.4), 0 2px 8px rgba(16,185,129,0.8)'
          : 'inset 0 2px 3px rgba(255,255,255,0.15), inset 0 -4px 4px rgba(0,0,0,0.9), 0 3px 5px rgba(0,0,0,0.6)',
        border: '1px solid rgba(0,0,0,0.8)',
        borderTop: data.isRemoving || data.isHint 
          ? '1px solid rgba(255,255,255,0.6)' 
          : '1px solid rgba(255,255,255,0.15)',
        borderBottom: '1px solid rgba(0,0,0,1)',
      }}
      className={clsx(
        "w-full h-full rounded-[4px] relative flex items-center justify-center font-display shadow-md overflow-hidden",
        data.isHint && "animate-pulse z-20",
        data.isRemoving ? "text-white z-10" : "text-emerald-300",
        data.isBlasting && "brightness-200 z-10",
        className
      )}
    >
      <span className={clsx(
        "drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] select-none", 
        data.isRemoving || data.isHint ? "brightness-150" : "brightness-100",
        className?.includes('text-') ? "" : "text-[clamp(12px,2.5vh,20px)] sm:text-xl font-bold"
      )}>
        {data.symbol}
      </span>
      {/* 3D Glossy top highlight overlay */}
      <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-white/10 to-transparent rounded-t-[3px] pointer-events-none" />
    </motion.div>
  );
};
