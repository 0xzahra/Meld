import { useState, useCallback, useEffect, useRef } from 'react';

export type SymbolType = '🎋' | '🐲' | '🌸' | '☀️' | '🌑';
export type ColorType = 'red' | 'blue' | 'emerald' | 'amber' | 'purple';

export interface TileData {
  id: string;
  symbol: SymbolType;
  color: ColorType;
  isRemoving?: boolean;
  isBlasting?: boolean;
  isHint?: boolean;
}

export type GridData = (TileData | null)[][]; // [row][col]
export const ROWS = 20;
export const COLS = 10;

const SYMBOLS: SymbolType[] = ['🎋', '🐲', '🌸', '☀️', '🌑'];
const COLORS: ColorType[] = ['red', 'blue', 'emerald', 'amber', 'purple'];

const getRandomElem = <T, >(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Tetromino definitions
const TETROMINOS = [
  // I
  [{x:0,y:-1}, {x:0,y:0}, {x:0,y:1}, {x:0,y:2}],
  // O
  [{x:0,y:0}, {x:1,y:0}, {x:0,y:1}, {x:1,y:1}],
  // T
  [{x:-1,y:0}, {x:0,y:0}, {x:1,y:0}, {x:0,y:-1}],
  // S
  [{x:0,y:0}, {x:1,y:0}, {x:-1,y:1}, {x:0,y:1}],
  // Z
  [{x:-1,y:0}, {x:0,y:0}, {x:0,y:1}, {x:1,y:1}],
  // J
  [{x:0,y:-1}, {x:0,y:0}, {x:0,y:1}, {x:-1,y:1}],
  // L
  [{x:0,y:-1}, {x:0,y:0}, {x:0,y:1}, {x:1,y:1}],
];

export interface ActivePiece {
  x: number;
  y: number;
  shape: {x: number, y: number}[];
  tiles: TileData[];
}

const generateTile = (): TileData => ({
  id: Math.random().toString(36).substring(2, 9),
  symbol: getRandomElem(SYMBOLS),
  color: getRandomElem(COLORS),
});

const generatePiece = (): ActivePiece => {
  const shape = getRandomElem(TETROMINOS);
  const tiles = shape.map(() => generateTile());
  return { x: 4, y: 0, shape, tiles };
};

const isValidPos = (piece: ActivePiece, currentGrid: GridData) => {
  return piece.shape.every((cell) => {
    const gridX = piece.x + cell.x;
    const gridY = piece.y + cell.y;
    if (gridX < 0 || gridX >= COLS || gridY >= ROWS) return false;
    if (gridY >= 0 && currentGrid[gridY][gridX]) return false;
    return true;
  });
};

const calculateOptimalDrop = (grid: GridData, piece: ActivePiece): ActivePiece | null => {
  let bestPiece: ActivePiece | null = null;
  let bestScore = -Infinity;

  for (let c = -4; c < COLS + 4; c++) {
    let testPiece = { ...piece, x: c, y: 0 };
    for (let r = 0; r < 4; r++) {
      if (isValidPos(testPiece, grid)) {
         let dropPiece = { ...testPiece };
         while (isValidPos({ ...dropPiece, y: dropPiece.y + 1 }, grid)) {
           dropPiece.y += 1;
         }
         
         let score = dropPiece.y;
         dropPiece.shape.forEach((cell, i) => {
            const gx = dropPiece.x + cell.x;
            const gy = dropPiece.y + cell.y;
            const sym = dropPiece.tiles[i].symbol;
            
            [[0,1],[1,0],[-1,0],[0,-1]].forEach(([dx, dy]) => {
               const nx = gx + dx;
               const ny = gy + dy;
               if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && grid[ny][nx]) {
                  score += 10; 
                  if (grid[ny][nx]?.symbol === sym) score += 500;
               }
            });
         });

         if (score > bestScore) {
           bestScore = score;
           bestPiece = dropPiece;
         }
      }
      testPiece = { ...testPiece, shape: testPiece.shape.map(cell => ({ x: -cell.y, y: cell.x })) };
    }
  }
  return bestPiece;
};

export function useGameEngine(onPlaySound: (sound: 'drop' | 'slide' | 'fracture' | 'blast' | 'win') => void) {
  const [grid, setGrid] = useState<GridData>(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintPiece, setHintPiece] = useState<ActivePiece | null>(null);
  const lastMoveTimeRef = useRef(Date.now());
  
  const scoreRef = useRef(0);
  useEffect(() => { 
    scoreRef.current = score; 
    setLevel(Math.floor(score / 1500) + 1);
  }, [score]);

  // Initial load
  useEffect(() => {
    setActivePiece(generatePiece());
  }, []);

  const updateIdle = useCallback(() => {
    lastMoveTimeRef.current = Date.now();
    setHintPiece(null);
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      if (!gameOver && !isProcessing && activePiece && !hintPiece && hintsRemaining > 0) {
        if (Date.now() - lastMoveTimeRef.current > 5000) {
            const best = calculateOptimalDrop(grid, activePiece);
            if (best) {
              setHintPiece(best);
              setHintsRemaining(h => h - 1);
            }
        }
      }
    }, 1000);
    return () => clearInterval(i);
  }, [gameOver, isProcessing, activePiece, grid, hintPiece, hintsRemaining]);

  const processMatches = useCallback(async (currentGrid: GridData) => {
    let nextGrid = currentGrid.map(r => [...r]);
    let hasMatches = false;

    // 1. Find Mahjong Matches (connected by symbol)
    const visited = Array.from({length: ROWS}, () => Array(COLS).fill(false));
    let toFracture: {r: number, c: number}[] = [];
    
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (nextGrid[r][c] && !visited[r][c]) {
          const sym = nextGrid[r][c]!.symbol;
          const component: {r: number, c: number}[] = [];
          const queue = [{r, c}];
          visited[r][c] = true;

          let head = 0;
          while (head < queue.length) {
            const {r: currR, c: currC} = queue[head++];
            component.push({r: currR, c: currC});
            
            const neighbors = [[currR-1,currC],[currR+1,currC],[currR,currC-1],[currR,currC+1]];
            for (const [nr, nc] of neighbors) {
              if (nr>=0 && nr<ROWS && nc>=0 && nc<COLS && nextGrid[nr][nc] && !visited[nr][nc]) {
                if (nextGrid[nr][nc]!.symbol === sym) {
                  visited[nr][nc] = true;
                  queue.push({r: nr, c: nc});
                }
              }
            }
          }
          if (component.length >= 3) {
            toFracture.push(...component);
          }
        }
      }
    }

    if (toFracture.length > 0) {
      hasMatches = true;
      onPlaySound('fracture');
      setScore(s => s + toFracture.length * 10);
      
      // Mark as fracturing for animation
      for (const {r, c} of toFracture) {
        nextGrid[r][c] = { ...nextGrid[r][c]!, isRemoving: true };
      }
      setGrid(nextGrid.map(r => [...r]));
      
      await new Promise(res => setTimeout(res, 400));
      
      // 2. Determine Bubble Blast (connected by color to any fractured tile)
      let toBlast: {r: number, c: number}[] = [];
      const blastVisited = Array.from({length: ROWS}, () => Array(COLS).fill(false));
      
      // To ensure we only blast connected colors *from* the fractured tiles
      for (const frac of toFracture) {
        const color = nextGrid[frac.r][frac.c]?.color;
        if (!color || blastVisited[frac.r][frac.c]) continue;
        
        const q = [{r: frac.r, c: frac.c}];
        blastVisited[frac.r][frac.c] = true;
        
        while (q.length > 0) {
          const {r: currR, c: currC} = q.shift()!;
          toBlast.push({r: currR, c: currC});
          
          const neighbors = [[currR-1,currC],[currR+1,currC],[currR,currC-1],[currR,currC+1]];
          for (const [nr, nc] of neighbors) {
            if (nr>=0 && nr<ROWS && nc>=0 && nc<COLS && nextGrid[nr][nc] && !blastVisited[nr][nc]) {
              if (nextGrid[nr][nc]!.color === color) {
                blastVisited[nr][nc] = true;
                q.push({r: nr, c: nc});
              }
            }
          }
        }
      }
      
      // Some tiles might be both fractured and blasted, handle nicely
      if (toBlast.length > toFracture.length) {
        onPlaySound('blast');
        setScore(s => s + (toBlast.length - toFracture.length) * 20);
        
        // Mark as blasting
        for (const {r, c} of toBlast) {
          if (!toFracture.find(f => f.r===r && f.c===c)) { // Only if not already fractured
             nextGrid[r][c] = { ...nextGrid[r][c]!, isBlasting: true };
          }
        }
        setGrid(nextGrid.map(r => [...r]));
        await new Promise(res => setTimeout(res, 400));
      }

      // Remove tiles
      for (const {r, c} of toBlast) {
        nextGrid[r][c] = null;
      }
      
      // 3. Gravity falls
      let movedDown = true;
      while (movedDown) {
        movedDown = false;
        for (let c = 0; c < COLS; c++) {
          // Bottom-up 
          for (let r = ROWS - 2; r >= 0; r--) {
            if (nextGrid[r][c] !== null && nextGrid[r+1][c] === null) {
              nextGrid[r+1][c] = nextGrid[r][c];
              nextGrid[r][c] = null;
              movedDown = true;
            }
          }
        }
      }
      setGrid(nextGrid.map(r => [...r]));
      
      // Recursive match check
      await new Promise(res => setTimeout(res, 200));
      await processMatches(nextGrid);
    } else {
      setIsProcessing(false);
      setGrid(nextGrid);
      const hs = parseInt(localStorage.getItem('meld_highscore') || '0', 10);
      if (scoreRef.current > hs) {
        localStorage.setItem('meld_highscore', scoreRef.current.toString());
        onPlaySound('win');
      }
      setActivePiece(generatePiece());
      updateIdle();
    }
  }, [onPlaySound, updateIdle]);

  const lockPiece = useCallback(() => {
    if (!activePiece) return;
    onPlaySound('drop');
    const newGrid = grid.map(r => [...r]);
    let over = false;
    
    activePiece.shape.forEach((cell, idx) => {
      const x = activePiece.x + cell.x;
      const y = activePiece.y + cell.y;
      if (y < 0) {
        over = true;
      } else if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        newGrid[y][x] = activePiece.tiles[idx];
      }
    });

    if (over) {
      setGameOver(true);
      setActivePiece(null);
    } else {
      setIsProcessing(true);
      setActivePiece(null); // hide piece
      processMatches(newGrid);
    }
  }, [activePiece, grid, processMatches, onPlaySound]);


  const movePiece = useCallback((dx: number, dy: number) => {
    if (gameOver || isProcessing || !activePiece) return false;
    
    const newPiece = { ...activePiece, x: activePiece.x + dx, y: activePiece.y + dy };
    if (isValidPos(newPiece, grid)) {
      if (dx !== 0) onPlaySound('slide');
      setActivePiece(newPiece);
      updateIdle();
      return true;
    } else if (dy > 0) {
      lockPiece();
    }
    return false;
  }, [activePiece, grid, lockPiece, gameOver, isProcessing, onPlaySound, updateIdle]);

  const rotatePiece = useCallback(() => {
    if (gameOver || isProcessing || !activePiece) return;
    
    // Rotate shape (x,y) -> (-y, x)
    const newShape = activePiece.shape.map(c => ({ x: -c.y, y: c.x }));
    const newPiece = { ...activePiece, shape: newShape };
    
    if (isValidPos(newPiece, grid)) {
      onPlaySound('slide');
      setActivePiece(newPiece);
      updateIdle();
    }
  }, [activePiece, grid, gameOver, isProcessing, onPlaySound, updateIdle]);

  const hardDrop = useCallback(() => {
    if (gameOver || isProcessing || !activePiece) return;
    let newPiece = { ...activePiece };
    while (isValidPos({ ...newPiece, y: newPiece.y + 1 }, grid)) {
      newPiece.y += 1;
    }
    
    onPlaySound('drop');
    let over = false;
    const newGrid = grid.map(r => [...r]);
    newPiece.shape.forEach((cell, idx) => {
      const x = newPiece.x + cell.x;
      const y = newPiece.y + cell.y;
      if (y < 0) {
        over = true;
      } else if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        newGrid[y][x] = newPiece.tiles[idx];
      }
    });

    updateIdle();

    if (over) {
      setGameOver(true);
      setActivePiece(null);
    } else {
      setIsProcessing(true);
      setActivePiece(null);
      processMatches(newGrid);
    }
  }, [activePiece, grid, processMatches, gameOver, isProcessing, onPlaySound, updateIdle]);

  // Gravity Loop
  useEffect(() => {
    if (gameOver || isProcessing) return;
    const interval = setInterval(() => {
      movePiece(0, 1);
    }, Math.max(200, 800 - (level * 50)));
    return () => clearInterval(interval);
  }, [movePiece, gameOver, isProcessing, level]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') movePiece(-1, 0);
      else if (e.key === 'ArrowRight') movePiece(1, 0);
      else if (e.key === 'ArrowDown') movePiece(0, 1);
      else if (e.key === 'ArrowUp') rotatePiece();
      else if (e.key === ' ') { e.preventDefault(); hardDrop(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotatePiece, hardDrop]);

  return {
    grid,
    activePiece,
    hintPiece,
    score,
    level,
    hintsRemaining,
    gameOver,
    isProcessing,
    moveLeft: () => movePiece(-1, 0),
    moveRight: () => movePiece(1, 0),
    moveDown: () => movePiece(0, 1),
    rotate: rotatePiece,
    hardDrop,
    restart: () => {
      setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
      setScore(0);
      setLevel(1);
      setHintsRemaining(3);
      setHintPiece(null);
      setGameOver(false);
      setActivePiece(generatePiece());
      setIsProcessing(false);
      updateIdle();
    }
  };
}
