import { Timer, Zap, Target, Trophy } from 'lucide-react';

interface GameStats {
  time: number;
  collisions: number;
  level: number;
  score: number;
}

interface GameHUDProps {
  stats: GameStats;
}

export const GameHUD = ({ stats }: GameHUDProps) => {
  const formatTime = (time: number) => {
    return time.toFixed(1) + 's';
  };

  return (
    <div className="absolute top-4 left-4 right-4 md:right-auto flex flex-row md:flex-col md:space-y-3 space-x-2 md:space-x-0 justify-around md:justify-start">
      {/* Level */}
      <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-2 py-1 md:px-3 md:py-2 rounded-lg border glow-primary">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-xs md:text-sm font-medium">Level {stats.level}</span>
      </div>

      {/* Time */}
      <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-2 py-1 md:px-3 md:py-2 rounded-lg border">
        <Timer className="w-4 h-4 text-accent" />
        <span className="text-xs md:text-sm font-mono">{formatTime(stats.time)}</span>
      </div>
    </div>
  );
};