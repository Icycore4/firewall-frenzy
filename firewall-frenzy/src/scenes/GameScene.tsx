import React, { useRef, useEffect } from 'react';
import { Game } from '../game/Game';

export const GameScene: React.FC = () => {
  const gameContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameContainer.current) {
      const game = new Game(gameContainer.current);
      return () => game.destroy();
    }
  }, []);

  return <div ref={gameContainer} className="game-container" />;
}
