/**
 * WebView entry point - React mount and message handling
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Pet } from './components/Pet';
import { PetState } from '../src/shared/types';

// Acquire VS Code API
const vscode = acquireVsCodeApi();

// Default initial state
const defaultState: PetState = {
  mood: 80,
  hunger: 50,
  energy: 70,
  animationState: 'idle',
  lastInteraction: Date.now()
};

// Get persisted state or use default
let currentState = vscode.getState() || defaultState;

/**
 * Render the React app
 */
function renderApp(state: PetState): void {
  const root = document.getElementById('root');
  if (!root) { return; }

  const handleInteract = (action: 'feed' | 'play' | 'pet') => {
    vscode.postMessage({ command: 'interact', action });
  };

  ReactDOM.createRoot(root).render(
    React.createElement(Pet, { state, onInteract: handleInteract })
  );
}

// Initial render
renderApp(currentState);

// Listen for messages from extension
window.addEventListener('message', event => {
  const { command, state } = event.data;
  
  if (command === 'syncState' && state) {
    currentState = state;
    vscode.setState(state);
    renderApp(currentState);
  }
});

// Handle pet click to trigger interaction
document.addEventListener('click', () => {
  vscode.postMessage({ command: 'interact', action: 'pet' });
});
