import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.createStarfield();

    // Show the menu container
    const menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
      menuContainer.style.display = 'block';
    }

    const startButton = document.getElementById('start-button');
    const nameInput = document.getElementById('name-input') as HTMLInputElement;
    const warningMessage = document.getElementById('warning-message');

    if (startButton && nameInput && warningMessage) {
      startButton.addEventListener('click', () => {
        const playerName = nameInput.value.trim();
        if (playerName) {
          if (menuContainer) {
            menuContainer.style.display = 'none';
          }
          this.scene.start('GameScene', { playerName });
        } else {
          warningMessage.style.display = 'block';
        }
      });
    }

    // Listen for menu events
    this.game.events.on('goToMenu', () => {
      if (menuContainer) {
        menuContainer.style.display = 'block';
      }
      this.scene.start('MenuScene');
    });
  }

  private createStarfield() {
    // Create a texture for the stars
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xffffff, 1);
    starGraphics.fillCircle(1, 1, 1);
    starGraphics.generateTexture('star', 2, 2);
    starGraphics.destroy();

    // Create a starfield
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * this.scale.width;
      const y = Math.random() * this.scale.height;
      const size = Math.random() * 2 + 1;
      const speed = Math.random() * 0.2 + 0.1;
      const star = this.add.sprite(x, y, 'star');
      star.setScale(size / 2);
      star.setAlpha(0.5);

      this.tweens.add({
        targets: star,
        y: y + 100,
        duration: (100 / speed) * 1000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onRepeat: () => {
          star.y = y - 100;
        }
      });
    }
  }

  update() {
    // Menu scene doesn't need continuous updates
  }
}