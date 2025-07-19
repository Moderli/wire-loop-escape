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
    <div className="absolute top-4 left-4 space-y-3">
      {/* Level */}
      <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border glow-primary">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Level {stats.level}</span>
      </div>

      {/* Time */}
      <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border">
        <Timer className="w-4 h-4 text-accent" />
        <span className="text-sm font-mono">{formatTime(stats.time)}</span>
      </div>

      {/* Collisions */}
      <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border">
        <Zap className="w-4 h-4 text-collision" />
        <span className="text-sm font-mono">{stats.collisions}</span>
      </div>

      {/* Score */}
      <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border">
        <Trophy className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono">{stats.score}</span>
      </div>
    </div>
  );
};