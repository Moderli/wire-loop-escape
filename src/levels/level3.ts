import { LevelData } from '@/lib/types';
import { createLevelWithDefaults } from '@/lib/levelDefaults';

// Most complex 3D spiral data
const spiralPoints = [
  { x: -150, y: 0, z: -75 },
  { x: -120, y: 40, z: -60 },
  { x: -80, y: 80, z: -40 },
  { x: -30, y: 100, z: -15 },
  { x: 20, y: 80, z: 10 },
  { x: 70, y: 40, z: 35 },
  { x: 110, y: -20, z: 55 },
  { x: 140, y: -60, z: 70 },
  { x: 150, y: -100, z: 75 },
  { x: 130, y: -140, z: 65 },
  { x: 90, y: -160, z: 45 },
  { x: 40, y: -140, z: 20 },
  { x: 0, y: -100, z: 0 },
  { x: -40, y: -50, z: -20 }
];

export const level3: LevelData = createLevelWithDefaults(
  {
    id: 3,
    name: 'Expert Corkscrew',
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