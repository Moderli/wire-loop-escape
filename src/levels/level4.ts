import { LevelData } from '@/lib/types';
import { createLevelWithDefaults } from '@/lib/levelDefaults';

// A smoother path that weaves like a double helix with better collision detection
const helixPoints = [
  { x: -160, y: 0, z: 0 },
  { x: -150, y: 15, z: 10 },
  { x: -140, y: 30, z: 20 },
  { x: -130, y: 45, z: 10 },
  { x: -120, y: 60, z: 0 },
  { x: -110, y: 45, z: -10 },
  { x: -100, y: 30, z: -20 },
  { x: -90, y: 15, z: -10 },
  { x: -80, y: 0, z: 0 },
];

export const level4: LevelData = createLevelWithDefaults(
  {
    id: 4,
    name: 'Double Helix',
    difficulty: 'medium',
    wirePath: helixPoints
  },
  {
    rules: {
      collisionTolerance: {
        base: 60,
        mobile: 52
      },
      timing: {
        gracePeriod: 600
      },
      movement: {
        maxProgressJump: 50
      },
      performance: {
        smoothingSegments: 100
      }
    }
  }
);