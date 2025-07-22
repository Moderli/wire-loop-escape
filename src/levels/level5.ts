import { LevelData } from '@/lib/types';
import { createLevelWithDefaults } from '@/lib/levelDefaults';

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

export const level5: LevelData = createLevelWithDefaults(
  {
    id: 5,
    name: 'The Gauntlet',
    difficulty: 'medium',
    wirePath: gauntletPoints
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