import Phaser from '@phaserjs/phaser';
import { GameConfig } from './config/GameConfig';
import { MainScene } from './scenes/MainScene';

class Game extends Phaser.Game {
  constructor(parent: HTMLElement) {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: parent,
      width: GameConfig.WIDTH,
      height: GameConfig.HEIGHT,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [
        MainScene
      ]
    };

    super(config);
  }

  destroy(): void {
    super.destroy(true);
  }
}

export { Game };
