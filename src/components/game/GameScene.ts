import Phaser from 'phaser';
import { LevelData, WirePoint } from '@/lib/types';

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

// Add Catmull-Rom spline interpolation OUTSIDE the class
function catmullRomSpline(points: WirePoint[], numSegments = 16) {
  const result: WirePoint[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    for (let t = 0; t < numSegments; t++) {
      const s = t / numSegments;
      const s2 = s * s;
      const s3 = s2 * s;
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
      result.push({ x, y });
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

export class GameScene extends Phaser.Scene {
  private wirePath!: Phaser.GameObjects.Graphics;
  private wirePoints: WirePoint[] = [];
  private startTime: number = 0;
  private playerName: string = '';
  private gameStats = {
    time: 0,
    collisions: 0,
    level: 1,
    score: 0
  };
  private currentLevelData: LevelData | null = null;
  private gameStarted = false;
  private collisionCooldown = false;
  private loopConstraint: Phaser.GameObjects.Graphics | null = null;
  private preGame: boolean = true;
  private magnifier!: Phaser.GameObjects.Graphics;
  private magnifierRadius: number = 32;
  private mousePos = { x: 400, y: 300 };
  private following: boolean = false;
  private lost: boolean = false;
  // State machine: 'preGame' | 'following' | 'lost'
  private gameState: 'preGame' | 'following' | 'warning' | 'lost' = 'preGame';
  private progressIndex: number = 0;
  private reportText!: Phaser.GameObjects.Text;
  private win: boolean = false;
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

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { playerName: string }) {
    this.playerName = data.playerName;
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

    // Start with level 1
    this.loadLevel(1);
    // eslint-disable-next-line no-console
    console.log('Level 1 loaded in create()');

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.mousePos.x = pointer.x;
      this.mousePos.y = pointer.y;
    });

    // A single, consolidated input handler
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameState !== 'preGame') {
        return;
      }

      // Start the game ONLY if the interaction is on the start point
      if (this.isOnStartPoint(pointer.x, pointer.y)) {
        // this.sound.play('start', { volume: 0.5 });
        this.gameState = 'following';
        this.gameStarted = true;
        this.followStartTime = this.time.now;
        this.progressIndex = 0;
      }
    });

    this.input.on('pointerup', () => {
      if (this.gameState === 'following') {
        this.triggerLoss();
      }
    });

    this.gameState = 'preGame';
    this.magnifier = this.add.graphics();
    this.events.on('postupdate', this.drawMagnifier, this);
    this.progressIndex = 0;
    this.win = false;
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
    this.currentLevelData = this.getLevelData(levelNumber);
    if (!this.currentLevelData) {
      console.error(`Level ${levelNumber} not found!`);
      this.currentLevelData = this.getLevelData(1);
    }

    this.gameStats.level = levelNumber;

    // Calculate the bounding box of the original wire path
    const rawPoints = this.currentLevelData.wirePath;
    if (rawPoints.length === 0) return;

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

    // Determine the optimal scale to fit the path on the screen
    const padding = 100; // px
    const availableWidth = this.scale.width - padding * 2;
    const availableHeight = this.scale.height - padding * 2;

    const scaleX = availableWidth / pathWidth;
    const scaleY = availableHeight / pathHeight;
    const scale = Math.min(scaleX, scaleY) * 0.8; // Use 80% of the available space

    // Project and scale the points
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const pathCenterX = minX + pathWidth / 2;
    const pathCenterY = minY + pathHeight / 2;

    this.wirePoints = this.currentLevelData.wirePath.map(p => ({
      x: centerX + (p.x - pathCenterX) * scale,
      y: centerY + (p.y - pathCenterY) * scale,
    }));

    this.drawWirePath();
  }

  private getLevelData(levelNumber: number): LevelData | null {
    return allLevels.get(levelNumber) || null;
  }

  private drawWirePath() {
    this.wirePath.clear();
    if (this.wirePoints.length < 2) {
      this.wirePath.lineStyle(6, 0xff0000, 1);
      this.wirePath.strokeCircle(400, 300, 50);
      return;
    }
    const smoothPoints = catmullRomSpline(this.wirePoints, 12);
    // Draw completed (green) segment
    if (this.progressIndex > 0) {
      this.wirePath.lineStyle(18, 0x00ff88, 0.18); // Green glow
      this.wirePath.beginPath();
      this.wirePath.moveTo(smoothPoints[0].x, smoothPoints[0].y);
      for (let i = 1; i <= this.progressIndex; i++) {
        this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
      }
      this.wirePath.strokePath();
      this.wirePath.lineStyle(8, 0x00ff88, 1); // Green main
      this.wirePath.beginPath();
      this.wirePath.moveTo(smoothPoints[0].x, smoothPoints[0].y);
      for (let i = 1; i <= this.progressIndex; i++) {
        this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
      }
      this.wirePath.strokePath();
    } else {
      // Always draw at least the first point for green
      this.wirePath.lineStyle(8, 0x00ff88, 0.5);
      this.wirePath.beginPath();
      this.wirePath.moveTo(smoothPoints[0].x, smoothPoints[0].y);
      this.wirePath.lineTo(smoothPoints[0].x, smoothPoints[0].y);
      this.wirePath.strokePath();
    }
    // Draw remaining segment
    this.wirePath.lineStyle(32, this.gameState === 'following' ? 0xffe066 : 0x7f7fff, this.gameState === 'following' ? 0.18 : 0.10);
    this.wirePath.beginPath();
    this.wirePath.moveTo(smoothPoints[Math.max(this.progressIndex, 0)].x, smoothPoints[Math.max(this.progressIndex, 0)].y);
    for (let i = Math.max(this.progressIndex, 0); i < smoothPoints.length; i++) {
      this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
    }
    this.wirePath.strokePath();
    this.wirePath.lineStyle(18, this.gameState === 'following' ? 0xffe066 : 0x6366f1, this.gameState === 'following' ? 0.28 : 0.18);
    this.wirePath.beginPath();
    this.wirePath.moveTo(smoothPoints[Math.max(this.progressIndex, 0)].x, smoothPoints[Math.max(this.progressIndex, 0)].y);
    for (let i = Math.max(this.progressIndex, 0); i < smoothPoints.length; i++) {
      this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
    }
    this.wirePath.strokePath();
    this.wirePath.lineStyle(8, this.gameState === 'following' ? 0xffe066 : 0xb0b0b0, 1);
    this.wirePath.beginPath();
    this.wirePath.moveTo(smoothPoints[Math.max(this.progressIndex, 0)].x, smoothPoints[Math.max(this.progressIndex, 0)].y);
    for (let i = Math.max(this.progressIndex, 0); i < smoothPoints.length; i++) {
      this.wirePath.lineTo(smoothPoints[i].x, smoothPoints[i].y);
    }
    this.wirePath.strokePath();
    // Draw start and end points
    const startPoint = this.wirePoints[0];
    this.wirePath.fillStyle(0x00ff00, 1);
    this.wirePath.fillCircle(startPoint.x, startPoint.y, 15); // Increased size
    this.startLabel.setPosition(startPoint.x, startPoint.y - 40).setVisible(true);

    const endPoint = this.wirePoints[this.wirePoints.length - 1];
    this.wirePath.fillStyle(0xff0000, 1);
    this.wirePath.fillCircle(endPoint.x, endPoint.y, 15); // Increased size
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
    // eslint-disable-next-line no-console
    console.log('startLevel called with level:', levelNumber);
    
    // Hide old labels before loading new level
    if (this.startLabel) this.startLabel.setVisible(false);
    if (this.endLabel) this.endLabel.setVisible(false);

    this.loadLevel(levelNumber);
    this.gameStats = {
      time: 0,
      collisions: 0,
      level: levelNumber,
      score: 0
    };
    this.startTime = this.time.now;
    this.gameStarted = true;
    this.scene.start('GameScene');
  }

  private resetLevel() {
    this.gameStats.time = 0;
    this.gameStats.collisions = 0;
    this.gameStats.score = 0;
    this.startTime = this.time.now;
    this.gameStarted = true;
    this.updateStats();
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
    return distance < 25; // Increased clickable radius
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

  private triggerLoss() {
    // this.sound.play('loss', { volume: 0.4 });
    this.gameState = 'lost';
    this.gameStarted = false;
    this.win = false;
    this.elapsedFollowTime = (this.time.now - this.followStartTime) / 1000;
    
    // Ensure warning overlay is hidden
    this.warningOverlay.setAlpha(0);
    
    this.showReport('You Lost!', false);
    // Wait for retry button
  }

  private triggerWin() {
    // this.sound.play('win', { volume: 0.6 });
    this.gameState = 'preGame';
    this.gameStarted = false;
    this.win = true;
    this.elapsedFollowTime = (this.time.now - this.followStartTime) / 1000;
    this.showReport('You Win!', true);
    // Wait for next/retry button
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
      this.progressIndex = 0;
      this.gameState = 'preGame';
      this.followStartTime = 0;
      this.elapsedFollowTime = 0;

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
        this.progressIndex = 0;
        this.gameStats.level += 1;
        this.loadLevel(this.gameStats.level);
        this.gameState = 'preGame';
        this.followStartTime = 0;
        this.elapsedFollowTime = 0;
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
      this.gameStarted = true;
      this.gameState = 'following';
      this.followStartTime = 0;
      this.elapsedFollowTime = 0;
    }
  }

  update() {
    this.mousePos.x = this.input.mousePointer.x;
    this.mousePos.y = this.input.mousePointer.y;

    if (this.gameState === 'preGame') {
      this.drawMagnifier();
      return;
    }

    const pointer = this.input.activePointer;
    const isHolding = pointer.isDown;
    const smoothPoints = catmullRomSpline(this.wirePoints, 12);

    let minDist = Infinity;
    let closestPoint = 0;
    for (let i = 0; i < smoothPoints.length; i++) {
        const dist = Phaser.Math.Distance.Between(
            pointer.x,
            pointer.y,
            smoothPoints[i].x,
            smoothPoints[i].y
        );
        if (dist < minDist) {
            minDist = dist;
            closestPoint = i;
        }
    }

    const isOffTrack = minDist > 15;
    // This setting prevents the player from skipping large sections of the wire.
    const maxProgressJump = 30; // Tunable: how many points ahead the player can be.
    const isSkipping = closestPoint > this.progressIndex + maxProgressJump;

    if (this.gameState === 'following') {
      if (!isHolding) {
        // This is a backup check, pointerup event should handle it.
        this.triggerLoss();
        return;
      }
      
      if (isOffTrack || isSkipping) {
        this.gameState = 'warning';
        this.warningStartTime = this.time.now;
        this.tweens.add({
            targets: this.warningOverlay,
            alpha: 0.4,
            duration: 200,
        });
        return;
      }

      if (this.followStartTime === 0) {
        this.followStartTime = this.time.now;
      }

      // Update progress, it's valid if we are here
      if (closestPoint > this.progressIndex) {
        this.progressIndex = closestPoint;
        this.drawWirePath();
      }

      if (this.progressIndex >= smoothPoints.length - 1) {
        this.triggerWin();
      }
    }

    if (this.gameState === 'warning') {
      if (isHolding && !isOffTrack && !isSkipping) {
        // Player recovered
        this.gameState = 'following';
        this.tweens.add({
            targets: this.warningOverlay,
            alpha: 0,
            duration: 200,
        });
      } else if (this.time.now - this.warningStartTime > 500 || !isHolding) {
        // Timer ran out or player released click/touch
        this.triggerLoss();
      }
    }
    if (this.gameState === 'lost' || this.win) {
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