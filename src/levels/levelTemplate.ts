import { LevelData } from '@/lib/types';
import { createLevelWithDefaults } from '@/lib/levelDefaults';

// ====================================================================
// LEVEL TEMPLATE AND EXAMPLES
// ====================================================================

// Example wire path - simple curve
const examplePath = [
  { x: -50, y: 0 },
  { x: -25, y: 25 },
  { x: 0, y: 0 },
  { x: 25, y: -25 },
  { x: 50, y: 0 }
];

// ====================================================================
// MINIMAL LEVEL CONFIGURATION
// Uses all default settings for the specified difficulty level
// ====================================================================

export const minimalLevel: LevelData = createLevelWithDefaults({
  id: 99,
  name: 'Minimal Level',
  difficulty: 'medium',
  wirePath: examplePath
});

// ====================================================================
// COMPREHENSIVE LEVEL CONFIGURATION
// Shows every possible setting that can be customized
// ====================================================================

export const comprehensiveLevel: LevelData = {
  // ================================================================
  // BASIC INFORMATION
  // ================================================================
  id: 100,
  name: 'Comprehensive Example',
  description: 'A level showcasing every possible configuration option available in the Wire Loop game engine.',
  difficulty: 'hard',
  
  // ================================================================
  // LEVEL DATA
  // ================================================================
  wirePath: examplePath,
  
  // ================================================================
  // GAME RULES
  // Controls how the game mechanics work for this level
  // ================================================================
  rules: {
    // Collision detection settings
    collisionTolerance: {
      base: 30,              // Base tolerance in pixels (desktop)
      mobile: 40,            // Additional tolerance for mobile devices
      levelMultiplier: 0.9   // Multiplier applied to tolerance (0.5 = harder, 1.5 = easier)
    },
    
    // Timing and grace periods
    timing: {
      gracePeriod: 250,        // How long player can be off-track before warning (ms)
      warningDuration: 1500,   // How long warning is shown before game over (ms)
      releaseGracePeriod: 60   // Grace time when mouse/finger is released (ms)
    },
    
    // Movement and progress validation
    movement: {
      maxProgressJump: 20,     // Max points player can skip ahead
      maxBacktrack: 12,        // Max points player can go backwards
      lookAheadDistance: 45    // Points to look ahead for collision detection
    },
    
    // Performance optimizations
    performance: {
      smoothingSegments: 250,     // Number of interpolated points for smooth curves
      collisionCheckInterval: 16, // How often to check collisions (ms)
      maxRenderDistance: 1800     // Max distance to render visual effects
    }
  },
  
  // ================================================================
  // VISUAL SETTINGS
  // Controls the appearance and visual effects
  // ================================================================
  visual: {
    // Wire appearance
    wire: {
      thickness: {
        base: 1.0,           // Base wire thickness multiplier
        mobile: 1.8,         // Mobile wire thickness multiplier
        glow: 1.6           // Glow effect thickness multiplier
      },
      
      colors: {
        inactive: 0x888888,  // Color when not actively following (hex)
        active: 0xffcc00,    // Color when actively following (hex)
        completed: 0x00cc44, // Color for completed path sections (hex)
        warning: 0xff3366    // Color during warning state (hex)
      },
      
      effects: {
        glowIntensity: 0.22, // Intensity of glow effect (0-1)
        pulseSpeed: 180,     // Speed of pulsing animations (ms)
        enableBlur: true     // Enable blur post-processing effects
      }
    },
    
    // Points and markers
    points: {
      start: {
        size: 16,            // Start point size in pixels
        color: 0x00ff00,     // Start point color (hex)
        glowColor: 0x88ff88  // Start point glow color (hex)
      },
      end: {
        size: 16,            // End point size in pixels
        color: 0xff0000,     // End point color (hex)
        glowColor: 0xff8888  // End point glow color (hex)
      },
      progress: {
        size: 7,             // Progress indicator size in pixels
        color: 0x00ccff,     // Progress indicator color (hex)
        pulseIntensity: 0.4  // How much the indicator pulses (0-1)
      }
    },
    
    // Background and environment
    background: {
      color: 0x1a1a2e,       // Background color (hex)
      enableStarfield: true, // Enable animated particle starfield
      starfieldIntensity: 1.2 // Starfield particle density multiplier
    },
    
    // UI elements
    ui: {
      warningStyle: {
        backgroundColor: 0xff0033, // Warning overlay background color (hex)
        textColor: 0xffffff,       // Warning text color (hex)
        fontSize: 48,              // Warning text size in pixels
        pulseSpeed: 250            // Warning pulse animation speed (ms)
      },
      
      labels: {
        showStartEnd: true,  // Show START/END text labels
        fontSize: 22,        // Label font size in pixels
        color: 0xdddddd     // Label text color (hex)
      }
    }
  },
  
  // ================================================================
  // AUDIO SETTINGS
  // Controls sound effects and haptic feedback
  // ================================================================
  audio: {
    // Sound effects
    sounds: {
      enableSounds: false,        // Enable sound effects (currently disabled)
      startSound: null,           // Sound file for level start
      lossSound: null,            // Sound file for game over
      winSound: null,             // Sound file for level completion
      warningSound: null,         // Sound file for off-track warning
      volume: 0.7                 // Master volume (0-1)
    },
    
    // Haptic feedback (vibration)
    haptics: {
      enableVibration: true,                    // Enable haptic feedback
      warningPattern: [80, 40, 80],            // Vibration pattern for warnings
      successPattern: [150, 75, 150],          // Vibration pattern for success
      failurePattern: [100, 50, 100, 50, 100] // Vibration pattern for failure
    }
  },
  
  // ================================================================
  // MOBILE SETTINGS
  // Mobile-specific optimizations and behaviors
  // ================================================================
  mobile: {
    // Scaling and sizing
    scaling: {
      levelScale: 1.25,      // Overall level scale multiplier for mobile
      uiScale: 1.15,         // UI elements scale multiplier for mobile
      touchTolerance: 8      // Additional collision tolerance for touch input
    },
    
    // Performance optimizations
    performance: {
      enableOptimizations: true, // Enable mobile performance optimizations
      targetFPS: 60,            // Target frame rate for mobile devices
      reduceEffects: false,     // Reduce visual effects on low-end devices
      simplifyRendering: false  // Use simplified rendering pipeline
    },
    
    // Mobile-specific controls
    controls: {
      preventZoom: true,        // Prevent pinch-to-zoom gestures
      lockOrientation: false,   // Attempt to lock screen orientation
      hideAddressBar: true      // Try to hide browser address bar
    }
  },
  
  // ================================================================
  // CAMERA SETTINGS (OPTIONAL)
  // Camera system settings - can be omitted if not needed
  // ================================================================
  camera: {
    enabled: false,           // Enable camera following system
    followPlayer: true,       // Camera follows player progress
    smoothness: 0.06,        // Camera movement smoothness (0-1)
    lookAhead: 18,           // Points to look ahead in the path
    maxDistance: 180,        // Maximum camera distance from player
    bounds: {
      enabled: true,         // Enable camera boundary constraints
      padding: 150           // Padding around level boundaries
    },
    zoom: {
      enabled: false,        // Enable dynamic zoom
      min: 0.7,             // Minimum zoom level
      max: 1.1,             // Maximum zoom level
      complexity: false     // Zoom based on path complexity
    }
  },
  
  // ================================================================
  // ADVANCED FEATURES (OPTIONAL)
  // Special gameplay features and mechanics
  // ================================================================
  features: {
    timeLimit: 90,           // Time limit in seconds (optional)
    movingWires: false,      // Enable animated wire movement
    multiPath: false,        // Multiple path options to choose from
    obstacles: [             // Obstacle points to avoid (optional)
      { x: 10, y: 15 },
      { x: -20, y: -10 }
    ],
    powerUps: [             // Power-up locations (optional)
      { x: 0, y: 0 }
    ],
    checkpoints: [2, 4]     // Checkpoint indices in the wire path
  },
  
  // ================================================================
  // METADATA (OPTIONAL)
  // Level information and unlock requirements
  // ================================================================
  metadata: {
    author: 'Level Designer Name',              // Level creator
    version: '1.2.3',                          // Level version
    tags: ['example', 'comprehensive', 'demo'], // Categorization tags
    estimatedTime: 60,                          // Estimated completion time (seconds)
    unlockRequirements: {                       // Requirements to unlock this level
      previousLevel: 5,                         // Must complete this level first
      minScore: 85,                            // Minimum score percentage required
      maxTime: 30                              // Must complete previous level within time limit
    }
  }
};

// ====================================================================
// USAGE EXAMPLES
// ====================================================================

/*
// Simple level with just custom colors:
export const colorfulLevel: LevelData = createLevelWithDefaults(
  {
    id: 10,
    name: 'Colorful Level',
    difficulty: 'easy',
    wirePath: myWirePath
  },
  {
    visual: {
      wire: {
        colors: {
          active: 0xff00ff,    // Magenta active color
          completed: 0x00ffff  // Cyan completed color
        }
      }
    }
  }
);

// Precision level with tight tolerances:
export const precisionLevel: LevelData = createLevelWithDefaults(
  {
    id: 11,
    name: 'Precision Challenge',
    difficulty: 'expert',
    wirePath: precisionPath
  },
  {
    rules: {
      collisionTolerance: {
        levelMultiplier: 0.6  // 40% tighter than normal expert
      },
      timing: {
        gracePeriod: 80       // Very short grace period
      }
    }
  }
);
*/ 