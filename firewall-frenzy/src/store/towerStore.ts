import { create } from 'zustand';
import { GameConfig } from '../game/config/GameConfig';

interface TowerState {
  // Tower definitions
  towerDefinitions: {
    [key: string]: {
      name: string;
      description: string;
      baseDamage: number;
      range: number;
      attackSpeed: number;
      upgradeCost: number;
      upgradeStats: {
        damage: number;
        range: number;
        attackSpeed: number;
      };
    };
  };
  
  // Active towers
  activeTowers: {
    [key: string]: {
      id: string;
      type: string;
      level: number;
      position: {
        x: number;
        y: number;
      };
      cooldown: number;
      lastAttack: number;
    };
  };
  
  // Actions
  getTowerDefinition: (type: string) => any;
  updateTowerCooldown: (id: string, currentTime: number) => void;
  canAttack: (id: string, currentTime: number) => boolean;
  getAttackTarget: (towerId: string, enemies: any[]) => string | null;
}

export const useTowerStore = create<TowerState>((set) => ({
  // Tower definitions
  towerDefinitions: {
    [GameConfig.TOWER_TYPES.FIREWALL]: {
      name: 'Firewall',
      description: 'Basic blocker that prevents malware progression',
      baseDamage: 10,
      range: 2,
      attackSpeed: 1000,
      upgradeCost: 50,
      upgradeStats: {
        damage: 5,
        range: 1,
        attackSpeed: -100
      }
    },
    [GameConfig.TOWER_TYPES.ANTIVIRUS]: {
      name: 'Antivirus Scanner',
      description: 'Targets and removes malware over time',
      baseDamage: 20,
      range: 1,
      attackSpeed: 2000,
      upgradeCost: 75,
      upgradeStats: {
        damage: 10,
        range: 0,
        attackSpeed: -200
      }
    },
    [GameConfig.TOWER_TYPES.PACKET_SCRUBBER]: {
      name: 'Packet Scrubber',
      description: 'Area damage based on throughput',
      baseDamage: 15,
      range: 3,
      attackSpeed: 500,
      upgradeCost: 100,
      upgradeStats: {
        damage: 7,
        range: 1,
        attackSpeed: -50
      }
    },
    [GameConfig.TOWER_TYPES.AI_SENTRY]: {
      name: 'AI Sentry',
      description: 'Smart targeting with adaptive learning',
      baseDamage: 25,
      range: 4,
      attackSpeed: 1500,
      upgradeCost: 150,
      upgradeStats: {
        damage: 12,
        range: 1,
        attackSpeed: -150
      }
    }
  },

  activeTowers: {},

  // Actions
  getTowerDefinition: (type) => {
    return useTowerStore.getState().towerDefinitions[type];
  },

  updateTowerCooldown: (id, currentTime) => set((state) => {
    const tower = state.activeTowers[id];
    if (!tower) return;
    
    const definition = state.towerDefinitions[tower.type];
    const attackSpeed = definition.attackSpeed - (definition.upgradeStats.attackSpeed * (tower.level - 1));
    
    return {
      activeTowers: {
        ...state.activeTowers,
        [id]: {
          ...tower,
          cooldown: currentTime + attackSpeed
        }
      }
    };
  }),

  canAttack: (id, currentTime) => {
    const state = useTowerStore.getState();
    const tower = state.activeTowers[id];
    return tower && currentTime >= tower.cooldown;
  },

  getAttackTarget: (towerId, enemies) => {
    const state = useTowerStore.getState();
    const tower = state.activeTowers[towerId];
    if (!tower) return null;

    const definition = state.towerDefinitions[tower.type];
    const range = definition.range + (definition.upgradeStats.range * (tower.level - 1));
    
    // Find closest enemy within range
    const validEnemies = enemies.filter(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - tower.position.x, 2) +
        Math.pow(enemy.position.y - tower.position.y, 2)
      );
      return distance <= range;
    });

    // AI Sentry prioritizes strongest enemies
    if (tower.type === GameConfig.TOWER_TYPES.AI_SENTRY) {
      return validEnemies.reduce((strongest, enemy) => 
        enemy.health > strongest.health ? enemy : strongest
      , validEnemies[0])?.id || null;
    }

    // Other towers target closest enemy
    return validEnemies.reduce((closest, enemy) => 
      Math.sqrt(
        Math.pow(enemy.position.x - tower.position.x, 2) +
        Math.pow(enemy.position.y - tower.position.y, 2)
      ) < Math.sqrt(
        Math.pow(closest.position.x - tower.position.x, 2) +
        Math.pow(closest.position.y - tower.position.y, 2)
      ) ? enemy : closest
    , validEnemies[0])?.id || null;
  }
}));
