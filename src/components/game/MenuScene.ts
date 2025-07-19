import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Create a simple animated background for the menu
    this.add.rectangle(0, 0, this.scale.width * 2, this.scale.height * 2, 0x0a0a1a);
    
    // Add some animated wire-like elements for visual interest
    this.createBackgroundElements();
    
    // Listen for menu events
    this.game.events.on('goToMenu', () => {
      this.scene.start('MenuScene');
    });
  }

  private createBackgroundElements() {
    const graphics = this.add.graphics();
    
    // Create animated background wires
    for (let i = 0; i < 5; i++) {
      const startX = Math.random() * this.scale.width;
      const startY = Math.random() * this.scale.height;
      const endX = Math.random() * this.scale.width;
      const endY = Math.random() * this.scale.height;
      
      graphics.lineStyle(2, 0x6366f1, 0.3);
      graphics.beginPath();
      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
      graphics.strokePath();
      
      // Add gentle pulsing animation
      this.tweens.add({
        targets: graphics,
        alpha: 0.1,
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Add floating particles
    for (let i = 0; i < 10; i++) {
      const particle = this.add.circle(
        Math.random() * this.scale.width,
        Math.random() * this.scale.height,
        2,
        0x00ffff,
        0.5
      );

      this.tweens.add({
        targets: particle,
        x: Math.random() * this.scale.width,
        y: Math.random() * this.scale.height,
        duration: 5000 + Math.random() * 5000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });

      this.tweens.add({
        targets: particle,
        alpha: 0.1,
        duration: 1000 + Math.random() * 2000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
  }

  update() {
    // Menu scene doesn't need continuous updates
  }
}