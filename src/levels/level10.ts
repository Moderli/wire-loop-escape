import { LevelData } from '@/lib/types';
import { createLevelWithDefaults } from '@/lib/levelDefaults';

// Butterfly-shaped path (approximate, symmetric)
const butterflyPoints = [
  // Left wing (top to bottom)
  { x: -80, y: 0 },
  { x: -100, y: 40 },
  { x: -90, y: 80 },
  { x: -60, y: 100 },
  { x: -30, y: 80 },
  { x: -40, y: 40 },
  { x: -60, y: 20 },
  // Body (center)
  { x: 0, y: 0 },
  { x: 0, y: 30 },
  { x: 0, y: 60 },
  // Right wing (bottom to top)
  { x: 60, y: 20 },
  { x: 40, y: 40 },
  { x: 30, y: 80 },
  { x: 60, y: 100 },
  { x: 90, y: 80 },
  { x: 100, y: 40 },
  { x: 80, y: 0 },
  // Back to body
  { x: 0, y: 0 }
];

export const level10: LevelData = createLevelWithDefaults(
  {
    id: 10,
    name: 'Golden Butterfly',
    description: 'A hard level with a golden, shining butterfly-shaped trail.',
    difficulty: 'hard',
    wirePath: butterflyPoints
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
    },
    visual: {
      wire: {
        thickness: {
          base: 1.2,
          mobile: 2.0,
          glow: 2.5
        },
        colors: {
          inactive: 0x888800, // dull gold
          active: 0xffd700,   // gold
          completed: 0xfff380, // light gold
          warning: 0xff3366
        },
        effects: {
          glowIntensity: 0.45, // strong glow for shine
          pulseSpeed: 120,     // fast pulsing for shine
          enableBlur: true
        }
      }
    }
  }
); 