import { LevelData } from '@/lib/types';
import { createLevelWithDefaults } from '@/lib/levelDefaults';

// More complex 3D spiral data
const spiralPoints = [
  { x: -120, y: 0, z: -60 },
  { x: -100, y: 30, z: -50 },
  { x: -70, y: 60, z: -35 },
  { x: -30, y: 80, z: -15 },
  { x: 20, y: 60, z: 10 },
  { x: 60, y: 30, z: 30 },
  { x: 90, y: -20, z: 45 },
  { x: 110, y: -50, z: 55 },
  { x: 120, y: -80, z: 60 }
];

export const level2: LevelData = createLevelWithDefaults(
  {
    id: 2,
    name: 'Twisted Path',
    difficulty: 'medium',
    wirePath: spiralPoints
  },
  {
    rules: {
      collisionTolerance: {
        base: 35,
        mobile: 45,
        levelMultiplier: 1.0
      },
      timing: {
        gracePeriod: 300,
        warningDuration: 300,
        releaseGracePeriod: 75
      },
      movement: {
        maxProgressJump: 20,
        maxBacktrack: 15,
        lookAheadDistance: 50
      },
      performance: {
        smoothingSegments: 200,
        collisionCheckInterval: 16,
        maxRenderDistance: 2000
      }
    }
  }
); 