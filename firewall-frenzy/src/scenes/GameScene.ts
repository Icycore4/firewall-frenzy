import React, { useRef, useEffect } from 'react';
import { Game } from '../game/Game';
import { GameConfig } from '../game/config/GameConfig';
import { useGameStore } from '../store/gameStore';
import { useTowerStore } from '../store/towerStore';
import { useEnemyStore } from '../store/enemyStore';

interface GameSceneProps {}

export const GameScene: React.FC<GameSceneProps> = () => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const isGameStarted = useGameStore((state) => state.isGameStarted);
  const currentWave = useGameStore((state) => state.currentWave);
  const cpuCycles = useGameStore((state) => state.cpuCycles);

  useEffect(() => {
    if (gameContainer.current) {
      const game = new Game(gameContainer.current);
      return () => game.destroy();
    }
  }, []);

  return (
    <div className="game-container">
      <div className="game-ui">
        <div className="wave-display">
          <span>Wave: {currentWave}</span>
        </div>
        <div className="resource-display">
          <span>CPU Cycles: {cpuCycles}</span>
        </div>
        <div className="tower-panel">
          <TowerButton type={GameConfig.TOWER_TYPES.FIREWALL} />
          <TowerButton type={GameConfig.TOWER_TYPES.ANTIVIRUS} />
          <TowerButton type={GameConfig.TOWER_TYPES.PACKET_SCRUBBER} />
          <TowerButton type={GameConfig.TOWER_TYPES.AI_SENTRY} />
        </div>
      </div>
    </div>
  );
};

interface TowerButtonProps {
  type: string;
}

const TowerButton: React.FC<TowerButtonProps> = ({ type }) => {
  const towerDefinitions = useTowerStore((state) => state.towerDefinitions);
  const towerDef = towerDefinitions[type];
  const cpuCycles = useGameStore((state) => state.cpuCycles);
  const placeTower = useGameStore((state) => state.placeTower);

  if (!towerDef) return null;

  const canPlace = cpuCycles >= GameConfig.CPU_CYCLES.TOWER_COST[type as keyof typeof GameConfig.CPU_CYCLES.TOWER_COST];

  return (
    <button
      className={`tower-button ${canPlace ? '' : 'disabled'}`}
      onClick={() => placeTower(type, { x: 0, y: 0 })}
      disabled={!canPlace}
      title={`${towerDef.name} - ${GameConfig.CPU_CYCLES.TOWER_COST[type]} CPU Cycles`}
    >
      {towerDef.name}
    </button>
  );
};

export default GameScene;
