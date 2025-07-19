export interface WirePoint {
  x: number;
  y: number;
  z?: number; // Keep z optional for 3D source data
}

export interface LevelData {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number;
  movingWires?: boolean;
  wirePath: WirePoint[];
} 