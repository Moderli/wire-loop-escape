import Phaser from 'phaser';
import { wireLoop as wireLoop1 } from '@/levels/level1';
import { wireLoop as wireLoop2 } from '@/levels/level2';
import { wireLoop as wireLoop3 } from '@/levels/level3';

interface WirePoint {
  x: number;
  y: number;
}

interface LevelData {
  id: number;
  name: string;
  wirePath: WirePoint[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number;
  movingWires?: boolean;
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
  private gameStats = {
    time: 0,
    collisions: 0,
    level: 1,
    score: 0
  };
  private currentLevel: LevelData | null = null;
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
  private gameState: 'preGame' | 'following' | 'lost' = 'preGame';
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

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // eslint-disable-next-line no-console
    console.log('GameScene create() called');
    
    // Create game background
    this.add.rectangle(0, 0, this.scale.width * 2, this.scale.height * 2, 0x0a0a1a);

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

    // Start with level 1
    this.loadLevel(1);
    // eslint-disable-next-line no-console
    console.log('Level 1 loaded in create()');

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.mousePos.x = pointer.x;
      this.mousePos.y = pointer.y;
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameState === 'preGame' && pointer.rightButtonDown() && this.isOnWire(this.mousePos.x, this.mousePos.y)) {
        this.gameState = 'following';
        this.gameStarted = true;
      }
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.gameState === 'following' && !pointer.rightButtonDown()) {
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
    this.currentLevel = this.getLevelData(levelNumber);
    this.gameStats.level = levelNumber;
    this.wirePoints = [...this.currentLevel.wirePath];
    // Debug log
    // eslint-disable-next-line no-console
    console.log('loadLevel', levelNumber, 'wirePoints:', this.wirePoints);
    this.drawWirePath();
  }

  private getLevelData(levelNumber: number): LevelData {
    // Project 3D spiral points to 2D (x, y) with better scaling and centering
    const scale = 2.8; // Make the model even bigger
    const centerX = 400;
    const centerY = 300;
    const project = (pt: { x: number; y: number; z: number }) => ({
      x: centerX + pt.x * scale,
      y: centerY + pt.y * scale
    });
    const levels: LevelData[] = [
      {
        id: 1,
        name: 'Spiral 1',
        difficulty: 'easy',
        wirePath: wireLoop1.map(project)
      },
      {
        id: 2,
        name: 'Spiral 2',
        difficulty: 'medium',
        wirePath: wireLoop2.map(project)
      },
      {
        id: 3,
        name: 'Spiral 3',
        difficulty: 'hard',
        wirePath: wireLoop3.map(project)
      }
    ];
    // Debug log
    if (levels[levelNumber - 1]) {
      // eslint-disable-next-line no-console
      console.log('Level', levelNumber, 'wirePath:', levels[levelNumber - 1].wirePath);
    }
    return levels[levelNumber - 1] || levels[0];
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
    this.wirePath.fillStyle(0x00ff00, 1);
    this.wirePath.fillCircle(this.wirePoints[0].x, this.wirePoints[0].y, 10);
    const endPoint = this.wirePoints[this.wirePoints.length - 1];
    this.wirePath.fillStyle(0xff0000, 1);
    this.wirePath.fillCircle(endPoint.x, endPoint.y, 10);
  }

  private startLevel(levelNumber: number) {
    // eslint-disable-next-line no-console
    console.log('startLevel called with level:', levelNumber);
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

  private triggerLoss() {
    this.gameState = 'lost';
    this.gameStarted = false;
    this.win = false;
    this.elapsedFollowTime = (this.time.now - this.followStartTime) / 1000;
    this.showReport('You Lost!', false);
    // Wait for retry button
  }

  private triggerWin() {
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
    this.blurOverlay.fillRect(0, 0, 800, 600);
    this.blurOverlay.setVisible(true);
    // Draw a full screen overlay box
    this.reportBox.clear();
    this.reportBox.fillStyle(0x181c23, 0.95);
    this.reportBox.fillRoundedRect(0, 0, 800, 600, 0);
    this.reportBox.lineStyle(4, win ? 0x00ff88 : 0xff6666, 1);
    this.reportBox.strokeRoundedRect(0, 0, 800, 600, 0);
    this.reportBox.setVisible(true);
    // Title
    this.reportText.setText(msg).setFontSize(40).setPosition(400, 300 - 60).setColor(win ? '#00ff88' : '#ff6666').setVisible(true);
    // Stats
    const stats = `Level: ${this.gameStats.level}\nTime: ${this.elapsedFollowTime.toFixed(1)}s`;
    if (this.reportStatsText) this.reportStatsText.destroy();
    this.reportStatsText = this.add.text(400, 300, stats, { fontSize: '24px', color: '#fff', align: 'center' }).setOrigin(0.5).setDepth(102);
    // Retry button
    this.retryButton.setText('Retry').setVisible(true).setY(300 + 50);
    this.retryButton.removeAllListeners();
    this.retryButton.on('pointerdown', () => {
      this.blurOverlay.setVisible(false);
      this.reportBox.setVisible(false);
      this.reportText.setVisible(false);
      this.reportStatsText.setVisible(false);
      this.retryButton.setVisible(false);
      this.nextButton.setVisible(false);
      this.progressIndex = 0;
      this.gameState = 'preGame';
      this.followStartTime = 0;
      this.elapsedFollowTime = 0;
    });
    // Next Level button (only if win)
    if (win) {
      this.nextButton.setText('Next Level').setVisible(true).setY(300 + 100);
      this.nextButton.removeAllListeners();
      this.nextButton.on('pointerdown', () => {
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

  update() {
    if (this.gameState === 'preGame') {
      this.drawMagnifier();
      return;
    }
    if (this.gameState === 'following') {
      if (this.followStartTime === 0) {
        this.followStartTime = this.time.now;
      }
      const smoothPoints = catmullRomSpline(this.wirePoints, 12);
      let minDist = Infinity;
      let closestIdx = 0;
      for (let i = 0; i < smoothPoints.length; i++) {
        const dx = smoothPoints[i].x - this.mousePos.x;
        const dy = smoothPoints[i].y - this.mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }
      if (closestIdx > this.progressIndex) {
        this.progressIndex = closestIdx;
      }
      // Win condition: reached end
      if (this.progressIndex >= smoothPoints.length - 1) {
        this.triggerWin();
        return;
      }
      if (minDist > 12) {
        this.triggerLoss();
      }
      if (!this.input.activePointer.rightButtonDown()) {
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