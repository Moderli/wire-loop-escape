import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelSelectorProps {
  onLevelSelect: (level: number) => void;
  onBack: () => void;
  currentLevel: number;
}

export const LevelSelector = ({ onLevelSelect, onBack, currentLevel }: LevelSelectorProps) => {
  const levels = Array.from({ length: 12 }, (_, i) => i + 1);
  const unlockedLevels = Math.min(currentLevel + 1, 12); // Allow next level

  const getDifficulty = (level: number) => {
    if (level <= 3) return 'Easy';
    if (level <= 6) return 'Medium';
    if (level <= 9) return 'Hard';
    return 'Expert';
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return 'text-green-400';
    if (level <= 6) return 'text-yellow-400';
    if (level <= 9) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStars = (level: number) => {
    // Simulate saved scores - in real app this would come from localStorage
    const savedScore = localStorage.getItem(`wireloop-level-${level}`);
    if (!savedScore) return 0;
    
    const score = parseInt(savedScore);
    if (score >= 1000) return 3;
    if (score >= 500) return 2;
    return 1;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <Button 
          onClick={onBack}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm md:text-base">Back</span>
        </Button>
        
        <h2 className="text-2xl md:text-3xl font-bold text-primary text-glow">
          Select Level
        </h2>
        
        <div /> {/* Spacer */}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {levels.map((level) => {
          const isUnlocked = level <= unlockedLevels;
          const isCompleted = level < currentLevel;
          const stars = getStars(level);
          
          return (
            <div
              key={level}
              className={cn(
                "relative p-4 md:p-6 rounded-lg border-2 transition-all duration-200",
                isUnlocked 
                  ? "bg-card border-primary/50 hover:border-primary hover:glow-primary cursor-pointer" 
                  : "bg-muted/50 border-muted cursor-not-allowed opacity-50"
              )}
              onClick={() => isUnlocked && onLevelSelect(level)}
            >
              {/* Level Number */}
              <div className="text-center mb-4">
                <div className={cn(
                  "text-xl md:text-2xl font-bold mb-2",
                  isUnlocked ? "text-primary" : "text-muted-foreground"
                )}>
                  {isUnlocked ? level : <Lock className="w-6 h-6 mx-auto" />}
                </div>
                
                {isUnlocked && (
                  <>
                    <div className={cn("text-sm font-medium", getDifficultyColor(level))}>
                      {getDifficulty(level)}
                    </div>
                    
                    {/* Stars */}
                    {isCompleted && (
                      <div className="flex justify-center mt-2 space-x-1">
                        {Array.from({ length: 3 }, (_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < stars ? "text-yellow-400 fill-current" : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Level Preview */}
              {isUnlocked && (
                <div className="h-20 border rounded bg-game-background flex items-center justify-center">
                  <div className="text-xs text-muted-foreground">
                    {level <= 3 && "Simple curves"}
                    {level > 3 && level <= 6 && "Moving wires"}
                    {level > 6 && level <= 9 && "Complex paths"}
                    {level > 9 && "Extreme challenge"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 md:mt-8 text-center text-sm text-muted-foreground">
        Complete levels to unlock new challenges. Earn stars based on your performance!
      </div>
    </div>
  );
};