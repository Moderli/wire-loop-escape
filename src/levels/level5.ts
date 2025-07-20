import { LevelData } from '@/lib/types';

// A more intense path with larger amplitude movements
const gauntletPoints = [
  { x: -200, y: 0, z: 0 },
  { x: -150, y: 0, z: 100 },
  { x: -100, y: 0, z: -100 },
  { x: -50, y: 100, z: 0 },
  { x: 0, y: -100, z: 0 },
  { x: 50, y: 0, z: 100 },
  { x: 100, y: 0, z: -100 },
  { x: 150, y: 120, z: 0 },
  { x: 200, y: -120, z: 0 },
];

export const level5: LevelData = {
  id: 5,
  name: 'The Gauntlet',
  difficulty: 'expert',
  wirePath: gauntletPoints,
}; 