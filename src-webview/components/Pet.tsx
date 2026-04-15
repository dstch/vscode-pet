/**
 * Pet Component - Displays the pet with animation states and stats
 */

import * as React from 'react';
import { PetState } from '../../src/shared/types';

interface PetProps {
  state: PetState;
  onInteract: (action: 'feed' | 'play' | 'pet') => void;
}

export function Pet({ state, onInteract }: PetProps): JSX.Element {
  const { mood, hunger, energy, animationState } = state;

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onInteract('pet');
  };

  const handleFeed = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onInteract('feed');
  };

  const handlePlay = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onInteract('play');
  };

  const getPetClassName = (): string => {
    return `pet pet-${animationState}`;
  };

  const getMoodEmoji = (): string => {
    if (mood >= 80) { return '😊'; }
    if (mood >= 50) { return '😐'; }
    if (mood >= 30) { return '😟'; }
    return '😭';
  };

  return (
    <div className="pet-container">
      <div className="pet-display">
        <div 
          className={getPetClassName()} 
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label="Pet your pet"
        >
          <div className="pet-body">
            <div className="pet-face">
              <span className="pet-eyes">{getMoodEmoji()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-row">
          <span className="stat-label">Mood</span>
          <div className="stat-bar">
            <div 
              className="stat-fill stat-mood" 
              style={{ width: `${mood}%` }}
            />
          </div>
          <span className="stat-value">{mood}%</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">Hunger</span>
          <div className="stat-bar">
            <div 
              className="stat-fill stat-hunger" 
              style={{ width: `${hunger}%` }}
            />
          </div>
          <span className="stat-value">{hunger}%</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">Energy</span>
          <div className="stat-bar">
            <div 
              className="stat-fill stat-energy" 
              style={{ width: `${energy}%` }}
            />
          </div>
          <span className="stat-value">{energy}%</span>
        </div>
      </div>

      <div className="actions-container">
        <button className="action-btn" onClick={handleFeed}>
          🍖 Feed
        </button>
        <button className="action-btn" onClick={handlePlay}>
          🎮 Play
        </button>
        <button className="action-btn" onClick={handleClick}>
          🐾 Pet
        </button>
      </div>
    </div>
  );
}
