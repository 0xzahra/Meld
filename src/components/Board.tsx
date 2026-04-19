import React from 'react';
import { GridData, ActivePiece, COLS, ROWS } from '../hooks/useGameEngine';
import { Tile } from './Tile';

interface BoardProps {
  grid: GridData;
  activePiece: ActivePiece | null;
  hintPiece?: ActivePiece | null;
}

export const Board: React.FC<BoardProps> = ({ grid, activePiece, hintPiece }) => {
  const renderGrid = grid.map(r => [...r]);
  
  if (hintPiece) {
    hintPiece.shape.forEach((cell, idx) => {
      const x = hintPiece.x + cell.x;
      const y = hintPiece.y + cell.y;
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS && !renderGrid[y][x]) {
        renderGrid[y][x] = { ...hintPiece.tiles[idx], isHint: true };
      }
    });
  }

  if (activePiece) {
    activePiece.shape.forEach((cell, idx) => {
      const x = activePiece.x + cell.x;
      const y = activePiece.y + cell.y;
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        renderGrid[y][x] = activePiece.tiles[idx];
      }
    });
  }

  return (
    <div className="relative h-full aspect-[10/20] mx-auto border-[3px] border-[#0f172a] bg-[#0a111a] rounded-[8px] shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,1)] ring-1 ring-emerald-900/50 flex flex-col p-1 overflow-hidden touch-none">
      <div 
        className="w-full h-full grid gap-[2px]" 
        style={{ 
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))` 
        }}
      >
        {renderGrid.map((row, r) =>
          row.map((tile, c) => (
            <div key={`${r}-${c}`} className="w-full h-full bg-[#020617]/50 rounded-[4px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-white/[0.02]">
              <Tile data={tile} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
