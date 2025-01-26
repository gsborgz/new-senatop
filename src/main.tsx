import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/index.css';
import Interface from './components/Interface';
import { Game } from './game/Game';

const game = new Game();

createRoot(document.getElementById('ui')!).render(
  <StrictMode>
    <Interface />
  </StrictMode>,
);

game.start();
