import { LevelData } from '@/lib/types';

// A path that weaves like a double helix
const helixPoints = [
  { x: -160, y: 0, z: 0 },
  { x: -140, y: 30, z: 20 },
  { x: -120, y: 60, z: 0 },
  { x: -100, y: 30, z: -20 },
  { x: -80, y: 0, z: 0 },
  { x: -60, y: -30, z: 20 },
  { x: -40, y: -60, z: 0 },
  { x: -20, y: -30, z: -20 },
  { x: 0, y: 0, z: 0 },
  { x: 20, y: 30, z: 20 },
  { x: 40, y: 60, z: 0 },
  { x: 60, y: 30, z: -20 },
  { x: 80, y: 0, z: 0 },
  { x: 100, y: -30, z: 20 },
  { x: 120, y: -60, z: 0 },
  { x: 140, y: -30, z: -20 },
  { x: 160, y: 0, z: 0 },
];

export const level4: LevelData = {
  id: 4,
  name: 'Double Helix',
  difficulty: 'hard',
  wirePath: helixPoints,
}; 