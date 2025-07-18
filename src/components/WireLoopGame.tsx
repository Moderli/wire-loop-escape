import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from './game/GameScene';
import { MenuScene } from './game/MenuScene';
import { GameHUD } from './GameHUD';
import { LevelSelector } from './LevelSelector';
import { Button } from '@/components/ui/button';
import { RotateCcw, Home, Settings } from 'lucide-react';

interface GameStats {
  time: number;
  collisions: number;
  level: number;
  score: number;
}

export const WireLoopGame = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'levelSelect' | 'gameOver'>('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameStats, setGameStats] = useState<GameStats>({
    time: 0,
    collisions: 0,
    level: 1,
    score: 0
  });
  const [showCollisionFlash, setShowCollisionFlash] = useState(false);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#0a0a1a',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },
      scene: [MenuScene, GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
          width: 400,
          height: 300
        },
        max: {
          width: 1200,
          height: 900
        }
      }
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    // Listen for game events
    game.events.on('gameStateChange', (state: string) => {
      setGameState(state as any);
    });

    game.events.on('statsUpdate', (stats: GameStats) => {
      setGameStats(stats);
    });

    game.events.on('collision', () => {
      setShowCollisionFlash(true);
      setTimeout(() => setShowCollisionFlash(false), 300);
    });

    game.events.on('levelComplete', () => {
      setGameState('levelSelect');
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  const startGame = (level: number = 1) => {
    setCurrentLevel(level);
    setGameState('playing');
    if (phaserGameRef.current) {
      phaserGameRef.current.events.emit('startLevel', level);
    }
  };

  const resetLevel = () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.events.emit('resetLevel');
    }
  };

  const goToMenu = () => {
    setGameState('menu');
    if (phaserGameRef.current) {
      phaserGameRef.current.events.emit('goToMenu');
    }
  };

  const goToLevelSelect = () => {
    setGameState('levelSelect');
  };

  return (
    <div className="relative w-full h-screen bg-game-background overflow-hidden">
      {/* Collision Flash Overlay */}
      {showCollisionFlash && (
        <div className="absolute inset-0 bg-collision animate-collision-flash pointer-events-none z-50" />
      )}

      {/* Game Canvas Container */}
      <div 
        ref={gameRef} 
        className="absolute inset-0 flex items-center justify-center"
        style={{ filter: gameState === 'playing' ? 'none' : 'blur(2px)' }}
      />

      {/* Menu Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-8 p-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-glow gradient-primary bg-clip-text text-transparent">
                Wire Loop Escape
              </h1>
              <p className="text-xl text-muted-foreground">
                Navigate the loop without touching the wire
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => startGame(1)}
                size="lg"
                className="text-lg px-8 py-4 glow-primary"
              >
                Start Game
              </Button>
              
              <div className="space-x-4">
                <Button 
                  onClick={goToLevelSelect}
                  variant="outline"
                  className="text-lg"
                >
                  Level Select
                </Button>
                <Button 
                  variant="outline"
                  className="text-lg"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Selector Overlay */}
      {gameState === 'levelSelect' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <LevelSelector 
            onLevelSelect={startGame}
            onBack={goToMenu}
            currentLevel={currentLevel}
          />
        </div>
      )}

      {/* Game HUD */}
      {gameState === 'playing' && (
        <>
          <GameHUD stats={gameStats} />
          
          {/* Game Controls */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              onClick={resetLevel}
              variant="outline"
              size="sm"
              className="glow-primary"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={goToMenu}
              variant="outline"
              size="sm"
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8">
            <h2 className="text-4xl font-bold text-primary">Level Complete!</h2>
            <div className="space-y-2 text-lg">
              <p>Time: {gameStats.time.toFixed(1)}s</p>
              <p>Collisions: {gameStats.collisions}</p>
              <p className="text-primary font-bold">Score: {gameStats.score}</p>
            </div>
            
            <div className="space-x-4">
              <Button 
                onClick={() => startGame(currentLevel + 1)}
                className="glow-primary"
              >
                Next Level
              </Button>
              <Button 
                onClick={resetLevel}
                variant="outline"
              >
                Retry
              </Button>
              <Button 
                onClick={goToMenu}
                variant="outline"
              >
                Menu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};