import React from 'react';
import { GridData, ActivePiece, COLS, ROWS } from '../hooks/useGameEngine';
import { Tile } from './Tile';

interface BoardProps {
  grid: GridData;
  activePiece: ActivePiece | null;
  hintPiece?: ActivePiece | null;
}

export const Board: React.FC<BoardProps> = ({ grid, activePiece, hintPiece }) => {
  // Combine grid and active pieces for rendering
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
    <div className="relative border-2 border-emerald-900 border-opacity-70 bg-obsidian overflow-hidden touch-none h-full w-full max-w-[360px] flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
      <div 
        className="grid w-full h-full" 
        style={{ 
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))` 
        }}
      >
        {renderGrid.map((row, r) =>
          row.map((tile, c) => (
            <div key={`${r}-${c}`} className="w-full h-full border-[0.5px] border-emerald-900/10">
              <Tile data={tile} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
