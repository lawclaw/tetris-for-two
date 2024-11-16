import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Board from './components/Board';
import { EmptyCell } from './components/Types';
import { useTetris } from './hooks/useTetris';
import UpcomingPieces from './components/UpcomingBlocks';

const socket = io('http://localhost:4000');




function App() { 
  const {board, startGame, isPlaying, score, upcomingPieces} = useTetris();

  return (
    <div className='App'>
      <h1>Tetris</h1>
      <Board currentBoard={board} />
      <div className='controls'>
        <h2>Score {score}</h2>
        {
          isPlaying ? (
            <UpcomingPieces upcomingPieces={upcomingPieces} />
          ) : (
            <button onClick={startGame}>New Game</button>
          )
        }
      </div>
    </div>
  )
}

export default App;
