import { LevelData } from '@/lib/types';

// A long and winding path with sharp turns
const gauntletPoints = [
  { x: -200, y: 0, z: 0 },
  { x: -180, y: 0, z: 30 },
  { x: -160, y: 0, z: -30 },
  { x: -140, y: 30, z: 0 },
  { x: -120, y: -30, z: 0 },
  { x: -100, y: 0, z: 0 },
  { x: -80, y: 50, z: 50 },
  { x: -60, y: 0, z: 0 },
  { x: -40, y: -50, z: -50 },
  { x: 0, y: 0, z: 0 },
  { x: 40, y: 80, z: 0 },
  { x: 80, y: -80, z: 0 },
  { x: 120, y: 80, z: 0 },
  { x: 160, y: -80, z: 0 },
  { x: 200, y: 0, z: 0 },
];

export const level5: LevelData = {
  id: 5,
  name: 'The Gauntlet',
  difficulty: 'expert',
  wirePath: gauntletPoints,
}; 