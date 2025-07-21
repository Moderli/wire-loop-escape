export interface WirePoint {
  x: number;
  y: number;
  z?: number; // Keep z optional for 3D source data
}

// Comprehensive game rules and settings
export interface GameRules {
  // Collision Detection Settings
  collisionTolerance: {
    base: number;           // Base tolerance in pixels
    mobile: number;         // Additional tolerance for mobile
    levelMultiplier: number; // Multiplier based on level difficulty
  };
  
  // Timing and Grace Periods
  timing: {
    gracePeriod: number;        // Grace period when off track (ms)
    warningDuration: number;    // How long warning shows (ms)
    releaseGracePeriod: number; // Grace when finger/mouse released (ms)
  };
  
  // Progress and Movement
  movement: {
    maxProgressJump: number;     // Max points player can skip
    maxBacktrack: number;        // Max points player can go backwards
    lookAheadDistance: number;   // Points to look ahead for smoothing
  };
  
  // Performance Optimizations
  performance: {
    smoothingSegments: number;   // Number of smooth points to generate
    collisionCheckInterval: number; // How often to check collisions (ms)
    maxRenderDistance: number;   // Max distance to render effects
  };
}

// Visual appearance settings
export interface VisualSettings {
  // Wire Appearance
  wire: {
    thickness: {
      base: number;     // Base wire thickness
      mobile: number;   // Mobile wire thickness multiplier
      glow: number;     // Glow effect thickness multiplier
    };
    
    colors: {
      inactive: number;    // Color when not following (hex)
      active: number;      // Color when following (hex)
      completed: number;   // Color for completed sections (hex)
      warning: number;     // Color during warning state (hex)
    };
    
    effects: {
      glowIntensity: number;  // Glow effect intensity (0-1)
      pulseSpeed: number;     // Speed of pulsing effects
      enableBlur: boolean;    // Enable blur effects
    };
  };
  
  // Points and Markers
  points: {
    start: {
      size: number;        // Start point size
      color: number;       // Start point color (hex)
      glowColor: number;   // Start point glow color (hex)
    };
    end: {
      size: number;        // End point size  
      color: number;       // End point color (hex)
      glowColor: number;   // End point glow color (hex)
    };
    progress: {
      size: number;        // Progress indicator size
      color: number;       // Progress indicator color (hex)
      pulseIntensity: number; // How much it pulses (0-1)
    };
  };
  
  // Background and Environment
  background: {
    color: number;           // Background color (hex)
    enableStarfield: boolean; // Enable animated starfield
    starfieldIntensity: number; // Starfield particle count multiplier
  };
  
  // UI Elements
  ui: {
    warningStyle: {
      backgroundColor: number; // Warning overlay color (hex)
      textColor: number;       // Warning text color (hex)
      fontSize: number;        // Warning text size
      pulseSpeed: number;      // Warning pulse speed
    };
    
    labels: {
      showStartEnd: boolean;   // Show START/END labels
      fontSize: number;        // Label font size
      color: number;          // Label color (hex)
    };
  };
}

// Audio and haptic feedback settings
export interface AudioSettings {
  // Sound Effects
  sounds: {
    enableSounds: boolean;      // Enable sound effects
    startSound: string | null;  // Sound when starting level
    lossSound: string | null;   // Sound when player loses
    winSound: string | null;    // Sound when player wins
    warningSound: string | null; // Sound when going off track
    volume: number;             // Master volume (0-1)
  };
  
  // Haptic Feedback
  haptics: {
    enableVibration: boolean;   // Enable haptic feedback
    warningPattern: number[];   // Vibration pattern for warnings
    successPattern: number[];   // Vibration pattern for success
    failurePattern: number[];   // Vibration pattern for failure
  };
}

// Mobile-specific settings
export interface MobileSettings {
  // Scaling and Sizing
  scaling: {
    levelScale: number;         // Overall level scale multiplier
    uiScale: number;           // UI elements scale multiplier
    touchTolerance: number;    // Additional touch tolerance
  };
  
  // Performance
  performance: {
    enableOptimizations: boolean; // Enable mobile performance opts
    targetFPS: number;           // Target frame rate
    reduceEffects: boolean;      // Reduce visual effects
    simplifyRendering: boolean;  // Use simpler rendering
  };
  
  // Controls
  controls: {
    preventZoom: boolean;       // Prevent pinch zoom
    lockOrientation: boolean;   // Try to lock orientation
    hideAddressBar: boolean;    // Hide browser address bar
  };
}

// Camera system settings (optional)
export interface CameraSettings {
  enabled: boolean;             // Enable camera system
  followPlayer: boolean;        // Camera follows player progress
  smoothness: number;          // Camera movement smoothness (0-1)
  lookAhead: number;           // Points to look ahead
  maxDistance: number;         // Max camera distance from player
  bounds: {
    enabled: boolean;          // Enable camera bounds
    padding: number;           // Padding around level bounds
  };
  zoom: {
    enabled: boolean;          // Enable dynamic zoom
    min: number;              // Minimum zoom level
    max: number;              // Maximum zoom level
    complexity: boolean;       // Zoom based on path complexity
  };
}

// Complete level configuration
export interface LevelData {
  // Basic Information
  id: number;
  name: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  
  // Level Data
  wirePath: WirePoint[];
  
  // Game Configuration
  rules: GameRules;
  visual: VisualSettings;
  audio: AudioSettings;
  mobile: MobileSettings;
  camera?: CameraSettings; // Optional camera system
  
  // Optional Advanced Features
  features?: {
    timeLimit?: number;         // Time limit in seconds
    movingWires?: boolean;      // Enable moving wire animations
    multiPath?: boolean;        // Multiple paths to choose from
    obstacles?: WirePoint[];    // Obstacle points to avoid
    powerUps?: WirePoint[];     // Power-up locations
    checkpoints?: number[];     // Checkpoint positions in path
  };
  
  // Level Metadata
  metadata?: {
    author?: string;           // Level designer
    version?: string;          // Level version
    tags?: string[];          // Categorization tags
    estimatedTime?: number;    // Estimated completion time (seconds)
    unlockRequirements?: {     // Requirements to unlock this level
      previousLevel?: number;  // Must complete this level first
      minScore?: number;       // Minimum score required
      maxTime?: number;        // Must complete previous in this time
    };
  };
} 