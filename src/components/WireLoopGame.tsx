import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useIsMobile } from '@/hooks/use-mobile';
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

interface WireLoopGameProps {
  nickname: string;
}

export const WireLoopGame = ({ nickname }: WireLoopGameProps) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'levelSelect' | 'gameOver'>('playing');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameStats, setGameStats] = useState<GameStats>({
    time: 0,
    collisions: 0,
    level: 1,
    score: 0
  });
  const [showCollisionFlash, setShowCollisionFlash] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!gameRef.current) return;

    if (isMobile) {
      const handleScroll = () => {
        const elem = gameRef.current;
        if (elem && document.fullscreenElement !== elem) {
          elem.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
        }
      };
      
      window.addEventListener('scroll', handleScroll, { once: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isMobile]);

  useEffect(() => {
    if (!gameRef.current) return;

    const gameContainer = gameRef.current;
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    gameContainer.addEventListener('contextmenu', handleContextMenu);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      backgroundColor: '#181c23',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },
      scene: GameScene, // Start with GameScene only
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
          width: 400,
          height: 300
        },
        max: {
          width: 12000,
          height: 9000
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

    // Start the first level immediately
    game.events.emit('startLevel', 1);
    setCurrentLevel(1);

    return () => {
      game.destroy(true);
      gameContainer.removeEventListener('contextmenu', handleContextMenu);
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
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />

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
          <div className="absolute bottom-4 right-4 md:top-4 md:right-4 flex space-x-2">
            <Button
              onClick={resetLevel}
              variant="outline"
              size="lg"
              className="glow-primary"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
            <Button
              onClick={goToMenu}
              variant="outline"
              size="lg"
            >
              <Home className="w-6 h-6" />
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