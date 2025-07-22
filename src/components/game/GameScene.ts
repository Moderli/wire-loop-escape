import Phaser from 'phaser';
import { LevelData, WirePoint } from '@/lib/types';
import { createLevelWithDefaults } from '@/lib/levelDefaults'; // at the top if not already imported

// Dynamically import all levels from the levels folder
const levelModules = import.meta.glob('/src/levels/level*.ts', { eager: true });
const allLevels = new Map<number, LevelData>();

for (const path in levelModules) {
  const match = path.match(/level(\d+)\.ts$/);
  if (match) {
    const levelNumber = parseInt(match[1], 10);
    const module = levelModules[path] as { [key: string]: LevelData };
    // The exported object is named after the level, e.g., `export const level1 = ...`
    const levelData = module[`level${levelNumber}`];
    if (levelData) {
      allLevels.set(levelNumber, levelData);
    }
  }
}

// Add Catmull-Rom spline interpolation OUTSIDE the class with safety checks
function catmullRomSpline(points: WirePoint[], numSegments = 32) {
  // Validate inputs
  if (!points || !Array.isArray(points)) {
    console.error('Invalid points array passed to catmullRomSpline');
    return [];
  }
  
  if (points.length < 2) {
    console.warn('Insufficient points for spline interpolation');
    return points.slice(); // Return copy of original points
  }
  
  if (numSegments < 1) {
    console.warn('Invalid numSegments for spline interpolation, using default');
    numSegments = 32;
  }
  
  // Clamp numSegments to reasonable bounds
  numSegments = Math.max(1, Math.min(numSegments, 1000));
  
  const result: WirePoint[] = [];
  
  try {
    for (let i = 0; i < points.length - 1; i++) {
      // Get control points with boundary handling
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
      
      // Validate control points
      if (!isValidSplinePoint(p0) || !isValidSplinePoint(p1) || 
          !isValidSplinePoint(p2) || !isValidSplinePoint(p3)) {
        console.warn(`Invalid control points at segment ${i}, using linear interpolation`);
        // Fallback to linear interpolation
        for (let t = 0; t < numSegments; t++) {
          const s = t / numSegments;
          const x = p1.x + (p2.x - p1.x) * s;
          const y = p1.y + (p2.y - p1.y) * s;
          
          if (Number.isFinite(x) && Number.isFinite(y)) {
            result.push({ x, y });
          }
        }
        continue;
      }
      
      for (let t = 0; t < numSegments; t++) {
        const s = t / numSegments;
        const s2 = s * s;
        const s3 = s2 * s;
        
        // Calculate interpolated point using Catmull-Rom formula
        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * s +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3
        );
        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * s +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3
        );
        
        // Validate result before adding
        if (Number.isFinite(x) && Number.isFinite(y)) {
          // Check for extreme values that could cause rendering issues
          const maxCoord = 50000;
          if (Math.abs(x) < maxCoord && Math.abs(y) < maxCoord) {
            result.push({ x, y });
          } else {
            console.warn(`Spline point out of bounds: (${x}, ${y}), using clamped values`);
            result.push({ 
              x: Math.max(-maxCoord, Math.min(maxCoord, x)), 
              y: Math.max(-maxCoord, Math.min(maxCoord, y)) 
            });
          }
        } else {
          console.warn(`Invalid spline point: (${x}, ${y}), skipping`);
        }
      }
    }
    
    // Always add the final point
    const lastPoint = points[points.length - 1];
    if (isValidSplinePoint(lastPoint)) {
      result.push(lastPoint);
    }
    
  } catch (error) {
    console.error('Error in catmullRomSpline:', error);
    // Return linear interpolation as fallback
    return linearInterpolationFallback(points, numSegments);
  }
  
  // Ensure we have a valid result
  if (result.length === 0) {
    console.warn('Spline interpolation produced no points, using original points');
    return points.slice();
  }
  
  return result;
}

function isValidSplinePoint(point: any): point is WirePoint {
  return point && 
         typeof point.x === 'number' && Number.isFinite(point.x) &&
         typeof point.y === 'number' && Number.isFinite(point.y);
}

function linearInterpolationFallback(points: WirePoint[], numSegments: number): WirePoint[] {
  console.warn('Using linear interpolation fallback');
  const result: WirePoint[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    if (!isValidSplinePoint(p1) || !isValidSplinePoint(p2)) {
      continue;
    }
    
    for (let t = 0; t < numSegments; t++) {
      const s = t / numSegments;
      const x = p1.x + (p2.x - p1.x) * s;
      const y = p1.y + (p2.y - p1.y) * s;
      
      if (Number.isFinite(x) && Number.isFinite(y)) {
        result.push({ x, y });
      }
    }
  }
  
  // Add final point
  const lastPoint = points[points.length - 1];
  if (isValidSplinePoint(lastPoint)) {
    result.push(lastPoint);
  }
  
  return result.length > 0 ? result : points.slice();
}

export class GameScene extends Phaser.Scene {
  private wirePath!: Phaser.GameObjects.Graphics;
  private wirePoints: WirePoint[] = [];
  private smoothPoints: Phaser.Math.Vector2[] = [];
  private startTime: number = 0;
  private playerName: string = '';
  private gameStats = {
    time: 0,
    collisions: 0,
    level: 1,
    score: 0
  };
  private currentLevelData: LevelData | null = null;
  // Consolidated state management
  private gameState: 'preGame' | 'following' | 'warning' | 'completed' | 'failed' = 'preGame';
  private stateChangeTime: number = 0; // Track when state last changed
  private validStateTransitions = new Map([
    ['preGame', ['following', 'failed']],
    ['following', ['warning', 'completed', 'failed']],
    ['warning', ['following', 'failed']],
    ['completed', ['preGame']],
    ['failed', ['preGame']]
  ]);
  
  // Game progress tracking
  private gameStarted = false;
  private progressIndex: number = 0;
  private collisionCooldown = false;
  
  // Mobile visibility improvements
  private mobileLevelScale = 1.0;
  
  // UI elements
  private loopConstraint: Phaser.GameObjects.Graphics | null = null;
  private magnifier!: Phaser.GameObjects.Graphics;
  private magnifierRadius: number = 32;
  private mousePos = { x: 400, y: 300 };
  private reportText!: Phaser.GameObjects.Text;
  private reportBox!: Phaser.GameObjects.Graphics;
  private retryButton!: Phaser.GameObjects.Text;
  private nextButton!: Phaser.GameObjects.Text;
  private reportStatsText!: Phaser.GameObjects.Text;
  private followStartTime: number = 0;
  private elapsedFollowTime: number = 0;
  private blurOverlay!: Phaser.GameObjects.Graphics;
  private lastTapTime: number = 0;
  private startLabel!: Phaser.GameObjects.Text;
  private endLabel!: Phaser.GameObjects.Text;
  private warningOverlay!: Phaser.GameObjects.Rectangle;
  private warningStartTime: number = 0;
  private lastValidTime: number = 0; // Track when player was last on valid path
  private lastCollisionCheck: number = 0; // Track last collision check time for performance
  private lastFailureReason: string = '';

  constructor() {
    super({ key: 'GameScene' });
  }

  // State management methods
  private changeGameState(newState: 'preGame' | 'following' | 'warning' | 'completed' | 'failed'): boolean {
    const currentState = this.gameState;
    
    // Check if transition is valid
    const validTransitions = this.validStateTransitions.get(currentState);
    if (!validTransitions || !validTransitions.includes(newState)) {
      console.warn(`Invalid state transition from ${currentState} to ${newState}`);
      return false;
    }
    
    // Prevent rapid state changes (debounce)
    const now = this.time.now;
    const timeSinceLastChange = now - this.stateChangeTime;
    const MIN_STATE_CHANGE_INTERVAL = 50; // 50ms minimum between state changes
    
    if (timeSinceLastChange < MIN_STATE_CHANGE_INTERVAL && newState !== 'failed') {
      console.warn(`State change too rapid, ignoring transition to ${newState}`);
      return false;
    }
    
    // Execute state change
    console.log(`State transition: ${currentState} -> ${newState}`);
    this.gameState = newState;
    this.stateChangeTime = now;
    
    // Handle state-specific logic
    this.onStateChanged(currentState, newState);
    
    return true;
  }

  private onStateChanged(oldState: string, newState: string) {
    switch (newState) {
      case 'preGame':
        this.gameStarted = false;
        this.progressIndex = 0;
        this.collisionCooldown = false;
        this.hideWarningOverlay();
        break;
        
      case 'following':
        this.gameStarted = true;
        this.hideWarningOverlay();
        if (this.followStartTime === 0) {
          this.followStartTime = this.time.now;
        }
        break;
        
      case 'warning':
        this.showWarningOverlay();
        break;
        
      case 'completed':
        this.gameStarted = false;
        this.hideWarningOverlay();
        this.elapsedFollowTime = (this.time.now - this.followStartTime) / 1000;
        break;
        
      case 'failed':
        this.gameStarted = false;
        this.hideWarningOverlay();
        this.elapsedFollowTime = (this.time.now - this.followStartTime) / 1000;
        break;
    }
  }

  private showWarningOverlay() {
    this.warningStartTime = this.time.now;
    this.tweens.add({
      targets: this.warningOverlay,
      alpha: 0.4,
      duration: 200,
    });
  }

  private hideWarningOverlay() {
    this.tweens.add({
      targets: this.warningOverlay,
      alpha: 0,
      duration: 200,
    });
  }

  private isGameActive(): boolean {
    return this.gameState === 'following' || this.gameState === 'warning';
  }

  private isGameWon(): boolean {
    return this.gameState === 'completed';
  }

  private isGameLost(): boolean {
    return this.gameState === 'failed';
  }

  private resetGameState() {
    this.changeGameState('preGame');
    this.followStartTime = 0;
    this.elapsedFollowTime = 0;
    this.lastValidTime = 0;
  }

  // Mobile visibility optimizations
  private initializeMobileOptimizations() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Increase level scale for better mobile visibility
      this.mobileLevelScale = 1.3;
      console.log('Mobile optimizations initialized with scale:', this.mobileLevelScale);
    }
  }

  // Enhanced input handling methods
  private updateMousePosition() {
    try {
      const pointer = this.input.activePointer;
      if (pointer && Number.isFinite(pointer.x) && Number.isFinite(pointer.y)) {
        // Validate pointer coordinates are within reasonable bounds
        const maxX = this.scale.width || 2000;
        const maxY = this.scale.height || 2000;
        
        if (pointer.x >= 0 && pointer.x <= maxX && pointer.y >= 0 && pointer.y <= maxY) {
          this.mousePos.x = pointer.x;
          this.mousePos.y = pointer.y;
        } else {
          console.warn(`Pointer coordinates out of bounds: (${pointer.x}, ${pointer.y})`);
        }
      }
    } catch (error) {
      console.error('Error updating mouse position:', error);
    }
  }

  private performCollisionDetection() {
    try {
      const pointer = this.input.activePointer;
      const isHolding = pointer?.isDown || false;
      const smoothPoints = this.smoothPoints;

      // Validate input data
      if (!smoothPoints || smoothPoints.length === 0) {
        console.warn('No smooth points available for collision detection');
        return null;
      }

      if (!pointer) {
        console.warn('No active pointer for collision detection');
        return null;
      }

      // Validate pointer coordinates
      if (!Number.isFinite(pointer.x) || !Number.isFinite(pointer.y)) {
        console.warn(`Invalid pointer coordinates: (${pointer.x}, ${pointer.y})`);
        return null;
      }

      // Enhanced collision detection with multiple sampling points
      const collisionData = this.calculateCollisionData(pointer, smoothPoints);
      
      return {
        isHolding,
        smoothPoints,
        ...collisionData
      };
      
    } catch (error) {
      console.error('Error in collision detection:', error);
      return null;
    }
  }

  private calculateCollisionData(pointer: Phaser.Input.Pointer, smoothPoints: Phaser.Math.Vector2[]) {
    // Multi-point collision detection for better accuracy
    const samplePoints = this.generateSamplePoints(pointer);
    let bestResult = { minDist: Infinity, closestPoint: 0 };

    for (const samplePoint of samplePoints) {
      const result = this.findClosestPoint(samplePoint, smoothPoints);
      if (result.minDist < bestResult.minDist) {
        bestResult = result;
      }
    }

    // Device and level-based tolerance calculation
    const tolerance = this.calculateDynamicTolerance();
    const progressValidation = this.validateProgressMovement(bestResult.closestPoint);

    return {
      minDist: bestResult.minDist,
      closestPoint: bestResult.closestPoint,
      isOffTrack: bestResult.minDist > tolerance,
      isSkipping: progressValidation.isSkipping,
      isValidProgression: progressValidation.isValid
    };
  }

  private generateSamplePoints(pointer: Phaser.Input.Pointer): Array<{x: number, y: number}> {
    const samplePoints = [{ x: pointer.x, y: pointer.y }];
    
    // Add additional sample points for better touch detection on mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const radius = 15; // Sample radius for touch imprecision
      const samples = 8; // Number of additional samples
      
      for (let i = 0; i < samples; i++) {
        const angle = (i / samples) * 2 * Math.PI;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        samplePoints.push({
          x: pointer.x + offsetX,
          y: pointer.y + offsetY
        });
      }
    }
    
    return samplePoints;
  }

  private findClosestPoint(samplePoint: {x: number, y: number}, smoothPoints: Phaser.Math.Vector2[]) {
    let minDist = Infinity;
    let closestPoint = 0;
    
    // Use per-level search radius if available, otherwise default to 50
    let searchRadius = 50;
    if (this.currentLevelData && this.currentLevelData.rules && this.currentLevelData.rules.movement && typeof this.currentLevelData.rules.movement.lookAheadDistance === 'number') {
      searchRadius = this.currentLevelData.rules.movement.lookAheadDistance;
    }
    searchRadius = Math.max(10, Math.min(searchRadius, Math.floor(smoothPoints.length / 4)));
    
    const startIndex = Math.max(0, this.progressIndex - searchRadius);
    const endIndex = Math.min(smoothPoints.length - 1, this.progressIndex + searchRadius);
    
    for (let i = startIndex; i <= endIndex; i++) {
      if (!smoothPoints[i]) continue;
      
      const dist = Phaser.Math.Distance.Between(
        samplePoint.x,
        samplePoint.y,
        smoothPoints[i].x,
        smoothPoints[i].y
      );
      
      if (dist < minDist) {
        minDist = dist;
        closestPoint = i;
      }
    }
    
    return { minDist, closestPoint };
  }

  private calculateDynamicTolerance(): number {
    // Use per-level collision tolerance if available
    const isMobile = window.innerWidth < 768;
    let baseTolerance = isMobile ? 45 : 35;
    let levelMultiplier = 1.0;
    if (this.currentLevelData && this.currentLevelData.rules && this.currentLevelData.rules.collisionTolerance) {
      const tol = this.currentLevelData.rules.collisionTolerance;
      if (typeof tol.base === 'number') baseTolerance = isMobile && typeof tol.mobile === 'number' ? tol.mobile : tol.base;
      if (typeof tol.levelMultiplier === 'number') levelMultiplier = tol.levelMultiplier;
    } else {
      // Fallback to old logic
      if (this.gameStats.level >= 7) levelMultiplier = 2.0;
      else if (this.gameStats.level >= 5) levelMultiplier = 1.7;
      else if (this.gameStats.level >= 3) levelMultiplier = 1.3;
    }
    // Device performance adjustments
    const performanceMultiplier = this.getPerformanceMultiplier();
    // Input method adjustments
    const inputMultiplier = isMobile ? 1.2 : 1.0;
    return baseTolerance * levelMultiplier * performanceMultiplier * inputMultiplier;
  }

  private getPerformanceMultiplier(): number {
    try {
      // Estimate performance based on frame rate
      const fps = this.game.loop.actualFps;
      if (fps < 30) return 1.5; // Low performance, more tolerance
      if (fps < 45) return 1.2; // Medium performance
      return 1.0; // Good performance
    } catch {
      return 1.0; // Default if unable to measure
    }
  }

  private validateProgressMovement(closestPoint: number) {
    const isMobile = window.innerWidth < 768;
    const maxProgressJump = isMobile ? 30 : 25; // Slightly more lenient for mobile
    const maxBacktrack = 15; // Allow some backtracking for correction
    
    const isSkipping = closestPoint > this.progressIndex + maxProgressJump;
    const isValidProgression = closestPoint <= this.progressIndex + maxProgressJump && 
                              closestPoint >= this.progressIndex - maxBacktrack;
    
    // Additional check for rapid movement detection
    const movementDistance = Math.abs(closestPoint - this.progressIndex);
    const isRapidMovement = movementDistance > maxProgressJump * 0.8;
    
         return {
       isSkipping,
       isValid: isValidProgression && !isRapidMovement,
       isRapidMovement
     };
   }

   private setupEnhancedInputHandlers() {
     // Primary pointer tracking to prevent multi-touch interference
     let primaryPointerId: number | null = null;
     let pointerUpTimeout: NodeJS.Timeout | null = null;
     let lastPointerUpTime = 0;

     // Enhanced pointerdown handler
     this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
       try {
         // Validate pointer
         if (!this.isValidPointer(pointer)) {
           console.warn('Invalid pointer detected, ignoring');
           return;
         }

         // Only allow one primary pointer (prevent multi-touch)
         if (primaryPointerId !== null && pointer.id !== primaryPointerId) {
           console.warn('Multi-touch detected, ignoring secondary pointer');
           return;
         }

         // Only process if in correct state
         if (this.gameState !== 'preGame') {
           return;
         }

         // Set primary pointer
         primaryPointerId = pointer.id;

         // Clear any pending pointer up timeout
         if (pointerUpTimeout) {
           clearTimeout(pointerUpTimeout);
           pointerUpTimeout = null;
         }

         // Start the game ONLY if the interaction is on the start point
         if (this.isOnStartPoint(pointer.x, pointer.y)) {
           // this.sound.play('start', { volume: 0.5 });
           this.changeGameState('following');
         }
       } catch (error) {
         console.error('Error in pointerdown handler:', error);
       }
     });

     // Enhanced pointerup handler with debouncing
     this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
       try {
         // Only process primary pointer
         if (primaryPointerId !== null && pointer.id !== primaryPointerId) {
           return;
         }

         // Reset primary pointer
         primaryPointerId = null;
         lastPointerUpTime = this.time.now;

         // Clear existing timeout
         if (pointerUpTimeout) {
           clearTimeout(pointerUpTimeout);
         }

         // Don't immediately trigger loss - give a brief grace period
         if (this.isGameActive()) {
           pointerUpTimeout = setTimeout(() => {
             // Double-check state and pointer status
             if (this.gameState === 'following' && !this.input.activePointer.isDown) {
               // Additional check for rapid re-press
               const timeSinceUp = this.time.now - lastPointerUpTime;
               if (timeSinceUp > 50) { // 50ms minimum gap
                 this.triggerLoss();
               }
             }
             pointerUpTimeout = null;
           }, 75); // Increased grace period for better mobile experience
         }
       } catch (error) {
         console.error('Error in pointerup handler:', error);
       }
     });

     // Handle pointer move for enhanced tracking
     this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
       try {
         // Only track primary pointer
         if (primaryPointerId !== null && pointer.id !== primaryPointerId) {
           return;
         }

         // Validate rapid movement
         this.validatePointerMovement(pointer);
       } catch (error) {
         console.error('Error in pointermove handler:', error);
       }
     });

     // Handle context menu prevention
     this.input.on('pointerover', () => {
       // Prevent context menus on game area
       try {
         const canvas = this.game.canvas;
         if (canvas) {
           canvas.addEventListener('contextmenu', (e) => e.preventDefault());
         }
       } catch (error) {
         console.warn('Could not prevent context menu:', error);
       }
     });

     // Handle focus/blur for pause functionality
     this.game.events.on('blur', () => {
       if (this.isGameActive()) {
         console.log('Game lost focus, pausing...');
         // Could implement pause functionality here
       }
     });

     this.game.events.on('focus', () => {
       console.log('Game gained focus');
       // Reset any stale input states
       primaryPointerId = null;
       if (pointerUpTimeout) {
         clearTimeout(pointerUpTimeout);
         pointerUpTimeout = null;
       }
     });
   }

   private isValidPointer(pointer: Phaser.Input.Pointer): boolean {
     return pointer && 
            typeof pointer.x === 'number' && Number.isFinite(pointer.x) &&
            typeof pointer.y === 'number' && Number.isFinite(pointer.y) &&
            pointer.x >= 0 && pointer.y >= 0 &&
            pointer.x <= (this.scale.width || 2000) &&
            pointer.y <= (this.scale.height || 2000);
   }

   private validatePointerMovement(pointer: Phaser.Input.Pointer) {
     // Track movement speed to detect impossibly fast movements
     const currentTime = this.time.now;
     const lastPosition = this.mousePos;
     
     if (lastPosition.x !== undefined && lastPosition.y !== undefined) {
       const distance = Phaser.Math.Distance.Between(
         pointer.x, pointer.y, 
         lastPosition.x, lastPosition.y
       );
       
       // Detect impossibly fast movement (likely input glitch)
       const timeDelta = currentTime - (this.lastCollisionCheck || currentTime);
       if (timeDelta > 0) {
         const speed = distance / timeDelta; // pixels per ms
         const maxReasonableSpeed = 5; // 5 pixels per ms maximum
         
         if (speed > maxReasonableSpeed) {
           console.warn(`Detected impossibly fast movement: ${speed.toFixed(2)} px/ms`);
           // Could filter out this movement or apply smoothing
         }
       }
     }
     
     this.lastCollisionCheck = currentTime;
   }

  init(data: { playerName: string, level?: number }) {
    this.playerName = data.playerName;
    const initialLevel = data.level || 1;
    this.gameStats = {
      time: 0,
      collisions: 0,
      level: initialLevel,
      score: 0
    };
  }

  /*
  preload() {
    // Load sound effects from a CDN
    this.load.audio('start', 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_3c70425e4f.mp3');
    this.load.audio('win', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_74c6439a88.mp3');
    this.load.audio('loss', 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_c3328224b7.mp3');
    this.load.audio('click', 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c483739a1f.mp3');
  }
  */

  create() {
    // eslint-disable-next-line no-console
    console.log('GameScene create() called');

    // Add the warning overlay, initially invisible
    this.warningOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xff0000)
      .setOrigin(0)
      .setDepth(1) // Just above the background
      .setAlpha(0);

    // Create a blurred, animated starfield background
    this.createStarfield();

    // Listen for game events
    this.game.events.on('startLevel', this.startLevel, this);
    this.game.events.on('resetLevel', this.resetLevel, this);
    this.game.events.on('goToMenu', this.goToMenu, this);

    // Create wire path graphics
    this.wirePath = this.add.graphics();
    
    // Create loop constraint path (invisible helper)
    this.loopConstraint = this.add.graphics();

    // Enable input
    this.setupInput();

    // Test graphics layer - draw a simple rectangle
    this.wirePath.fillStyle(0xff0000, 1);
    this.wirePath.fillRect(350, 250, 100, 100);
    // eslint-disable-next-line no-console
    console.log('Test rectangle drawn at 350,250');

    // Create labels for start and end points BEFORE loading level
    this.startLabel = this.add.text(0, 0, 'START', { fontSize: '24px', color: '#00ff00', fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setDepth(100);
    this.endLabel = this.add.text(0, 0, 'END', { fontSize: '24px', color: '#ff0000', fontStyle: 'bold', align: 'center' }).setOrigin(0.5).setDepth(100);
    this.startLabel.setVisible(false);
    this.endLabel.setVisible(false);

    // Initialize mobile optimizations
    this.initializeMobileOptimizations();

    this.loadLevel(this.gameStats.level);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.mousePos.x = pointer.x;
      this.mousePos.y = pointer.y;
    });

    // Enhanced input handlers with edge case protection
    this.setupEnhancedInputHandlers();

    this.resetGameState();
    this.magnifier = this.add.graphics();
    this.events.on('postupdate', this.drawMagnifier, this);
    if (this.reportText) this.reportText.destroy();
    this.reportText = this.add.text(400, 100, '', { fontSize: '32px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(100);
    if (this.reportBox) this.reportBox.destroy();
    if (this.retryButton) this.retryButton.destroy();
    if (this.nextButton) this.nextButton.destroy();

    this.reportBox = this.add.graphics().setDepth(101);
    this.retryButton = this.add.text(400, 260, '', { fontSize: '28px', color: '#fff', backgroundColor: '#222', padding: { left: 16, right: 16, top: 8, bottom: 8 } }).setOrigin(0.5).setDepth(102).setInteractive();
    this.nextButton = this.add.text(400, 320, '', { fontSize: '28px', color: '#fff', backgroundColor: '#222', padding: { left: 16, right: 16, top: 8, bottom: 8 } }).setOrigin(0.5).setDepth(102).setInteractive();
    this.reportBox.setVisible(false);
    this.retryButton.setVisible(false);
    this.nextButton.setVisible(false);
    this.followStartTime = 0;
    this.elapsedFollowTime = 0;
    if (this.blurOverlay) this.blurOverlay.destroy();
    this.blurOverlay = this.add.graphics().setDepth(99);
    this.blurOverlay.setVisible(false);
  }

  shutdown() {
    console.log('GameScene shutting down - cleaning up resources');
    
    // Clean up event listeners to prevent memory leaks and state conflicts
    this.game.events.off('startLevel', this.startLevel, this);
    this.game.events.off('resetLevel', this.resetLevel, this);
    this.game.events.off('goToMenu', this.goToMenu, this);
    
    // Clean up input event listeners
    this.input.off('pointerdown');
    this.input.off('pointerup');
    this.input.off('pointermove');
    this.input.off('pointerover');
    
    // Clean up game events
    this.game.events.off('blur');
    this.game.events.off('focus');
    
    // Clean up Phaser objects to prevent memory leaks
    this.cleanupPhaserObjects();
    
    // Clear any pending timeouts
    this.clearAllTimeouts();
    
    // Clean up mobile manager if used
    if (typeof window !== 'undefined') {
      // Don't destroy singleton, but clean up any GameScene-specific references
    }
  }

  private cleanupPhaserObjects() {
    try {
      // Destroy graphics objects
      if (this.wirePath) {
        this.wirePath.destroy();
        this.wirePath = null as any;
      }
      
      if (this.loopConstraint) {
        this.loopConstraint.destroy();
        this.loopConstraint = null;
      }
      
      if (this.magnifier) {
        this.magnifier.destroy();
        this.magnifier = null as any;
      }
      
      if (this.warningOverlay) {
        this.warningOverlay.destroy();
        this.warningOverlay = null as any;
      }
      
      if (this.blurOverlay) {
        this.blurOverlay.destroy();
        this.blurOverlay = null as any;
      }
      
      if (this.reportBox) {
        this.reportBox.destroy();
        this.reportBox = null as any;
      }
      
      // Destroy text objects
      if (this.reportText) {
        this.reportText.destroy();
        this.reportText = null as any;
      }
      
      if (this.reportStatsText) {
        this.reportStatsText.destroy();
        this.reportStatsText = null as any;
      }
      
      if (this.retryButton) {
        this.retryButton.destroy();
        this.retryButton = null as any;
      }
      
      if (this.nextButton) {
        this.nextButton.destroy();
        this.nextButton = null as any;
      }
      
      if (this.startLabel) {
        this.startLabel.destroy();
        this.startLabel = null as any;
      }
      
      if (this.endLabel) {
        this.endLabel.destroy();
        this.endLabel = null as any;
      }
      
      // Clear arrays
      this.wirePoints = [];
      this.smoothPoints = [];
      
    } catch (error) {
      console.error('Error cleaning up Phaser objects:', error);
    }
  }

  private clearAllTimeouts() {
    // This would need to be implemented with timeout tracking
    // For now, just log that we're clearing timeouts
    console.log('Clearing all timeouts and intervals');
  }

  private setupInput() {
    // Mouse/touch input
    // No tool to move, so no pointermove/drag logic needed
    // Keyboard input (WASD/Arrow keys)
    const cursors = this.input.keyboard?.createCursorKeys();
    const wasd = this.input.keyboard?.addKeys('W,S,A,D');

    if (cursors || wasd) {
      // Handle keyboard input in update loop
    }
  }

  private loadLevel(levelNumber: number) {
    try {
      let levelData = this.getLevelData(levelNumber);
      let actualLevelNumber = levelNumber;
      
      // Try fallback levels if requested level fails
      if (!levelData) {
        console.error(`Level ${levelNumber} not found, trying fallbacks...`);
        const fallbacks = [1, 2, 3]; // Try these levels as fallbacks
        
        for (const fallbackLevel of fallbacks) {
          if (fallbackLevel !== levelNumber) {
            levelData = this.getLevelData(fallbackLevel);
            if (levelData) {
              actualLevelNumber = fallbackLevel;
              console.warn(`Using fallback level ${fallbackLevel} instead of ${levelNumber}`);
              break;
            }
          }
        }
      }

      // If all fallbacks fail, create emergency fallback level
      if (!levelData) {
        console.error(`All levels failed to load! Creating emergency fallback.`);
        levelData = this.createEmergencyLevel();
        actualLevelNumber = 1;
      }

      this.currentLevelData = levelData;
      this.gameStats.level = actualLevelNumber;

      // Process wire path with validation and cleanup
      const rawPoints = this.currentLevelData.wirePath;
      
      if (rawPoints.length === 0) {
        console.warn(`Level ${actualLevelNumber} has no wire points, creating default path.`);
        this.wirePoints = this.createDefaultWirePath();
      } else if (rawPoints.length === 1) {
        console.warn(`Level ${actualLevelNumber} has only one point, creating default path.`);
        this.wirePoints = this.createDefaultWirePath();
      } else {
        // Clean and validate the wire path
        const cleanedPoints = this.cleanWirePath(rawPoints);
        
        if (cleanedPoints.length < 2) {
          console.error(`Cleaned wire path has insufficient points, using default.`);
          this.wirePoints = this.createDefaultWirePath();
        } else {
          this.wirePoints = this.scaleWirePathSafely(cleanedPoints);
        }
      }

      // Generate smoothed points with error handling
      this.generateSmoothPoints();
      
    } catch (error) {
      console.error(`Critical error loading level ${levelNumber}:`, error);
      // Ultimate fallback - create a simple working level
      this.createEmergencyFallback();
    }

    this.drawWirePath();
    this.updateStats();
  }

  private createEmergencyLevel(): LevelData {
    return createLevelWithDefaults({
      id: 1,
      name: 'Emergency Level',
      difficulty: 'easy',
      wirePath: [
        { x: -100, y: 0 },
        { x: -50, y: 50 },
        { x: 0, y: 0 },
        { x: 50, y: -50 },
        { x: 100, y: 0 }
      ]
    });
  }

  private createDefaultWirePath(): WirePoint[] {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    
    return [
      { x: centerX - 100, y: centerY },
      { x: centerX - 50, y: centerY - 50 },
      { x: centerX, y: centerY },
      { x: centerX + 50, y: centerY + 50 },
      { x: centerX + 100, y: centerY }
    ];
  }

  private cleanWirePath(points: WirePoint[]): WirePoint[] {
    const cleaned: WirePoint[] = [];
    const DUPLICATE_THRESHOLD = 0.1; // Minimum distance between points
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      
      // Skip invalid points
      if (!this.isValidPoint(point)) {
        console.warn(`Skipping invalid point at index ${i}:`, point);
        continue;
      }
      
      // Skip duplicate points (too close to previous point)
      if (cleaned.length > 0) {
        const lastPoint = cleaned[cleaned.length - 1];
        const distance = Math.sqrt(
          Math.pow(point.x - lastPoint.x, 2) + 
          Math.pow(point.y - lastPoint.y, 2)
        );
        
        if (distance < DUPLICATE_THRESHOLD) {
          console.warn(`Skipping duplicate point at index ${i}:`, point);
          continue;
        }
      }
      
      cleaned.push(point);
    }
    
    return cleaned;
  }

  private isValidPoint(point: any): point is WirePoint {
    return point && 
           typeof point.x === 'number' && Number.isFinite(point.x) &&
           typeof point.y === 'number' && Number.isFinite(point.y) &&
           (point.z === undefined || (typeof point.z === 'number' && Number.isFinite(point.z)));
  }

  private scaleWirePathSafely(rawPoints: WirePoint[]): WirePoint[] {
    try {
      // Calculate bounding box with safety checks
      let minX = rawPoints[0].x, maxX = rawPoints[0].x;
      let minY = rawPoints[0].y, maxY = rawPoints[0].y;

      for (let i = 1; i < rawPoints.length; i++) {
        minX = Math.min(minX, rawPoints[i].x);
        maxX = Math.max(maxX, rawPoints[i].x);
        minY = Math.min(minY, rawPoints[i].y);
        maxY = Math.max(maxY, rawPoints[i].y);
      }

      const pathWidth = maxX - minX;
      const pathHeight = maxY - minY;

      // Handle edge cases in scaling
      if (pathWidth <= 0 || pathHeight <= 0) {
        console.warn('Path has zero width or height, using default scaling');
        return this.createDefaultWirePath();
      }

      // Ensure screen dimensions are valid
      const screenWidth = this.scale.width || 800;
      const screenHeight = this.scale.height || 600;
      
      const padding = Math.max(50, Math.min(screenWidth, screenHeight) * 0.1);
      const availableWidth = screenWidth - padding * 2;
      const availableHeight = screenHeight - padding * 2;

      // Prevent division by zero and ensure positive scaling
      const scaleX = availableWidth / pathWidth;
      const scaleY = availableHeight / pathHeight;
      let scale = Math.min(scaleX, scaleY) * 0.8;

      // Apply mobile scale for better visibility on smaller screens
      scale *= this.mobileLevelScale;

      // Ensure scale is reasonable
      if (!Number.isFinite(scale) || scale <= 0 || scale > 100) {
        console.warn(`Invalid scale calculated: ${scale}, using default`);
        scale = 1;
      }

      // Calculate centers safely
      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;
      const pathCenterX = minX + pathWidth / 2;
      const pathCenterY = minY + pathHeight / 2;

      // Apply scaling and validate results
      const scaledPoints = rawPoints.map(p => {
        const x = centerX + (p.x - pathCenterX) * scale;
        const y = centerY + (p.y - pathCenterY) * scale;
        
        // Validate scaled coordinates
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          console.error(`Invalid scaled coordinates: (${x}, ${y}) for point:`, p);
          throw new Error('Scaling produced invalid coordinates');
        }
        
        return { x, y };
      });

      return scaledPoints;
      
    } catch (error) {
      console.error('Error scaling wire path:', error);
      return this.createDefaultWirePath();
    }
  }

  private generateSmoothPoints() {
    try {
      if (this.wirePoints.length > 1) {
        // Adjust segments based on level complexity and performance
        const baseSegments = this.gameStats.level >= 6 ? 50 : 200;
        const totalPathLength = this.calculatePathLength(this.wirePoints);
        
        // Adjust segments based on path complexity
        const optimalSegments = Math.max(20, Math.min(baseSegments, Math.floor(totalPathLength / 5)));
        
        this.smoothPoints = catmullRomSpline(this.wirePoints, optimalSegments) as Phaser.Math.Vector2[];
        
        // Validate smooth points
        if (!this.smoothPoints || this.smoothPoints.length === 0) {
          throw new Error('Smooth points generation failed');
        }
        
        // Validate each smooth point
        for (let i = 0; i < this.smoothPoints.length; i++) {
          const point = this.smoothPoints[i];
          if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
            console.error(`Invalid smooth point at index ${i}:`, point);
            throw new Error('Invalid smooth point generated');
          }
        }
        
      } else {
        this.smoothPoints = [];
      }
    } catch (error) {
      console.error('Error generating smooth points:', error);
      // Fallback: use wire points directly if smoothing fails
      this.smoothPoints = this.wirePoints.slice() as Phaser.Math.Vector2[];
    }
  }

  private calculatePathLength(points: WirePoint[]): number {
    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }
    return totalLength;
  }

  private createEmergencyFallback() {
    console.error('Creating emergency fallback due to critical error');
    this.currentLevelData = this.createEmergencyLevel();
    this.gameStats.level = 1;
    this.wirePoints = this.createDefaultWirePath();
    this.smoothPoints = this.wirePoints.slice() as Phaser.Math.Vector2[];
  }

  private getLevelData(levelNumber: number): LevelData | null {
    try {
      const levelData = allLevels.get(levelNumber);
      if (!levelData) {
        console.warn(`Level ${levelNumber} not found in allLevels map`);
        return null;
      }
      
      // Validate level data structure
      if (!this.validateLevelData(levelData)) {
        console.error(`Level ${levelNumber} has invalid data structure`);
        return null;
      }
      
      return levelData;
    } catch (error) {
      console.error(`Error loading level ${levelNumber}:`, error);
      return null;
    }
  }

  private validateLevelData(levelData: any): levelData is LevelData {
    if (!levelData || typeof levelData !== 'object') {
      console.error('Level data is not an object');
      return false;
    }

    // Check required properties
    if (typeof levelData.id !== 'number' || levelData.id < 1) {
      console.error('Level id is invalid');
      return false;
    }

    if (typeof levelData.name !== 'string' || levelData.name.trim() === '') {
      console.error('Level name is invalid');
      return false;
    }

    if (!['easy', 'medium', 'hard', 'expert'].includes(levelData.difficulty)) {
      console.error('Level difficulty is invalid');
      return false;
    }

    if (!Array.isArray(levelData.wirePath)) {
      console.error('Level wirePath is not an array');
      return false;
    }

    // Validate wire path points
    if (!this.validateWirePath(levelData.wirePath)) {
      return false;
    }

    return true;
  }

  private validateWirePath(wirePath: any[]): boolean {
    if (wirePath.length === 0) {
      console.warn('Wire path is empty');
      return true; // Empty paths are handled elsewhere
    }

    if (wirePath.length === 1) {
      console.warn('Wire path has only one point');
      return true; // Single points are handled elsewhere
    }

    for (let i = 0; i < wirePath.length; i++) {
      const point = wirePath[i];
      
      if (!point || typeof point !== 'object') {
        console.error(`Wire point ${i} is not an object`);
        return false;
      }

      // Validate coordinates
      if (!this.validateCoordinate(point.x, 'x', i)) return false;
      if (!this.validateCoordinate(point.y, 'y', i)) return false;
      
      // Z coordinate is optional but should be valid if present
      if (point.z !== undefined && !this.validateCoordinate(point.z, 'z', i)) return false;
    }

    return true;
  }

  private validateCoordinate(value: any, axis: string, index: number): boolean {
    if (typeof value !== 'number') {
      console.error(`Point ${index} ${axis} coordinate is not a number: ${value}`);
      return false;
    }

    if (!Number.isFinite(value)) {
      console.error(`Point ${index} ${axis} coordinate is not finite: ${value}`);
      return false;
    }

    // Check for extreme values that could cause rendering issues
    const MAX_COORDINATE = 1000000;
    if (Math.abs(value) > MAX_COORDINATE) {
      console.error(`Point ${index} ${axis} coordinate is too extreme: ${value}`);
      return false;
    }

    return true;
  }

  private drawWirePath() {
    this.wirePath.clear();
    if (this.wirePoints.length < 2) {
      this.wirePath.lineStyle(6, 0xff0000, 1);
      this.wirePath.strokeCircle(400, 300, 50);
      return;
    }
    
    // Dynamically calculate segments based on distance
    const segments = [];
    for (let i = 0; i < this.wirePoints.length - 1; i++) {
        const dist = Phaser.Math.Distance.BetweenPoints(this.wirePoints[i], this.wirePoints[i+1]);
        segments.push(Math.ceil(dist / 10)); // 10px per segment
    }
    
    const smoothPoints = this.smoothPoints;
    
    // Check if we're on mobile (rough approximation)
    const isMobile = window.innerWidth < 768;
    const wireThickness = isMobile ? 2.0 : 1; // Double thickness on mobile
    const glowThickness = isMobile ? 1.8 : 1; // 80% thicker glow on mobile
    
    // Draw completed (green) segment
    if (this.progressIndex > 0) {
      this.wirePath.lineStyle(18 * glowThickness, 0x00ff88, 0.18); // Green glow
      this.wirePath.beginPath();
      this.wirePath.moveTo(smoothPoints[0].x, smoothPoints[0].y);
      for (let i = 1; i <= this.progressIndex; i++) {
        this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
      }
      this.wirePath.strokePath();
      this.wirePath.lineStyle(8 * wireThickness, 0x00ff88, 1); // Green main
      this.wirePath.beginPath();
      this.wirePath.moveTo(smoothPoints[0].x, smoothPoints[0].y);
      for (let i = 1; i <= this.progressIndex; i++) {
        this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
      }
      this.wirePath.strokePath();
    } else {
      // Always draw at least the first point for green
      this.wirePath.lineStyle(8 * wireThickness, 0x00ff88, 0.5);
      this.wirePath.beginPath();
      this.wirePath.moveTo(smoothPoints[0].x, smoothPoints[0].y);
      this.wirePath.lineTo(smoothPoints[0].x, smoothPoints[0].y);
      this.wirePath.strokePath();
    }
    // Draw remaining segment
    const isActivelyFollowing = this.isGameActive();
    this.wirePath.lineStyle(32 * glowThickness, isActivelyFollowing ? 0xffe066 : 0x7f7fff, isActivelyFollowing ? 0.18 : 0.10);
    this.wirePath.beginPath();
    this.wirePath.moveTo(smoothPoints[Math.max(this.progressIndex, 0)].x, smoothPoints[Math.max(this.progressIndex, 0)].y);
    for (let i = Math.max(this.progressIndex, 0); i < smoothPoints.length; i++) {
      this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
    }
    this.wirePath.strokePath();
    this.wirePath.lineStyle(18 * glowThickness, isActivelyFollowing ? 0xffe066 : 0x6366f1, isActivelyFollowing ? 0.28 : 0.18);
    this.wirePath.beginPath();
    this.wirePath.moveTo(smoothPoints[Math.max(this.progressIndex, 0)].x, smoothPoints[Math.max(this.progressIndex, 0)].y);
    for (let i = Math.max(this.progressIndex, 0); i < smoothPoints.length; i++) {
      this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
    }
    this.wirePath.strokePath();
    this.wirePath.lineStyle(8 * wireThickness, isActivelyFollowing ? 0xffe066 : 0xb0b0b0, 1);
    this.wirePath.beginPath();
    this.wirePath.moveTo(smoothPoints[Math.max(this.progressIndex, 0)].x, smoothPoints[Math.max(this.progressIndex, 0)].y);
    for (let i = Math.max(this.progressIndex, 0); i < smoothPoints.length; i++) {
      this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
    }
    this.wirePath.strokePath();
    
    // Draw current position indicator (player position)
    if (this.progressIndex > 0 && this.progressIndex < smoothPoints.length && this.gameState === 'following') {
      const currentPoint = smoothPoints[this.progressIndex];
      if (currentPoint) {
        // Draw pulsing indicator at current position
        const pulseScale = 1 + 0.3 * Math.sin(this.time.now / 200);
        this.wirePath.fillStyle(0x00ffff, 0.8); // Cyan color
        this.wirePath.fillCircle(currentPoint.x, currentPoint.y, (isMobile ? 12 : 8) * pulseScale);
        
        // Draw smaller inner circle
        this.wirePath.fillStyle(0xffffff, 1); // White center
        this.wirePath.fillCircle(currentPoint.x, currentPoint.y, (isMobile ? 6 : 4));
      }
    }
    
    // Draw start and end points (larger on mobile)
    const pointSize = isMobile ? 25 : 15; // Increased from 20 to 25 for mobile
    const startPoint = this.wirePoints[0];
    this.wirePath.fillStyle(0x00ff00, 1);
    this.wirePath.fillCircle(startPoint.x, startPoint.y, pointSize);
    this.startLabel.setPosition(startPoint.x, startPoint.y - 40).setVisible(true);

    const endPoint = this.wirePoints[this.wirePoints.length - 1];
    this.wirePath.fillStyle(0xff0000, 1);
    this.wirePath.fillCircle(endPoint.x, endPoint.y, pointSize);
    this.endLabel.setPosition(endPoint.x, endPoint.y - 40).setVisible(true);
  }

  private createStarfield() {
    // A simple texture for the stars
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(1, 1, 1);
    graphics.generateTexture('star', 2, 2);
    graphics.destroy();

    // The particle emitter for the stars
    const particles = this.add.particles(0, 0, 'star', {
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { min: 0.2, max: 1 },
      alpha: { min: 0.5, max: 1 },
      lifespan: 3000,
      frequency: 100,
      blendMode: 'ADD',
      emitZone: {
        source: new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height),
        type: 'random',
        quantity: 1
      }
    });

    // Create a new camera for the background
    const bgCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    bgCamera.setScroll(0, 0);

    // Apply a blur effect to the background camera
    if (this.renderer.type === Phaser.WEBGL) {
      const blur = (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.getPostPipeline('Blur');
      if (blur) {
        // @ts-ignore - Phaser's type definitions can be incomplete for pipeline properties
        blur.strength = 0.8; // Set blur strength directly
        bgCamera.setPostPipeline(blur);
      }
    }

    // Main camera should ignore the background elements
    this.cameras.main.ignore(particles);
    // Background camera should only see the background elements and not the warning tint
    bgCamera.ignore(this.children.list.filter(child => child !== particles));
    bgCamera.ignore(this.warningOverlay);
  }

  private startLevel(levelNumber: number) {
    this.scene.start('GameScene', { playerName: this.playerName, level: levelNumber });
  }

  private resetLevel() {
    this.scene.start('GameScene', { playerName: this.playerName, level: this.gameStats.level });
  }

  private goToMenu() {
    this.gameStarted = false;
    this.game.events.emit('gameStateChange', 'menu');
  }

  private updateStats() {
    this.game.events.emit('statsUpdate', { ...this.gameStats });
  }

  private isOnStartPoint(x: number, y: number): boolean {
    if (this.wirePoints.length === 0) return false;
    const startPoint = this.wirePoints[0];
    const distance = Phaser.Math.Distance.Between(x, y, startPoint.x, startPoint.y);
    const isMobile = window.innerWidth < 768;
    const touchRadius = isMobile ? 45 : 25; // Increased from 35 to 45 for mobile
    return distance < touchRadius;
  }

  /* No longer needed, logic is now in update()
  private isOnWire(x: number, y: number): boolean {
    const smoothPoints = catmullRomSpline(this.wirePoints, 12);
    for (let i = 0; i < smoothPoints.length; i++) {
      const dx = smoothPoints[i].x - x;
      const dy = smoothPoints[i].y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12) return true;
    }
    return false;
  }
  */

  private triggerLoss(reason?: string) {
    // this.sound.play('loss', { volume: 0.4 });
    // Add some debugging to understand why loss was triggered
    console.log('Loss triggered. Game state:', this.gameState, 'Time since start:', this.time.now - this.followStartTime, 'Reason:', reason);
    if (!this.changeGameState('failed')) {
      console.error('Failed to change state to failed');
      return;
    }
    // Save the reason for display
    this.lastFailureReason = reason || 'You left the trail or skipped!';
    // Random motivational messages for when the player loses
    const motivationalMessages = [
      "Take a deep breath",
      "Slow man !!!",
      "Be patient",
      "Steady hands win the game",
      "Focus and try again",
      "Precision over speed",
      "Stay calm and focused",
      "Practice makes perfect",
      "You've got this!",
      "Almost there, keep trying"
    ];
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    // Emit the loss event to the React component, now with reason
    this.game.events.emit('gameLoss', randomMessage, this.lastFailureReason);
  }

  private triggerWin() {
    // this.sound.play('win', { volume: 0.6 });
    if (!this.changeGameState('completed')) {
      console.error('Failed to change state to completed');
      return;
    }
    this.game.events.emit('levelComplete');
    // The UI will now handle the report screen
  }

  private showReport(msg: string, win: boolean = false) {
    // Blur overlay
    this.blurOverlay.clear();
    this.blurOverlay.fillStyle(0x181c23, 0.7);
    this.blurOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
    this.blurOverlay.setVisible(true);
    // Draw a full screen overlay box
    this.reportBox.clear();
    this.reportBox.fillStyle(0x181c23, 0.95);
    this.reportBox.fillRoundedRect(0, 0, this.scale.width, this.scale.height, 0);
    this.reportBox.lineStyle(4, win ? 0x00ff88 : 0xff6666, 1);
    this.reportBox.strokeRoundedRect(0, 0, this.scale.width, this.scale.height, 0);
    this.reportBox.setVisible(true);
    // Title
    this.reportText.setText(msg).setFontSize(40).setPosition(this.scale.width / 2, this.scale.height / 2 - 60).setColor(win ? '#00ff88' : '#ff6666').setVisible(true).setOrigin(0.5);
    // Stats
    const stats = `Level: ${this.gameStats.level}\nTime: ${this.elapsedFollowTime.toFixed(1)}s`;
    if (this.reportStatsText) this.reportStatsText.destroy();
    this.reportStatsText = this.add.text(this.scale.width / 2, this.scale.height / 2, stats, { fontSize: '24px', color: '#fff', align: 'center' }).setOrigin(0.5).setDepth(102);
    // Retry button
    this.retryButton.setText('Retry').setVisible(true).setPosition(this.scale.width / 2, this.scale.height / 2 + 60);
    this.retryButton.removeAllListeners();
    this.retryButton.on('pointerdown', () => {
      // this.sound.play('click', { volume: 0.7 });
      this.blurOverlay.setVisible(false);
      this.reportBox.setVisible(false);
      this.reportText.setVisible(false);
      this.reportStatsText.setVisible(false);
      this.retryButton.setVisible(false);
      this.nextButton.setVisible(false);
      
      // Reset game state and progress
      this.resetGameState();

      // Redraw the wire to erase the green progress color
      this.drawWirePath();
    });
    // Next Level button (only if win)
    if (win) {
      this.nextButton.setText('Next Level').setVisible(true).setPosition(this.scale.width / 2, this.scale.height / 2 + 120);
      this.nextButton.removeAllListeners();
      this.nextButton.on('pointerdown', () => {
        // this.sound.play('click', { volume: 0.7 });
        this.blurOverlay.setVisible(false);
        this.reportBox.setVisible(false);
        this.reportText.setVisible(false);
        this.reportStatsText.setVisible(false);
        this.retryButton.setVisible(false);
        this.nextButton.setVisible(false);
        
        // This is now handled by the React component
        // this.gameStats.level += 1;
        // this.loadLevel(this.gameStats.level);

        this.resetGameState();
      });
    } else {
      this.nextButton.setVisible(false);
    }
  }

  private drawMagnifier() {
    if (this.gameState !== 'preGame') {
      this.magnifier.clear();
      return;
    }
    this.magnifier.clear();
    // Draw a faint highlight at the mouse position for pre-game
    this.magnifier.lineStyle(2, 0xffffff, 0.3);
    this.magnifier.strokeCircle(this.mousePos.x, this.mousePos.y, 16);
  }

  private handleGameStart() {
    if (this.gameState === 'preGame' && !this.gameStarted) {
      this.changeGameState('following');
    }
  }

  update() {
    // Update mouse position with input validation
    this.updateMousePosition();

    if (this.gameState === 'preGame') {
      this.drawMagnifier();
      return;
    }

    // Enhanced collision detection with edge case handling
    const collisionResult = this.performCollisionDetection();
    if (!collisionResult) {
      return; // Skip update if collision detection failed
    }

    const { isOffTrack, isSkipping, isValidProgression, closestPoint, minDist, isHolding, smoothPoints } = collisionResult;

    if (this.gameState === 'following') {
      if (!isHolding) {
        // Remove this backup check as it's causing false positives
        // The pointerup event handler will handle mouse/touch releases
        // this.triggerLoss();
        // return;
      }
      // Strict: If off track or skipping, do not update progress or allow win
      if (isOffTrack || isSkipping || !isValidProgression) {
        // Show the red warning overlay immediately
        this.showWarningOverlay();
        // Only trigger warning/loss if player has been off-track for a significant period
        const currentTime = this.time.now;
        if (this.lastValidTime === 0) {
          this.lastValidTime = currentTime;
        }
        // Use the per-level grace period if available
        let gracePeriod = 300;
        if (this.currentLevelData && this.currentLevelData.rules && this.currentLevelData.rules.timing && typeof this.currentLevelData.rules.timing.gracePeriod === 'number') {
          gracePeriod = this.currentLevelData.rules.timing.gracePeriod;
        }
        if (currentTime - this.lastValidTime > gracePeriod) {
          this.triggerLoss();
        }
        return;
      } else {
        // Player is on track, reset the valid time tracker and hide the warning overlay
        this.lastValidTime = 0;
        this.hideWarningOverlay();
      }
      if (this.followStartTime === 0) {
        this.followStartTime = this.time.now;
      }
      // Only update progress if moving forward and following valid progression, and not off track or skipping
      if (closestPoint > this.progressIndex && !isOffTrack && !isSkipping && isValidProgression) {
        this.progressIndex = closestPoint;
        this.drawWirePath();
      }
      // Only allow win if not off track or skipping
      if (!isOffTrack && !isSkipping && this.progressIndex >= smoothPoints.length - 1) {
        this.triggerWin();
      }
    }

    if (this.gameState === 'warning') {
      const elapsed = this.time.now - this.warningStartTime;
      if (elapsed < 300) { 
        this.warningOverlay.setAlpha(0.2 * Math.sin(elapsed / 50));
      } else {
        this.warningOverlay.setAlpha(0);
      }
      if (isHolding && !isOffTrack && !isSkipping) {
        // Player recovered
        this.changeGameState('following');
      } else if (this.time.now - this.warningStartTime > 2000 || !isHolding) {
        // Much longer warning time (2 seconds) for complex levels
        this.triggerLoss();
      }
    }
    if (this.isGameLost() || this.isGameWon()) {
      return;
    }
    if (!this.gameStarted) return;

    // Update game time
    this.gameStats.time = (this.time.now - this.startTime) / 1000;
    
    // Check for level completion
    // The loop tool is removed, so this logic is no longer relevant.
    // The game will end when the loop reaches the end of the wire.

    // Update stats
    this.updateStats();

    // Handle keyboard input
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      const speed = 3;
      let dx = 0;
      let dy = 0;

      if (cursors.left?.isDown) dx = -speed;
      if (cursors.right?.isDown) dx = speed;
      if (cursors.up?.isDown) dy = -speed;
      if (cursors.down?.isDown) dy = speed;

      if (dx !== 0 || dy !== 0) {
        // The loop tool is removed, so this logic is no longer relevant.
        // The loop cannot be moved by keyboard.
      }
    }
  }
}