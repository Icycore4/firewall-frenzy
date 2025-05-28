import { create } from 'zustand';
import { GameConfig } from '../game/config/GameConfig';

interface GameState {
  // Game state
  isGameStarted: boolean;
  isGameOver: boolean;
  currentWave: number;
  totalWaves: number;
  
  // Resources
  cpuCycles: number;
  upgradePoints: number;
  
  // Towers
  towers: {
    [key: string]: {
      type: string;
      level: number;
      position: {
        x: number;
        y: number;
      };
    };
  };
  
  // Enemies
  enemies: {
    [key: string]: {
      type: string;
      health: number;
      position: {
        x: number;
        y: number;
      };
      status: 'active' | 'dead';
    };
  };
  
  // Actions
  startGame: () => void;
  endGame: () => void;
  nextWave: () => void;
  addCpuCycles: (amount: number) => void;
  spendCpuCycles: (amount: number) => boolean;
  placeTower: (type: string, position: { x: number; y: number }) => boolean;
  removeTower: (id: string) => void;
  spawnEnemy: (type: string, position: { x: number; y: number }) => string;
  damageEnemy: (id: string, amount: number) => void;
  upgradeTower: (id: string) => boolean;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  isGameStarted: false,
  isGameOver: false,
  currentWave: 0,
  totalWaves: 10,
  cpuCycles: GameConfig.CPU_CYCLES.BASE_INCOME * 10,
  upgradePoints: 0,
  towers: {},
  enemies: {},

  // Game actions
  startGame: () => set({ isGameStarted: true }),
  endGame: () => set({ isGameOver: true }),
  nextWave: () => set((state) => ({
    currentWave: state.currentWave + 1,
    isGameOver: state.currentWave >= state.totalWaves
  })),

  // Resource management
  addCpuCycles: (amount) => set((state) => ({
    cpuCycles: state.cpuCycles + amount
  })),
  spendCpuCycles: (amount) => set((state) => {
    if (state.cpuCycles >= amount) {
      return { cpuCycles: state.cpuCycles - amount };
    }
    return {};
  }),

  // Tower management
  placeTower: (type, position) => set((state) => {
    const cost = GameConfig.CPU_CYCLES.TOWER_COST[type as keyof typeof GameConfig.CPU_CYCLES.TOWER_COST];
    if (state.cpuCycles >= cost) {
      const id = `tower-${Date.now()}`;
      return {
        towers: {
          ...state.towers,
          [id]: {
            type,
            level: 1,
            position
          }
        },
        cpuCycles: state.cpuCycles - cost
      };
    }
    return {};
  }),

  removeTower: (id) => set((state) => ({
    towers: Object.fromEntries(
      Object.entries(state.towers).filter(([key]) => key !== id)
    )
  })),

  upgradeTower: (id) => set((state) => {
    const tower = state.towers[id];
    if (!tower) return false;
    
    const upgradeCost = GameConfig.CPU_CYCLES.TOWER_COST[tower.type as keyof typeof GameConfig.CPU_CYCLES.TOWER_COST] * tower.level;
    if (state.cpuCycles >= upgradeCost) {
      return {
        towers: {
          ...state.towers,
          [id]: {
            ...tower,
            level: tower.level + 1
          }
        },
        cpuCycles: state.cpuCycles - upgradeCost
      };
    }
    return {};
  }),

  // Enemy management
  spawnEnemy: (type, position) => {
    const id = `enemy-${Date.now()}`;
    set((state) => ({
      enemies: {
        ...state.enemies,
        [id]: {
          type,
          health: 100,
          position,
          status: 'active'
        }
      }
    }));
    return id;
  },

  damageEnemy: (id, amount) => set((state) => {
    const enemy = state.enemies[id];
    if (!enemy) return;
    
    const newHealth = enemy.health - amount;
    const newStatus = newHealth <= 0 ? 'dead' : 'active';
    
    return {
      enemies: {
        ...state.enemies,
        [id]: {
          ...enemy,
          health: Math.max(0, newHealth),
          status: newStatus
        }
      }
    };
  })
}));
