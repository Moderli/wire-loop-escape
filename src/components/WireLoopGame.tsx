import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { useIsMobile } from '@/hooks/use-mobile';
import { GameScene } from './game/GameScene';
import { MenuScene } from './game/MenuScene';
import { GameHUD } from './GameHUD';
import { LevelSelector } from './LevelSelector';
import { Button } from '@/components/ui/button';
import { RotateCcw, Home, Settings } from 'lucide-react';
import { LevelData } from '@/lib/types';

// Dynamically import all levels to get their data
const levelModules = import.meta.glob('/src/levels/level*.ts', { eager: true });
const allLevels: LevelData[] = Object.values(levelModules).map((module: any) => {
  const key = Object.keys(module).find(k => k.startsWith('level'));
  return key ? module[key] : null;
}).filter(Boolean);

const totalLevels = allLevels.length;

interface GameStats {
  time: number;
  collisions: number;
  level: number;
  score: number;
}

interface WireLoopGameProps {
  nickname: string;
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
}

export const WireLoopGame = ({ nickname, currentLevel, setCurrentLevel }: WireLoopGameProps) => {
  const navigate = useNavigate();
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'levelSelect' | 'gameOver'>('playing');
  const [gameStats, setGameStats] = useState<GameStats>({
    time: 0,
    collisions: 0,
    level: currentLevel,
    score: 0
  });
  const [showCollisionFlash, setShowCollisionFlash] = useState(false);
  const isMobile = useIsMobile();
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    // Destroy the existing game instance if it exists
    if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
    }

    const gameContainer = gameRef.current;
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    gameContainer.addEventListener('contextmenu', handleContextMenu);

    // Request fullscreen when the game starts
    const requestFullscreen = () => {
      if (isMobile) {
        // For mobile devices, try multiple fullscreen methods
        const elem = document.documentElement; // Use document.documentElement instead of gameContainer for better fullscreen
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(err => console.log('requestFullscreen failed:', err));
        } else if ((elem as any).webkitRequestFullscreen) {
          (elem as any).webkitRequestFullscreen().catch(err => console.log('webkitRequestFullscreen failed:', err));
        } else if ((elem as any).mozRequestFullScreen) {
          (elem as any).mozRequestFullScreen().catch(err => console.log('mozRequestFullScreen failed:', err));
        } else if ((elem as any).msRequestFullscreen) {
          (elem as any).msRequestFullscreen().catch(err => console.log('msRequestFullscreen failed:', err));
        }
        
        // Also try to lock orientation to landscape on mobile
        if ('orientation' in screen && 'lock' in screen.orientation) {
          (screen.orientation as any).lock('landscape').catch(err => console.log('Orientation lock failed:', err));
        }
        
        // Also try to hide the address bar on mobile
        setTimeout(() => {
          window.scrollTo(0, 1);
        }, 100);
      }
      // Removed desktop fullscreen functionality
    };

    // Add multiple event listeners for better mobile detection
    if (isMobile) {
      gameContainer.addEventListener('click', requestFullscreen, { once: true });
      gameContainer.addEventListener('touchstart', requestFullscreen, { once: true });
      gameContainer.addEventListener('touchend', requestFullscreen, { once: true });
      // Also trigger on any interaction with the page
      document.addEventListener('touchstart', requestFullscreen, { once: true });
    }

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

    // Pass initial data to the scene
    game.scene.start('GameScene', { nickname: nickname, level: currentLevel });

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
      setGameState('gameOver');
    });

    game.events.on('gameLoss', (message: string) => {
      setMotivationalMessage(message);
      setGameState('gameOver'); // We'll use gameOver state for both win and loss
    });

    return () => {
      game.destroy(true);
      gameContainer.removeEventListener('contextmenu', handleContextMenu);
      if (isMobile) {
        gameContainer.removeEventListener('click', requestFullscreen);
        gameContainer.removeEventListener('touchstart', requestFullscreen);
        gameContainer.removeEventListener('touchend', requestFullscreen);
        document.removeEventListener('touchstart', requestFullscreen);
      }
    };
  }, [currentLevel, isMobile]);

  const startGame = (level: number) => {
    setCurrentLevel(level);
    setGameState('playing');
    setMotivationalMessage(''); // Clear any motivational message when starting a new game
    if (phaserGameRef.current) {
      phaserGameRef.current.events.emit('startLevel', level);
    }
  };

  const resetLevel = () => {
    setMotivationalMessage(''); // Clear motivational message when resetting
    setGameState('playing'); // Reset to playing state
    startGame(currentLevel);
  };

  const goToMenu = () => {
    navigate('/');
  };

  const goToLevelSelect = () => {
    setGameState('levelSelect');
  };

  if (isMobile && !isLandscape) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background text-center p-4">
        <h2 className="text-xl text-primary">Please rotate your device to landscape mode to play.</h2>
      </div>
    );
  }

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

      {/* Fullscreen prompt */}
      {/* Removed fullscreen prompt - now automatically goes fullscreen on first touch */}

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
              onClick={goToLevelSelect}
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
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50">
          <div className="text-center space-y-6 p-8 max-w-md mx-auto">
            {motivationalMessage ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-red-400">You Lost!</h2>
                <p className="text-xl md:text-2xl text-yellow-300 font-medium">{motivationalMessage}</p>
                <div className="space-y-2 text-base md:text-lg">
                  <p>Time: {gameStats.time.toFixed(1)}s</p>
                  <p>Level: {gameStats.level}</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
                  <Button 
                    onClick={resetLevel}
                    className="glow-primary w-full md:w-auto px-8 py-3 text-lg"
                    size="lg"
                  >
                    Retry
                  </Button>
                  <Button 
                    onClick={goToLevelSelect}
                    variant="outline"
                    className="w-full md:w-auto px-6 py-3"
                    size="lg"
                  >
                    Level Select
                  </Button>
                  <Button 
                    onClick={goToMenu}
                    variant="outline"
                    className="w-full md:w-auto px-6 py-3"
                    size="lg"
                  >
                    Menu
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Level Complete!</h2>
                <div className="space-y-2 text-base md:text-lg">
                  <p>Time: {gameStats.time.toFixed(1)}s</p>
                  <p>Level: {gameStats.level}</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
                  {currentLevel < totalLevels ? (
                    <Button 
                      onClick={() => startGame(currentLevel + 1)}
                      className="glow-primary w-full md:w-auto px-8 py-3 text-lg"
                      size="lg"
                    >
                      Next Level
                    </Button>
                  ) : (
                    <Button 
                      onClick={goToLevelSelect} 
                      className="glow-primary w-full md:w-auto px-8 py-3 text-lg"
                      size="lg"
                    >
                      Select Level
                    </Button>
                  )}
                  <Button 
                    onClick={() => setCurrentLevel(currentLevel)}
                    variant="outline"
                    className="w-full md:w-auto px-6 py-3"
                    size="lg"
                  >
                    Retry
                  </Button>
                  <Button 
                    onClick={goToMenu}
                    variant="outline"
                    className="w-full md:w-auto px-6 py-3"
                    size="lg"
                  >
                    Menu
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};