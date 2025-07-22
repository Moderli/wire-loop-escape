import { LevelData } from '@/lib/types';
import { createLevelWithDefaults } from '@/lib/levelDefaults';

// A refined path to create a clearer elephant silhouette with separate start and end points
const elephantPoints = [
  // Start at trunk tip
  { x: -160, y: 40, z: 0 },
  { x: -140, y: 70, z: 10 },
  { x: -110, y: 50, z: 20 },

  // Head
  { x: -100, y: 120, z: 30 }, // Top of head
  { x: -70, y: 130, z: 40 }, // Ear area
  { x: -50, y: 110, z: 35 }, // Ear dip

  // Back
  { x: 0, y: 120, z: 40 },
  { x: 60, y: 100, z: 25 },
  
  // Rump and Tail
  { x: 90, y: 110, z: 20 },
  { x: 100, y: 90, z: 15 }, // Tail
  
  // Back Leg
  { x: 80, y: 20, z: 10 },
  { x: 60, y: -20, z: 20 }, // Foot
  
  // Belly
  { x: 0, y: -30, z: 30 },
  { x: -60, y: -25, z: 25 },

  // Front Leg
  { x: -80, y: 20, z: 15 },
  { x: -100, y: -20, z: 20 }, // Foot

  // Chest/Jaw (End Point)
  { x: -120, y: 10, z: 10 },
];

export const level8: LevelData = createLevelWithDefaults(
  {
    id: 8,
    name: 'Elephant Path',
    difficulty: 'hard',
    wirePath: elephantPoints
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