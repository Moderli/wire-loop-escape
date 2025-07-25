import { LevelData } from '@/lib/types';
import { createLevelWithDefaults } from '@/lib/levelDefaults';

// Cosmic Circuit wire path - a 3D spiral-like path with dynamic movement
const cosmicPath = [
  { x: -60, y: 30 },
  { x: -30, y: 60 },
  { x: 0, y: 0 },
  { x: 30, y: -60 },
  { x: 60, y: 30 },
  { x: 45, y: 0 },
  { x: 0, y: 45 },
  { x: -45, y: 0 },
  { x: -60, y: -30 }
];

export const level11: LevelData = createLevelWithDefaults(
  {
    id: 11, // Unique level ID
    name: 'Cosmic Circuit',
    description: 'Navigate a pulsating, spiraling wire through a cosmic nebula, avoiding drifting asteroids and harnessing Stellar Pulses to phase through obstacles.',
    difficulty: 'hard',
    wirePath: cosmicPath
  },
  {
    rules: {
      collisionTolerance: {
        base: 25,              // Slightly tighter tolerance for precision
        mobile: 35,            // More forgiving on mobile
        levelMultiplier: 0.85  // Harder than standard hard difficulty
      },
      timing: {
        gracePeriod: 200,      // Moderate grace period for dynamic wire
        warningDuration: 1200, // Shorter warning for quick reaction
        releaseGracePeriod: 50 // Brief grace for touch release
      },
      movement: {
        maxProgressJump: 15,   // Limit skipping to maintain control
        maxBacktrack: 10,      // Restrict backtracking for challenge
        lookAheadDistance: 40  // Moderate look-ahead for dynamic path
      },
      performance: {
        smoothingSegments: 300,     // Smoother curves for spiral path
        collisionCheckInterval: 14, // Frequent checks for obstacles
        maxRenderDistance: 2000     // Extended render for nebula effects
      }
    },
    visual: {
      wire: {
        thickness: {
          base: 1.2,           // Slightly thicker for visibility
          mobile: 2.0,         // Thicker on mobile for touch
          glow: 1.8           // Strong glow for cosmic effect
        },
        colors: {
          inactive: 0x444466,  // Dark blue-purple for inactive wire
          active: 0x00ccff,    // Bright cyan when active
          completed: 0x00ff88, // Green for completed sections
          warning: 0xff3333    // Red warning for errors
        },
        effects: {
          glowIntensity: 0.3,  // Strong glow for cosmic vibe
          pulseSpeed: 150,     // Fast pulse for dynamic feel
          enableBlur: true     // Enable blur for nebula aesthetic
        }
      },
      points: {
        start: {
          size: 18,            // Larger start point
          color: 0x00ccff,     // Cyan start point
          glowColor: 0x88eeff  // Light cyan glow
        },
        end: {
          size: 18,            // Larger end point
          color: 0xff3333,     // Red end point
          glowColor: 0xff8888  // Light red glow
        },
        progress: {
          size: 8,             // Moderate progress indicator
          color: 0x00ccff,     // Cyan progress indicator
          pulseIntensity: 0.5  // Noticeable pulsing
        }
      },
      background: {
        color: 0x0a0a1a,       // Deep space blue-black
        enableStarfield: true, // Animated starfield for nebula
        starfieldIntensity: 1.5 // Dense starfield for immersion
      },
      ui: {
        warningStyle: {
          backgroundColor: 0x660033, // Dark red warning overlay
          textColor: 0xeeeeee,       // Light gray warning text
          fontSize: 50,              // Large warning text
          pulseSpeed: 200            // Fast warning pulse
        },
        labels: {
          showStartEnd: true,  // Show START/END labels
          fontSize: 24,        // Slightly larger labels
          color: 0xcccccc      // Light gray labels
        }
      }
    },
    audio: {
      sounds: {
        enableSounds: true,         // Enable sounds for immersion
        startSound: 'cosmic_start.wav', // Cosmic hum for start
        lossSound: 'cosmic_fail.wav',   // Distorted glitch for loss
        winSound: 'cosmic_win.wav',     // Triumphant chime for win
        warningSound: 'cosmic_warning.wav', // Sharp synth for warning
        volume: 0.8                 // Slightly louder for effect
      },
      haptics: {
        enableVibration: true,                    // Enable haptics
        warningPattern: [100, 50, 100],          // Sharp warning vibration
        successPattern: [200, 100, 200],         // Longer success vibration
        failurePattern: [120, 60, 120, 60, 120]  // Complex failure vibration
      }
    },
    mobile: {
      scaling: {
        levelScale: 1.3,       // Slightly larger for mobile visibility
        uiScale: 1.2,          // Larger UI for touch
        touchTolerance: 10     // Extra tolerance for touch input
      },
      performance: {
        enableOptimizations: true, // Optimize for mobile
        targetFPS: 60,            // Smooth performance
        reduceEffects: false,     // Keep effects for cosmic theme
        simplifyRendering: false   // Full rendering for immersion
      },
      controls: {
        preventZoom: true,        // Prevent pinch-to-zoom
        lockOrientation: true,    // Lock to landscape for consistency
        hideAddressBar: true      // Hide browser bar for immersion
      }
    },
    camera: {
      enabled: true,            // Enable camera for dynamic path
      followPlayer: true,       // Follow player along spiral
      smoothness: 0.08,        // Smooth camera movement
      lookAhead: 20,           // Look ahead for upcoming turns
      maxDistance: 200,        // Allow wider view for obstacles
      bounds: {
        enabled: true,         // Constrain camera to level
        padding: 100           // Moderate padding for visibility
      },
      zoom: {
        enabled: true,         // Dynamic zoom for black hole section
        min: 0.8,             // Zoom out for overview
        max: 1.2,             // Zoom in for precision
        complexity: true      // Zoom based on path narrowing
      }
    },
    features: {
      timeLimit: 90,           // 90-second time limit
      movingWires: true,       // Enable dynamic wire rotation
      multiPath: false,        // Single path for focus
      obstacles: [             // Asteroid-like obstacles
        { x: -20, y: 20 },
        { x: 10, y: -30 },
        { x: 40, y: 10 }
      ],
      powerUps: [              // Stellar Pulse power-up (no type property)
        { x: 0, y: 0 } // Place at center
      ],
      checkpoints: [3, 6]      // Checkpoints at key spiral points
    },
    metadata: {
      author: 'xAI Game Team',
      version: '1.0.0',
      tags: ['cosmic', 'dynamic', 'precision', 'special'],
      estimatedTime: 75,
      unlockRequirements: {
        previousLevel: 10,    // Must complete level 10
        minScore: 80,         // 80% score required
        maxTime: 120          // Must complete previous level in 2 minutes
      }
    }
  }
);