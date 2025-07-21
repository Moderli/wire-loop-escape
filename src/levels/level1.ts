import { LevelData } from '@/lib/types';
import { createLevelWithDefaults, LevelPresets } from '@/lib/levelDefaults';

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

export const level1: LevelData = createLevelWithDefaults(
  {
    id: 1,
    name: 'Simple Spiral',
    description: 'A gentle introduction to the wire loop game with a simple spiral pattern.',
    difficulty: 'easy',
    wirePath: spiralPoints
  },
  {
    // Custom settings for this level (overrides defaults)
    rules: {
      // Extra forgiving for first level
      collisionTolerance: {
        levelMultiplier: 1.5  // 50% more tolerance than normal easy level
      },
      timing: {
        gracePeriod: 800,     // Extra long grace period for beginners
        warningDuration: 4000 // Show warning for 4 seconds
      }
    },
    
    visual: {
      // Friendly green theme for first level
      wire: {
        colors: {
          active: 0x44ff44,     // Bright green for active following
          completed: 0x88ff88   // Light green for completed sections
        },
        effects: {
          glowIntensity: 0.25   // Extra glow to make it more visible
        }
      },
      
      points: {
        start: {
          size: 18,             // Larger start point for beginners
          glowColor: 0x88ff88   // Green glow to match theme
        }
      },
      
      ui: {
        warningStyle: {
          backgroundColor: 0xff6600, // Orange warning (less harsh than red)
          fontSize: 42          // Slightly smaller warning text
        }
      }
    },
    
    audio: {
      haptics: {
        enableVibration: false  // No vibration on first level to avoid startling
      }
    },
    
    mobile: {
      scaling: {
        levelScale: 1.4,        // Even larger on mobile for first level
        touchTolerance: 15      // Extra touch tolerance
      }
    },
    
    metadata: {
      author: 'Wire Loop Team',
      version: '1.0',
      tags: ['beginner', 'tutorial', 'spiral'],
      estimatedTime: 30,      // 30 seconds estimated completion
      unlockRequirements: {
        // No requirements - this is the first level
      }
    }
  }
);