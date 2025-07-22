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
    id: 1, // Unique identifier for this level
    name: 'Simple Spiral', // Level name shown in UI
    description: 'A gentle introduction to the wire loop game with a simple spiral pattern.', // Description for menus
    difficulty: 'medium', // Difficulty setting (affects some defaults)
    wirePath: spiralPoints // The array of 3D points defining the wire path
  },
  {
    rules: {
      collisionTolerance: {
        base: 50,      // Base collision tolerance in pixels (desktop)
        mobile: 65,    // Extra tolerance for mobile devices (touch is less precise)
        levelMultiplier: 1.0 // Multiplier for overall tolerance (1.0 = normal, <1 = harder, >1 = easier)
      },
      timing: {
        gracePeriod: 600,         // ms allowed after leaving wire before warning
        warningDuration: 500,     // ms warning is shown before failure
        releaseGracePeriod: 75    // ms allowed to re-enter wire after release
      },
      movement: {
        maxProgressJump: 30,      // Max allowed jump in progress (prevents skipping)
        maxBacktrack: 20,         // Max allowed backtracking (prevents cheating)
        lookAheadDistance: 70     // How far ahead to check for collisions
      },
      performance: {
        smoothingSegments: 200,
        collisionCheckInterval: 16,
        maxRenderDistance: 2000
      }
    },
    
    visual: {
      // Visual settings for the level
      wire: {
        colors: {
          active: 0x44ff44,     // Bright green for the wire when player is following correctly
          completed: 0x88ff88   // Lighter green for sections already completed
        },
        effects: {
          glowIntensity: 0.25   // Extra glow effect to make the wire more visible
        }
      },
      
      points: {
        start: {
          size: 18,             // Larger start point to make it obvious for beginners
          glowColor: 0x88ff88   // Green glow to match the wire theme
        }
        // You can add end/goal point styling here if needed
      },
      
      ui: {
        warningStyle: {
          backgroundColor: 0xff6600, // Orange background for warnings (less harsh than red)
          fontSize: 42               // Slightly smaller warning text for this level
        }
      }
    },
    
    audio: {
      haptics: {
        enableVibration: false  // No vibration on first level to avoid startling new players
      }
      // You can add sound effect settings here if needed
    },
    
    mobile: {
      scaling: {
        levelScale: 1.4,        // Makes the level larger on mobile for easier touch control
        touchTolerance: 15      // Extra touch tolerance for mobile users
      }
    },
    
    metadata: {
      author: 'Wire Loop Team', // Who created the level
      version: '1.0',           // Level version for tracking
      tags: ['beginner', 'tutorial', 'spiral'], // Tags for filtering/searching levels
      estimatedTime: 30,        // Estimated time to complete (seconds)
      unlockRequirements: {
        // No requirements - this is the first level and always unlocked
      }
    }
  }
);