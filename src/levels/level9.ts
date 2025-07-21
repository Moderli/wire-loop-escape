import { LevelData } from '@/lib/types';
import { 
  getDefaultGameRules, 
  getDefaultVisualSettings, 
  getDefaultAudioSettings, 
  getDefaultMobileSettings 
} from '@/lib/levelDefaults';

// Example advanced level path - complex figure-8 pattern
const figure8Points = [
  { x: -120, y: 0 },
  { x: -100, y: -30 },
  { x: -60, y: -50 },
  { x: -20, y: -40 },
  { x: 0, y: 0 },
  { x: 20, y: 40 },
  { x: 60, y: 50 },
  { x: 100, y: 30 },
  { x: 120, y: 0 },
  { x: 100, y: -30 },
  { x: 60, y: -50 },
  { x: 20, y: -40 },
  { x: 0, y: 0 },
  { x: -20, y: 40 },
  { x: -60, y: 50 },
  { x: -100, y: 30 },
  { x: -120, y: 0 }
];

export const level9: LevelData = {
  // Basic Information
  id: 9,
  name: 'The Infinity Loop',
  description: 'Master the challenging figure-8 pattern that loops back on itself. Requires precision and steady hands!',
  difficulty: 'expert',
  
  // Level Data
  wirePath: figure8Points,
  
  // Game Rules - Expert level with custom precision settings
  rules: {
    collisionTolerance: {
      base: 20,              // Very tight tolerance
      mobile: 30,            // Still tight on mobile
      levelMultiplier: 0.5   // Even tighter than normal expert
    },
    timing: {
      gracePeriod: 100,      // Very short grace period
      warningDuration: 800,  // Quick warning
      releaseGracePeriod: 50 // Minimal release grace
    },
    movement: {
      maxProgressJump: 12,   // Prevent skipping
      maxBacktrack: 8,       // Limited backtracking
      lookAheadDistance: 40  // Shorter lookahead for precision
    },
    performance: {
      smoothingSegments: 400, // High precision smoothing
      collisionCheckInterval: 8, // More frequent collision checks
      maxRenderDistance: 1500
    }
  },
  
  // Visual Settings - Dynamic purple/blue theme
  visual: {
    wire: {
      thickness: {
        base: 0.8,           // Thinner wire for expert level
        mobile: 1.6,         // Still visible on mobile
        glow: 2.0           // Strong glow for visibility
      },
      colors: {
        inactive: 0x444466,  // Dark purple for inactive
        active: 0x8844ff,    // Bright purple for active
        completed: 0x44aaff, // Blue for completed sections
        warning: 0xff4488    // Pink/red for warnings
      },
      effects: {
        glowIntensity: 0.35, // Strong glow effect
        pulseSpeed: 150,     // Fast pulsing
        enableBlur: true     // Enhanced visual effects
      }
    },
    
    points: {
      start: {
        size: 12,            // Smaller points for expert level
        color: 0x44ff44,     // Green start
        glowColor: 0x88ff88  // Light green glow
      },
      end: {
        size: 12,
        color: 0xff4444,     // Red end
        glowColor: 0xff8888  // Light red glow
      },
      progress: {
        size: 6,             // Small progress indicator
        color: 0xffff44,     // Yellow progress
        pulseIntensity: 0.5  // Strong pulse
      }
    },
    
    background: {
      color: 0x0f0f23,       // Darker background for expert
      enableStarfield: true,
      starfieldIntensity: 1.5 // More stars for visual appeal
    },
    
    ui: {
      warningStyle: {
        backgroundColor: 0xff0066, // Bright pink warning
        textColor: 0xffffff,
        fontSize: 52,        // Larger warning for expert level
        pulseSpeed: 200      // Fast warning pulse
      },
      labels: {
        showStartEnd: true,
        fontSize: 20,        // Smaller labels for expert
        color: 0xcccccc     // Gray labels
      }
    }
  },
  
  // Audio Settings - Enhanced feedback for expert level
  audio: {
    sounds: {
      enableSounds: false,   // Sounds disabled for now
      startSound: null,
      lossSound: null,
      winSound: null,
      warningSound: null,
      volume: 0.6
    },
    haptics: {
      enableVibration: true,
      warningPattern: [50, 30, 50, 30, 50], // Quick warning pattern
      successPattern: [200, 100, 200],      // Success celebration
      failurePattern: [100, 50, 100, 50, 100, 50, 100] // Strong failure feedback
    }
  },
  
  // Mobile Settings - Optimized for expert level precision
  mobile: {
    scaling: {
      levelScale: 1.2,       // Slightly larger for precision
      uiScale: 1.1,         // Slightly larger UI
      touchTolerance: 5     // Minimal additional tolerance
    },
    performance: {
      enableOptimizations: true,
      targetFPS: 60,
      reduceEffects: false,  // Keep effects for visual feedback
      simplifyRendering: false
    },
    controls: {
      preventZoom: true,
      lockOrientation: false,
      hideAddressBar: true
    }
  },
  
  // Optional Advanced Features
  features: {
    timeLimit: 120,          // 2 minute time limit
    checkpoints: [8],        // Checkpoint at the center crossing
    powerUps: [             // Optional power-ups at strategic points
      { x: 0, y: 0 }         // Center crossing point
    ]
  },
  
  // Level Metadata
  metadata: {
    author: 'Wire Loop Team',
    version: '2.1',
    tags: ['expert', 'precision', 'figure-8', 'crossing', 'challenge'],
    estimatedTime: 90,      // 90 seconds estimated completion
    unlockRequirements: {
      previousLevel: 8,      // Must complete level 8 first
      maxTime: 45           // Must complete level 8 in under 45 seconds
    }
  }
}; 