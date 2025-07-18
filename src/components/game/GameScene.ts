import Phaser from 'phaser';

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

export class GameScene extends Phaser.Scene {
  private loop!: Phaser.GameObjects.Arc;
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

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
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

    // Create the loop
    this.createLoop();

    // Enable input
    this.setupInput();

    // Start with level 1
    this.loadLevel(1);
  }

  private createLoop() {
    this.loop = this.add.circle(100, 300, 8, 0x00ffff);
    this.loop.setStrokeStyle(2, 0x00cccc);
    this.loop.setInteractive({ draggable: true });
    
    // Add glow effect
    this.loop.setData('glowTween', this.tweens.add({
      targets: this.loop,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    }));
  }

  private setupInput() {
    // Mouse/touch input
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.gameStarted && this.loop) {
        this.moveLoopToPosition(pointer.x, pointer.y);
      }
    });

    // Drag input for loop
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject === this.loop && this.gameStarted) {
        this.moveLoopToPosition(pointer.x, pointer.y);
      }
    });

    // Keyboard input (WASD/Arrow keys)
    const cursors = this.input.keyboard?.createCursorKeys();
    const wasd = this.input.keyboard?.addKeys('W,S,A,D');

    if (cursors || wasd) {
      // Handle keyboard input in update loop
    }
  }

  private moveLoopToPosition(targetX: number, targetY: number) {
    if (!this.loop || !this.gameStarted) return;

    // Check if position is near the wire constraint path
    const constrainedPosition = this.constrainToWirePath(targetX, targetY);
    
    this.loop.setPosition(constrainedPosition.x, constrainedPosition.y);
    
    // Check for collision with wire
    this.checkWireCollision();
  }

  private constrainToWirePath(x: number, y: number): { x: number, y: number } {
    if (this.wirePoints.length < 2) return { x, y };

    let closestPoint = { x, y };
    let minDistance = Infinity;

    // Find the closest point on the wire path
    for (let i = 0; i < this.wirePoints.length - 1; i++) {
      const p1 = this.wirePoints[i];
      const p2 = this.wirePoints[i + 1];
      
      const closest = this.getClosestPointOnLine(x, y, p1.x, p1.y, p2.x, p2.y);
      const distance = Phaser.Math.Distance.Between(x, y, closest.x, closest.y);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = closest;
      }
    }

    return closestPoint;
  }

  private getClosestPointOnLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return { x: x1, y: y1 };
    
    let param = dot / lenSq;

    param = Math.max(0, Math.min(1, param));

    return {
      x: x1 + param * C,
      y: y1 + param * D
    };
  }

  private checkWireCollision() {
    if (!this.loop || this.collisionCooldown) return;

    const loopBounds = this.loop.getBounds();
    const wireThickness = 6; // Wire visual thickness

    // Check collision with wire path
    for (let i = 0; i < this.wirePoints.length - 1; i++) {
      const p1 = this.wirePoints[i];
      const p2 = this.wirePoints[i + 1];
      
      const distance = this.distanceToLineSegment(
        this.loop.x, this.loop.y,
        p1.x, p1.y, p2.x, p2.y
      );
      
      if (distance < wireThickness + 8) { // Loop radius + wire thickness
        this.handleCollision();
        break;
      }
    }
  }

  private distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    
    if (param < 0) return Math.sqrt(A * A + B * B);
    if (param > 1) return Math.sqrt((px - x2) * (px - x2) + (py - y2) * (py - y2));
    
    const projX = x1 + param * C;
    const projY = y1 + param * D;
    
    return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
  }

  private handleCollision() {
    if (this.collisionCooldown) return;

    this.gameStats.collisions++;
    this.collisionCooldown = true;

    // Emit collision event for UI feedback
    this.game.events.emit('collision');

    // Flash the loop red
    this.loop.setFillStyle(0xff0000);
    
    // Reset loop to start position
    this.resetLoopPosition();

    // Reset collision cooldown
    this.time.delayedCall(500, () => {
      this.collisionCooldown = false;
      this.loop.setFillStyle(0x00ffff);
    });

    this.updateStats();
  }

  private resetLoopPosition() {
    if (this.wirePoints.length > 0) {
      this.loop.setPosition(this.wirePoints[0].x, this.wirePoints[0].y);
    }
  }

  private checkLevelComplete() {
    if (!this.wirePoints.length) return;
    
    const endPoint = this.wirePoints[this.wirePoints.length - 1];
    const distance = Phaser.Math.Distance.Between(this.loop.x, this.loop.y, endPoint.x, endPoint.y);
    
    if (distance < 20) { // Close enough to end point
      this.completeLevel();
    }
  }

  private completeLevel() {
    this.gameStarted = false;
    
    // Calculate final score
    const timeBonus = Math.max(0, 5000 - this.gameStats.time * 100);
    const collisionPenalty = this.gameStats.collisions * 200;
    this.gameStats.score = Math.max(0, timeBonus - collisionPenalty);

    // Save score to localStorage
    const levelKey = `wireloop-level-${this.gameStats.level}`;
    const savedScore = localStorage.getItem(levelKey);
    if (!savedScore || parseInt(savedScore) < this.gameStats.score) {
      localStorage.setItem(levelKey, this.gameStats.score.toString());
    }

    this.game.events.emit('levelComplete');
    this.game.events.emit('gameStateChange', 'gameOver');
  }

  private loadLevel(levelNumber: number) {
    this.currentLevel = this.getLevelData(levelNumber);
    this.gameStats.level = levelNumber;
    this.wirePoints = [...this.currentLevel.wirePath];
    this.drawWirePath();
    this.resetLoopPosition();
  }

  private getLevelData(levelNumber: number): LevelData {
    const levels: LevelData[] = [
      {
        id: 1,
        name: "First Steps",
        difficulty: 'easy',
        wirePath: [
          { x: 100, y: 300 },
          { x: 200, y: 300 },
          { x: 300, y: 250 },
          { x: 400, y: 300 },
          { x: 500, y: 300 },
          { x: 600, y: 250 },
          { x: 700, y: 300 }
        ]
      },
      {
        id: 2,
        name: "Gentle Curves",
        difficulty: 'easy',
        wirePath: [
          { x: 100, y: 400 },
          { x: 150, y: 350 },
          { x: 200, y: 300 },
          { x: 250, y: 250 },
          { x: 350, y: 200 },
          { x: 450, y: 250 },
          { x: 550, y: 300 },
          { x: 650, y: 350 },
          { x: 700, y: 400 }
        ]
      },
      {
        id: 3,
        name: "Sharp Turns",
        difficulty: 'medium',
        wirePath: [
          { x: 100, y: 500 },
          { x: 200, y: 500 },
          { x: 200, y: 400 },
          { x: 300, y: 400 },
          { x: 300, y: 300 },
          { x: 400, y: 300 },
          { x: 400, y: 200 },
          { x: 500, y: 200 },
          { x: 500, y: 300 },
          { x: 600, y: 300 },
          { x: 700, y: 300 }
        ]
      }
      // More levels can be added here
    ];

    return levels[levelNumber - 1] || levels[0];
  }

  private drawWirePath() {
    this.wirePath.clear();
    
    if (this.wirePoints.length < 2) return;

    // Draw the wire with gradient effect
    this.wirePath.lineStyle(6, 0x6366f1, 1);
    
    // Draw the main wire path
    this.wirePath.beginPath();
    this.wirePath.moveTo(this.wirePoints[0].x, this.wirePoints[0].y);
    
    for (let i = 1; i < this.wirePoints.length; i++) {
      this.wirePath.lineTo(this.wirePoints[i].x, this.wirePoints[i].y);
    }
    
    this.wirePath.strokePath();

    // Add glow effect
    this.wirePath.lineStyle(12, 0x6366f1, 0.3);
    this.wirePath.beginPath();
    this.wirePath.moveTo(this.wirePoints[0].x, this.wirePoints[0].y);
    
    for (let i = 1; i < this.wirePoints.length; i++) {
      this.wirePath.lineTo(this.wirePoints[i].x, this.wirePoints[i].y);
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
    this.resetLoopPosition();
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

  update() {
    if (!this.gameStarted) return;

    // Update game time
    this.gameStats.time = (this.time.now - this.startTime) / 1000;
    
    // Check for level completion
    this.checkLevelComplete();
    
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
        this.moveLoopToPosition(this.loop.x + dx, this.loop.y + dy);
      }
    }
  }
}