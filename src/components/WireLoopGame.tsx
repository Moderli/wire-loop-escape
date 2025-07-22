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
import { mobileManager } from '@/utils/mobileUtils';

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
  const [failureReason, setFailureReason] = useState('');
  const [allowPortraitMode, setAllowPortraitMode] = useState(false);
  const [mobileOptimizations, setMobileOptimizations] = useState(mobileManager.optimizeForPerformance());

  useEffect(() => {
    // Initialize mobile optimizations
    const capabilities = mobileManager.getCapabilities();
    const performance = mobileManager.getPerformance();
    
    console.log('Mobile capabilities:', capabilities);
    console.log('Device performance:', performance);
    
    // Apply mobile-specific optimizations
    if (capabilities.hasTouch) {
      mobileManager.preventZoom();
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    // Enhanced orientation handling using mobile manager
    const unsubscribeOrientation = mobileManager.onOrientationChange((orientation) => {
      console.log('Orientation changed to:', orientation);
      
      const newIsLandscape = orientation.includes('landscape') || window.innerWidth > window.innerHeight;
      setIsLandscape(newIsLandscape);
      
      // Reset portrait mode allowance when rotating to landscape
      if (newIsLandscape) {
        setAllowPortraitMode(false);
      }
      
      // Enhanced game resize with error handling
      if (phaserGameRef.current) {
        try {
          // Wait a bit for layout to settle
          setTimeout(() => {
            if (phaserGameRef.current) {
              phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight);
              console.log('Phaser game resized successfully');
            }
          }, 150);
        } catch (error) {
          console.error('Error resizing Phaser game:', error);
        }
      }
    });

    // Handle visibility changes for performance optimization
    const unsubscribeVisibility = mobileManager.onVisibilityChange((visible) => {
      if (phaserGameRef.current) {
        if (visible) {
          console.log('Game became visible');
          // Could resume game here
        } else {
          console.log('Game became hidden');
          // Could pause game here for battery optimization
        }
      }
    });

    return () => {
      unsubscribeOrientation();
      unsubscribeVisibility();
    };
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
        phaserGameRef.current = null;
    }

    const gameContainer = gameRef.current;
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    gameContainer.addEventListener('contextmenu', handleContextMenu);

    // Enhanced fullscreen handling using mobile manager
    const requestFullscreen = async () => {
      if (isMobile) {
        try {
          await mobileManager.requestFullscreen();
          console.log('Fullscreen request successful');
          
          // Try to lock orientation to landscape on mobile
          if ('orientation' in screen && 'lock' in screen.orientation) {
            (screen.orientation as any).lock('landscape').catch((err: Error) => 
              console.log('Orientation lock failed:', err.message)
            );
          }
          
          // Hide the address bar on mobile
          setTimeout(() => {
            window.scrollTo(0, 1);
          }, 100);
          
        } catch (error) {
          console.warn('Fullscreen request failed:', error);
          // Fallback: just try to hide address bar
          setTimeout(() => {
            window.scrollTo(0, 1);
          }, 100);
        }
      }
    };

    // Add multiple event listeners for better mobile detection
    if (isMobile) {
      gameContainer.addEventListener('click', requestFullscreen, { once: true });
      gameContainer.addEventListener('touchstart', requestFullscreen, { once: true });
      gameContainer.addEventListener('touchend', requestFullscreen, { once: true });
      // Also trigger on any interaction with the page
      document.addEventListener('touchstart', requestFullscreen, { once: true });
    }

    // Apply mobile optimizations to Phaser config
    const optimizations = mobileManager.optimizeForPerformance();
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      backgroundColor: '#181c23',
      fps: {
        target: optimizations.targetFPS,
        forceSetTimeOut: true // Better mobile performance
      },
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
        expandParent: false,
        min: {
          width: 320,
          height: 240
        },
        max: {
          width: 12000,
          height: 9000
        }
      },
      render: {
        antialias: optimizations.effectQuality !== 'low',
        pixelArt: false,
        roundPixels: true // Better mobile rendering
      },
      input: {
        activePointers: 1 // Prevent multi-touch issues
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

    game.events.on('gameLoss', (message: string, reason?: string) => {
      setMotivationalMessage(message);
      setFailureReason(reason || '');
      setGameState('gameOver'); // We'll use gameOver state for both win and loss
    });

    return () => {
      console.log('Cleaning up Phaser game and event listeners');
      
      // Properly destroy the game instance
      if (game) {
        try {
          game.destroy(true, false); // destroy, removeCanvas=false for better cleanup
        } catch (error) {
          console.error('Error destroying Phaser game:', error);
        }
      }
      
      // Clean up event listeners
      if (gameContainer) {
        gameContainer.removeEventListener('contextmenu', handleContextMenu);
        if (isMobile) {
          gameContainer.removeEventListener('click', requestFullscreen);
          gameContainer.removeEventListener('touchstart', requestFullscreen);
          gameContainer.removeEventListener('touchend', requestFullscreen);
          document.removeEventListener('touchstart', requestFullscreen);
        }
      }
      
      // Clean up canvas if it exists
      const canvas = gameContainer?.querySelector('canvas');
      if (canvas) {
        canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      }
      
      // Force garbage collection hint (if available)
      if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc();
      }
    };
  }, [currentLevel, isMobile, isLandscape]);

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

  if (isMobile && !isLandscape && !allowPortraitMode) {
    return (
      <div 
        className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm text-center p-4 z-50"
        onClick={() => setAllowPortraitMode(true)}
      >
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl text-primary mb-4">Better Experience in Landscape</h2>
          <p className="text-muted-foreground mb-4">
            For the best gaming experience, please rotate your device to landscape mode.
          </p>
          <div className="text-6xl mb-4">📱↻</div>
        </div>
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
                {failureReason && (
                  <p className="text-base md:text-lg text-red-300 font-semibold mt-2">Reason: {failureReason}</p>
                )}
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
                    onClick={resetLevel}
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