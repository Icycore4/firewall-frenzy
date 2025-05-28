import { create } from 'zustand';
import { GameConfig } from '../game/config/GameConfig';

interface EnemyState {
  // Enemy definitions
  enemyDefinitions: {
    [key: string]: {
      name: string;
      description: string;
      health: number;
      speed: number;
      damage: number;
      specialAbility: string;
      specialAbilityChance: number;
      specialAbilityCooldown: number;
    };
  };
  
  // Active enemies
  activeEnemies: {
    [key: string]: {
      id: string;
      type: string;
      health: number;
      position: {
        x: number;
        y: number;
      };
      status: 'active' | 'dead';
      lastSpecial: number;
      pathIndex: number;
    };
  };
  
  // Actions
  getEnemyDefinition: (type: string) => any;
  updateEnemyPosition: (id: string, position: { x: number; y: number }) => void;
  updateEnemyHealth: (id: string, amount: number) => void;
  shouldUseSpecialAbility: (id: string, currentTime: number) => boolean;
  getSpecialAbility: (type: string) => string;
}

export const useEnemyStore = create<EnemyState>((set) => ({
  // Enemy definitions
  enemyDefinitions: {
    [GameConfig.ENEMY_TYPES.VIRUS]: {
      name: 'Virus',
      description: 'Fast-moving basic threat',
      health: 100,
      speed: 2,
      damage: 5,
      specialAbility: 'split',
      specialAbilityChance: 0.1,
      specialAbilityCooldown: 2000
    },
    [GameConfig.ENEMY_TYPES.WORM]: {
      name: 'Worm',
      description: 'Splits into smaller units when destroyed',
      health: 150,
      speed: 1.5,
      damage: 10,
      specialAbility: 'split',
      specialAbilityChance: 0.3,
      specialAbilityCooldown: 1000
    },
    [GameConfig.ENEMY_TYPES.TROJAN]: {
      name: 'Trojan',
      description: 'Looks like a safe file until scanned',
      health: 200,
      speed: 1,
      damage: 15,
      specialAbility: 'transform',
      specialAbilityChance: 0.2,
      specialAbilityCooldown: 3000
    },
    [GameConfig.ENEMY_TYPES.RANSOMWARE]: {
      name: 'Ransomware',
      description: 'Disables nearby defenses',
      health: 300,
      speed: 0.5,
      damage: 25,
      specialAbility: 'disable',
      specialAbilityChance: 0.15,
      specialAbilityCooldown: 4000
    }
  },

  activeEnemies: {},

  // Actions
  getEnemyDefinition: (type) => {
    return useEnemyStore.getState().enemyDefinitions[type];
  },

  updateEnemyPosition: (id, position) => set((state) => ({
    activeEnemies: {
      ...state.activeEnemies,
      [id]: {
        ...state.activeEnemies[id],
        position
      }
    }
  })),

  updateEnemyHealth: (id, amount) => set((state) => {
    const enemy = state.activeEnemies[id];
    if (!enemy) return;
    
    const newHealth = enemy.health - amount;
    const newStatus = newHealth <= 0 ? 'dead' : 'active';
    
    return {
      activeEnemies: {
        ...state.activeEnemies,
        [id]: {
          ...enemy,
          health: Math.max(0, newHealth),
          status: newStatus
        }
      }
    };
  }),

  shouldUseSpecialAbility: (id, currentTime) => {
    const state = useEnemyStore.getState();
    const enemy = state.activeEnemies[id];
    if (!enemy) return false;

    const definition = state.enemyDefinitions[enemy.type];
    const chance = Math.random() < definition.specialAbilityChance;
    const cooldownReady = currentTime - enemy.lastSpecial >= definition.specialAbilityCooldown;

    return chance && cooldownReady;
  },

  getSpecialAbility: (type) => {
    return useEnemyStore.getState().enemyDefinitions[type].specialAbility;
  }
}));
