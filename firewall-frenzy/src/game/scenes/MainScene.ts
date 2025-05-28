import Phaser from '@phaserjs/phaser';
import { GameConfig } from '../../../config/GameConfig';
import { useGameStore } from '../../../store/gameStore';
import { useTowerStore } from '../../../store/towerStore';
import { useEnemyStore } from '../../../store/enemyStore';

export class MainScene extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameStore: any;
  private towerStore: any;
  private enemyStore: any;

  constructor() {
    super('MainScene');
  }

  preload() {
    // Load assets
    this.load.image('tile', 'assets/images/tile.png');
    this.load.image('firewall', 'assets/images/towers/firewall.png');
    this.load.image('antivirus', 'assets/images/towers/antivirus.png');
    this.load.image('packetscrubber', 'assets/images/towers/packetscrubber.png');
    this.load.image('aisentry', 'assets/images/towers/aisentry.png');
    
    this.load.image('virus', 'assets/images/enemies/virus.png');
    this.load.image('worm', 'assets/images/enemies/worm.png');
    this.load.image('trojan', 'assets/images/enemies/trojan.png');
    this.load.image('ransomware', 'assets/images/enemies/ransomware.png');
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Initialize stores
    this.gameStore = useGameStore.getState();
    this.towerStore = useTowerStore.getState();
    this.enemyStore = useEnemyStore.getState();

    // Create map
    this.createMap();
    
    // Create towers
    this.createTowers();
    
    // Create enemies
    this.createEnemies();
  }

  update(time: number, delta: number) {
    this.updateTowers(time);
    this.updateEnemies(time);
    this.checkCollisions();
  }

  private createMap() {
    // Create grid-based map
    const map = this.add.grid(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT / 2,
      GameConfig.WIDTH,
      GameConfig.HEIGHT,
      GameConfig.TILES.WIDTH,
      GameConfig.TILES.HEIGHT,
      0x1a1a1a
    );

    // Add path tiles
    const pathTiles = [
      // Example path
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 }
    ];

    pathTiles.forEach(tile => {
      const x = tile.x * GameConfig.TILES.WIDTH;
      const y = tile.y * GameConfig.TILES.HEIGHT;
      this.add.rectangle(x, y, GameConfig.TILES.WIDTH, GameConfig.TILES.HEIGHT, 0x4a4a4a);
    });
  }

  private createTowers() {
    // Add tower placement grid
    const grid = this.add.grid(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT / 2,
      GameConfig.WIDTH,
      GameConfig.HEIGHT,
      GameConfig.TILES.WIDTH,
      GameConfig.TILES.HEIGHT,
      0x000000,
      0.1
    );

    // Add tower placement interaction
    this.input.on('pointerdown', (pointer) => {
      const tileX = Math.floor(pointer.x / GameConfig.TILES.WIDTH);
      const tileY = Math.floor(pointer.y / GameConfig.TILES.HEIGHT);
      
      // Check if tower can be placed
      const canPlace = this.canPlaceTower(tileX, tileY);
      if (canPlace) {
        // Place tower logic
      }
    });
  }

  private createEnemies() {
    // Spawn enemies based on current wave
    const currentWave = this.gameStore.currentWave;
    const enemyTypes = Object.values(GameConfig.ENEMY_TYPES);
    
    enemyTypes.forEach((type: string) => {
      const definition = this.enemyStore.enemyDefinitions[type];
      const spawnInterval = 1000 / definition.speed;
      
      this.time.addEvent({
        delay: spawnInterval,
        callback: () => this.spawnEnemy(type),
        repeat: currentWave * 2 - 1
      });
    });
  }

  private updateTowers(time: number) {
    const towers = this.gameStore.towers;
    Object.values(towers).forEach(tower => {
      const definition = this.towerStore.towerDefinitions[tower.type];
      const level = tower.level;
      
      // Check if tower can attack
      const canAttack = this.towerStore.canAttack(tower.id, time);
      if (canAttack) {
        // Find target
        const enemies = this.gameStore.enemies;
        const targetId = this.towerStore.getAttackTarget(tower.id, Object.values(enemies));
        
        if (targetId) {
          // Attack logic
          const damage = definition.baseDamage + (definition.upgradeStats.damage * (level - 1));
          this.enemyStore.updateEnemyHealth(targetId, damage);
          this.towerStore.updateTowerCooldown(tower.id, time);
        }
      }
    });
  }

  private updateEnemies(time: number) {
    const enemies = this.gameStore.enemies;
    Object.values(enemies).forEach(enemy => {
      if (enemy.status === 'active') {
        // Move enemy
        const definition = this.enemyStore.enemyDefinitions[enemy.type];
        const speed = definition.speed;
        
        // Update position
        const newPosition = this.calculateEnemyPosition(enemy.position, speed);
        this.enemyStore.updateEnemyPosition(enemy.id, newPosition);
        
        // Check for special abilities
        if (this.enemyStore.shouldUseSpecialAbility(enemy.id, time)) {
          this.useEnemySpecialAbility(enemy);
        }
      }
    });
  }

  private checkCollisions() {
    const towers = this.gameStore.towers;
    const enemies = this.gameStore.enemies;
    
    Object.values(towers).forEach(tower => {
      Object.values(enemies).forEach(enemy => {
        if (enemy.status === 'active') {
          const distance = Math.sqrt(
            Math.pow(enemy.position.x - tower.position.x, 2) +
            Math.pow(enemy.position.y - tower.position.y, 2)
          );
          
          const range = this.towerStore.towerDefinitions[tower.type].range;
          if (distance <= range) {
            // Handle collision
          }
        }
      });
    });
  }

  private canPlaceTower(x: number, y: number): boolean {
    // Check if position is valid
    const tileX = x * GameConfig.TILES.WIDTH;
    const tileY = y * GameConfig.TILES.HEIGHT;
    
    // Check if position is on path
    const isOnPath = this.isPositionOnPath(tileX, tileY);
    if (isOnPath) return false;
    
    // Check if tower can be placed
    const cpuCycles = this.gameStore.cpuCycles;
    const cost = GameConfig.CPU_CYCLES.TOWER_COST['firewall'];
    return cpuCycles >= cost;
  }

  private isPositionOnPath(x: number, y: number): boolean {
    // Check if position is on path tiles
    const pathTiles = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 }
    ];
    
    return pathTiles.some(tile => 
      tile.x === x && tile.y === y
    );
  }

  private calculateEnemyPosition(currentPosition: { x: number; y: number }, speed: number): { x: number; y: number } {
    // Simple movement along path
    const path = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 }
    ];
    
    // Find current path index
    const currentIndex = path.findIndex(tile => 
      tile.x === currentPosition.x && tile.y === currentPosition.y
    );
    
    if (currentIndex === -1 || currentIndex === path.length - 1) {
      return currentPosition;
    }
    
    const nextTile = path[currentIndex + 1];
    const dx = nextTile.x - currentPosition.x;
    const dy = nextTile.y - currentPosition.y;
    
    return {
      x: currentPosition.x + (dx * speed),
      y: currentPosition.y + (dy * speed)
    };
  }

  private useEnemySpecialAbility(enemy: any) {
    const ability = this.enemyStore.getSpecialAbility(enemy.type);
    
    switch (ability) {
      case 'split':
        this.splitEnemy(enemy);
        break;
      case 'transform':
        this.transformEnemy(enemy);
        break;
      case 'disable':
        this.disableNearbyTowers(enemy);
        break;
    }
  }

  private splitEnemy(enemy: any) {
    // Split enemy into smaller units
  }

  private transformEnemy(enemy: any) {
    // Transform enemy into different type
  }

  private disableNearbyTowers(enemy: any) {
    // Disable nearby towers
  }

  private spawnEnemy(type: string): string {
    const definition = this.enemyStore.enemyDefinitions[type];
    const id = this.enemyStore.spawnEnemy(type, { x: 0, y: 0 });
    
    // Add enemy sprite
    const enemySprite = this.add.sprite(0, 0, type);
    enemySprite.setInteractive();
    
    // Add enemy to game store
    this.gameStore.setEnemy(id, {
      sprite: enemySprite,
      definition,
      lastAttack: 0
    });
    
    return id;
  }
}
