import { GameRules, VisualSettings, AudioSettings, MobileSettings, CameraSettings } from './types';

// Default game rules for different difficulty levels
export const getDefaultGameRules = (difficulty: 'easy' | 'medium' | 'hard' | 'expert'): GameRules => {
  const baseRules: GameRules = {
    collisionTolerance: {
      base: 35,
      mobile: 45,
      levelMultiplier: 1.0
    },
    timing: {
      gracePeriod: 300,
      warningDuration: 2000,
      releaseGracePeriod: 75
    },
    movement: {
      maxProgressJump: 25,
      maxBacktrack: 15,
      lookAheadDistance: 50
    },
    performance: {
      smoothingSegments: 200,
      collisionCheckInterval: 16,
      maxRenderDistance: 2000
    }
  };

  // Adjust settings based on difficulty
  switch (difficulty) {
    case 'easy':
      return {
        ...baseRules,
        collisionTolerance: {
          ...baseRules.collisionTolerance,
          base: 45,
          mobile: 55,
          levelMultiplier: 1.2
        },
        timing: {
          ...baseRules.timing,
          gracePeriod: 500,
          warningDuration: 3000
        }
      };
      
    case 'medium':
      return {
        ...baseRules,
        collisionTolerance: {
          ...baseRules.collisionTolerance,
          levelMultiplier: 1.0
        }
      };
      
    case 'hard':
      return {
        ...baseRules,
        collisionTolerance: {
          ...baseRules.collisionTolerance,
          base: 30,
          mobile: 40,
          levelMultiplier: 0.8
        },
        timing: {
          ...baseRules.timing,
          gracePeriod: 200,
          warningDuration: 1500
        },
        movement: {
          ...baseRules.movement,
          maxProgressJump: 20
        }
      };
      
    case 'expert':
      return {
        ...baseRules,
        collisionTolerance: {
          ...baseRules.collisionTolerance,
          base: 25,
          mobile: 35,
          levelMultiplier: 0.6
        },
        timing: {
          ...baseRules.timing,
          gracePeriod: 150,
          warningDuration: 1000
        },
        movement: {
          ...baseRules.movement,
          maxProgressJump: 15,
          maxBacktrack: 10
        },
        performance: {
          ...baseRules.performance,
          smoothingSegments: 300 // More precision for expert levels
        }
      };
  }
};

// Default visual settings
export const getDefaultVisualSettings = (): VisualSettings => ({
  wire: {
    thickness: {
      base: 1.0,
      mobile: 2.0,
      glow: 1.8
    },
    colors: {
      inactive: 0xb0b0b0,    // Gray for inactive wire
      active: 0xffe066,      // Yellow/gold for active following
      completed: 0x00ff88,   // Green for completed sections
      warning: 0xff4444      // Red for warning state
    },
    effects: {
      glowIntensity: 0.18,
      pulseSpeed: 200,
      enableBlur: true
    }
  },
  
  points: {
    start: {
      size: 15,
      color: 0x00ff00,       // Green start point
      glowColor: 0xffff00    // Yellow glow
    },
    end: {
      size: 15,
      color: 0xff0000,       // Red end point
      glowColor: 0xff8888    // Light red glow
    },
    progress: {
      size: 8,
      color: 0x00ffff,       // Cyan progress indicator
      pulseIntensity: 0.3
    }
  },
  
  background: {
    color: 0x181c23,         // Dark blue-gray background
    enableStarfield: true,
    starfieldIntensity: 1.0
  },
  
  ui: {
    warningStyle: {
      backgroundColor: 0xff0000,
      textColor: 0xffffff,
      fontSize: 48,
      pulseSpeed: 300
    },
    labels: {
      showStartEnd: true,
      fontSize: 24,
      color: 0xffffff
    }
  }
});

// Default audio settings
export const getDefaultAudioSettings = (): AudioSettings => ({
  sounds: {
    enableSounds: false,      // Disabled by default (no sound files yet)
    startSound: null,
    lossSound: null,
    winSound: null,
    warningSound: null,
    volume: 0.5
  },
  
  haptics: {
    enableVibration: true,
    warningPattern: [100, 50, 100],
    successPattern: [200],
    failurePattern: [100, 100, 100, 100, 100]
  }
});

// Default mobile settings
export const getDefaultMobileSettings = (): MobileSettings => ({
  scaling: {
    levelScale: 1.3,          // 30% larger on mobile
    uiScale: 1.2,            // 20% larger UI elements
    touchTolerance: 10       // Additional 10px tolerance for touch
  },
  
  performance: {
    enableOptimizations: true,
    targetFPS: 60,
    reduceEffects: false,
    simplifyRendering: false
  },
  
  controls: {
    preventZoom: true,
    lockOrientation: false,   // Let user choose orientation
    hideAddressBar: true
  }
});

// Default camera settings (optional)
export const getDefaultCameraSettings = (): CameraSettings => ({
  enabled: false,             // Disabled by default per user request
  followPlayer: true,
  smoothness: 0.08,
  lookAhead: 15,
  maxDistance: 200,
  bounds: {
    enabled: true,
    padding: 200
  },
  zoom: {
    enabled: false,
    min: 0.6,
    max: 1.2,
    complexity: false
  }
});

// Utility function to create a complete level with defaults
export const createLevelWithDefaults = (
  basicInfo: {
    id: number;
    name: string;
    description?: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    wirePath: Array<{x: number, y: number, z?: number}>;
  },
  overrides: {
    rules?: DeepPartial<GameRules>;
    visual?: DeepPartial<VisualSettings>;
    audio?: DeepPartial<AudioSettings>;
    mobile?: DeepPartial<MobileSettings>;
    camera?: DeepPartial<CameraSettings>;
    features?: any;
    metadata?: any;
  } = {}
) => {
  return {
    ...basicInfo,
    rules: mergeDeep(getDefaultGameRules(basicInfo.difficulty), overrides.rules || {}),
    visual: mergeDeep(getDefaultVisualSettings(), overrides.visual || {}),
    audio: mergeDeep(getDefaultAudioSettings(), overrides.audio || {}),
    mobile: mergeDeep(getDefaultMobileSettings(), overrides.mobile || {}),
    camera: overrides.camera ? mergeDeep(getDefaultCameraSettings(), overrides.camera) : undefined,
    features: overrides.features,
    metadata: overrides.metadata
  };
};

// Deep partial type helper
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Deep merge utility function
function mergeDeep(target: any, source: any): any {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Preset configurations for common level types
export const LevelPresets = {
  // Simple beginner level
  beginner: {
    rules: {
      collisionTolerance: { levelMultiplier: 1.5 },
      timing: { gracePeriod: 800 }
    },
    visual: {
      wire: { 
        thickness: { base: 1.2 },
        effects: { glowIntensity: 0.25 }
      }
    }
  },
  
  // Precision level
  precision: {
    rules: {
      collisionTolerance: { levelMultiplier: 0.7 },
      timing: { gracePeriod: 100 }
    },
    visual: {
      wire: { 
        colors: { active: 0xff6600 } // Orange for precision levels
      }
    }
  },
  
  // Speed level
  speed: {
    rules: {
      movement: { maxProgressJump: 30 },
      timing: { gracePeriod: 50 }
    },
    visual: {
      wire: {
        colors: { active: 0x00aaff }, // Blue for speed levels
        effects: { pulseSpeed: 100 }
      }
    }
  },
  
  // Artistic/visual level
  artistic: {
    visual: {
      wire: {
        effects: { glowIntensity: 0.4, enableBlur: true }
      },
      background: { starfieldIntensity: 1.5 }
    }
  }
}; 