import React from 'react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { TileData } from '../hooks/useGameEngine';

interface TileProps {
  data: TileData | null;
  className?: string;
}

export const Tile: React.FC<TileProps> = ({ data, className }) => {
  if (!data) return <div className={clsx("w-full h-full", className)} />;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: data.isRemoving ? 1.2 : data.isBlasting ? 0 : 1, 
        opacity: data.isRemoving ? 0 : data.isBlasting ? 0 : data.isHint ? 0.6 : 1,
        rotate: data.isRemoving ? [0, -10, 10, -10, 0] : 0
      }}
      transition={{ duration: data.isRemoving || data.isBlasting ? 0.3 : 0.15 }}
      style={{
        background: data.isRemoving || data.isHint
          ? 'linear-gradient(135deg, var(--emerald) 0%, #064E3B 100%)' 
          : 'var(--obsidian)',
        borderColor: data.isRemoving || data.isHint ? 'var(--emerald-light)' : '#064E3B', // faint emerald
        borderWidth: data.isHint ? '2px' : '1px',
        borderStyle: data.isHint ? 'dashed' : 'solid',
        boxShadow: data.isRemoving || data.isHint ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none',
      }}
      className={clsx(
        "w-full h-full rounded-[2px] relative flex items-center justify-center font-display",
        data.isHint && "animate-pulse z-20",
        data.isRemoving ? "text-white animate-pulse z-10" : "text-emerald-light",
        data.isBlasting && "brightness-200 z-10",
        className
      )}
    >
      <span className={clsx("drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] brightness-125 select-none", className?.includes('text-') ? "" : "text-xl")}>
        {data.symbol}
      </span>
    </motion.div>
  );
};
