import { LevelData } from '@/lib/types';

// Original 3D spiral data for this level
const spiralPoints = [
  { x: -100, y: 0, z: -50 },
  { x: -90, y: 20, z: -45 },
  { x: -70, y: 40, z: -35 },
  { x: -40, y: 50, z: -20 },
  { x: 0, y: 40, z: 0 },
  { x: 40, y: 20, z: 20 },
  { x: 70, y: -10, z: 35 },
  { x: 90, y: -30, z: 45 },
  { x: 100, y: -50, z: 50 }
];

export const level1: LevelData = {
  id: 1,
  name: 'Simple Spiral',
  difficulty: 'easy',
  wirePath: spiralPoints,
};