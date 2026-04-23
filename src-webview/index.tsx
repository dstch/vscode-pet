import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Pet } from './components/Pet';
import { PetState } from '../src/shared/types';
import './styles.css';

const vscode = acquireVsCodeApi();

const defaultState: PetState = {
  mood: 80,
  hunger: 50,
  energy: 70,
  animationState: 'idle',
  lastInteraction: Date.now(),
  lastUpdated: Date.now()
};

let currentState = vscode.getState() || defaultState;

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

renderApp(currentState);

window.addEventListener('message', event => {
  const { command, state, theme } = event.data;

  if (command === 'syncState' && state) {
    currentState = state;
    vscode.setState(state);
    renderApp(currentState);
  }

  if (command === 'theme' && theme) {
    document.body.className = theme;
  }
});

vscode.postMessage({ command: 'getTheme' });

document.addEventListener('click', () => {
  vscode.postMessage({ command: 'interact', action: 'pet' });
});
