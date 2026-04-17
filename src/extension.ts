import * as vscode from 'vscode';
import * as path from 'path';
import { PetState, PetMessageCommand } from './shared/types';

// Global state for the pet
let petState: PetState = {
  mood: 80,
  hunger: 50,
  energy: 70,
  animationState: 'idle',
  lastInteraction: Date.now(),
  lastUpdated: Date.now()
};

// Current webview panel
let currentPanel: vscode.WebviewPanel | undefined;

// Extension context (set during activation)
let context: vscode.ExtensionContext;

// Decay timer interval reference
let decayInterval: ReturnType<typeof setInterval> | undefined;

// Decay rates in milliseconds
const HUNGER_DECAY_RATE = 5 * 60 * 1000; // 5 minutes
const ENERGY_DECAY_RATE = 10 * 60 * 1000; // 10 minutes
const DECAY_CHECK_INTERVAL = 60 * 1000; // Check every minute

// GlobalState key for persistence
const GLOBAL_STATE_KEY = 'petState';

/**
 * WebviewPanelSerializer for restoring pet panel after VS Code restart
 */
class PetSerializer implements vscode.WebviewPanelSerializer {
  constructor(private ctx: vscode.ExtensionContext) {}

  async deserializeWebviewPanel(panel: vscode.WebviewPanel): Promise<void> {
    // Restore panel content
    currentPanel = panel;
    updateWebviewContent(panel, this.ctx);

    // Restore state from GlobalState
    loadState();

    // Set up message handler
    panel.webview.onDidReceiveMessage((message: PetMessageCommand) => {
      handleWebviewMessage(message);
    });

    // Handle dispose
    panel.onDidDispose(() => {
      currentPanel = undefined;
    });

    // Sync current state to restored webview
    panel.webview.postMessage({ command: 'syncState', state: petState });
  }
}

/**
 * Activate the extension
 */
export function activate(ctx: vscode.ExtensionContext) {
  // Store context for use by other functions
  context = ctx;

  // Register the pet.open command
  const disposable = vscode.commands.registerCommand('pet.open', () => {
    createPetPanel(ctx);
  });

  ctx.subscriptions.push(disposable);

  // Load saved state from GlobalState
  loadState();

  // Start the decay timer
  startDecayTimer();
  ctx.subscriptions.push({ dispose: stopDecayTimer });

  // Register webview panel serializer for state restoration
  vscode.window.registerWebviewPanelSerializer('petView', new PetSerializer(ctx));
}

/**
 * Create the pet webview panel
 */
function createPetPanel(context: vscode.ExtensionContext): void {
  // If panel already exists, reveal it
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.One);
    return;
  }

  // Create the webview panel
  const panel = vscode.window.createWebviewPanel(
    'petView',
    'Pet',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, 'dist-webview'))
      ],
      retainContextWhenHidden: true
    }
  );

  currentPanel = panel;

  // Set the HTML content
  updateWebviewContent(panel, context);

  // Handle messages from the webview
  panel.webview.onDidReceiveMessage((message: PetMessageCommand) => {
    handleWebviewMessage(message);
  });

  // Clean up when panel is closed
  panel.onDidDispose(() => {
    currentPanel = undefined;
  });
}

/**
 * Update the webview content
 */
function updateWebviewContent(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): void {
  // Get webview URI for the dist-webview directory
  const webviewRoot = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'dist-webview'))
  );
  
  // Build CSP that allows resources from our webview directory
  const csp = [
    "default-src 'none'",
    `img-src ${webviewRoot} https:`,
    `script-src ${webviewRoot}`,
    `style-src ${webviewRoot}`
  ].join('; ');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <title>Pet</title>
</head>
<body>
  <div id="root"></div>
  <script src="${webviewRoot}/webview.js"></script>
</body>
</html>`;

  panel.webview.html = htmlContent;

  // Send theme info to webview
  const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark
    ? 'vscode-dark'
    : 'vscode-light';
  panel.webview.postMessage({ command: 'theme', theme });

  // Send initial state to webview
  panel.webview.postMessage({ command: 'syncState', state: petState });
}

/**
 * Handle messages from the webview
 */
function handleWebviewMessage(message: PetMessageCommand): void {
  switch (message.command) {
    case 'interact':
      handleInteraction(message.action);
      break;
    case 'syncState':
      petState = message.state;
      break;
    case 'getTheme':
      if (currentPanel) {
        const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark
          ? 'vscode-dark'
          : 'vscode-light';
        currentPanel.webview.postMessage({ command: 'theme', theme });
      }
      break;
  }

  // Update the webview with new state
  if (currentPanel) {
    currentPanel.webview.postMessage({ command: 'syncState', state: petState });
  }
}

/**
 * Save current pet state to GlobalState
 */
function saveState(): void {
  const serialized = JSON.stringify(petState);
  context.globalState.update('petState', serialized);
}

/**
 * Load pet state from GlobalState
 */
function loadState(): void {
  const saved = context.globalState.get<string>('petState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as PetState;
      petState = { ...petState, ...parsed };
      // Calculate decay that occurred while VS Code was closed
      const elapsed = Date.now() - petState.lastUpdated;
      const hungerDecays = Math.floor(elapsed / HUNGER_DECAY_RATE);
      const energyDecays = Math.floor(elapsed / ENERGY_DECAY_RATE);
      petState.hunger = Math.max(0, petState.hunger - hungerDecays);
      petState.energy = Math.max(0, petState.energy - energyDecays);
      petState.lastUpdated = Date.now();
    } catch (e) {
      // Invalid saved state, use defaults
    }
  }
}

/**
 * Start the decay timer
 */
function startDecayTimer(): void {
  if (decayInterval) {
    return; // Already running
  }

  decayInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - petState.lastUpdated;

    let changed = false;

    // Check hunger decay
    if (elapsed >= HUNGER_DECAY_RATE) {
      const hungerDecays = Math.floor(elapsed / HUNGER_DECAY_RATE);
      petState.hunger = Math.max(0, petState.hunger - hungerDecays);
      petState.lastUpdated = now;
      changed = true;
    }

    // Check energy decay
    const energyElapsed = now - petState.lastUpdated;
    if (energyElapsed >= ENERGY_DECAY_RATE) {
      const energyDecays = Math.floor(energyElapsed / ENERGY_DECAY_RATE);
      petState.energy = Math.max(0, petState.energy - energyDecays);
      petState.lastUpdated = now;
      changed = true;
    }

    // Mood decays when hunger < 30 or energy < 30
    if (petState.hunger < 30 || petState.energy < 30) {
      petState.mood = Math.max(0, petState.mood - 1);
      changed = true;
    }

    // Clamp all stats to 0-100
    petState.mood = Math.max(0, Math.min(100, petState.mood));
    petState.hunger = Math.max(0, Math.min(100, petState.hunger));
    petState.energy = Math.max(0, Math.min(100, petState.energy));

    if (changed) {
      saveState();
      if (currentPanel) {
        currentPanel.webview.postMessage({ command: 'syncState', state: petState });
      }
    }
  }, DECAY_CHECK_INTERVAL);
}

/**
 * Stop the decay timer
 */
function stopDecayTimer(): void {
  if (decayInterval) {
    clearInterval(decayInterval);
    decayInterval = undefined;
  }
}

/**
 * Get animation duration based on animation state
 */
function getAnimationDuration(animationState: string): number {
  switch (animationState) {
    case 'eating': return 1500;
    case 'bouncing': return 2000;
    case 'purring': return 1000;
    default: return 1000;
  }
}

/**
 * Get mood-based animation state based on current stats
 */
function getMoodAnimationState(state: PetState): 'idle' | 'neutral' | 'sad' {
  // If stats are low, pet looks sad
  if (state.hunger < 30 || state.energy < 30) {
    return 'sad';
  }
  // If stats are okay, neutral
  if (state.hunger < 50 || state.energy < 50) {
    return 'neutral';
  }
  // Otherwise idle
  return 'idle';
}

/**
 * Handle pet interaction
 */
function handleInteraction(action: 'feed' | 'play' | 'pet'): void {
  petState.lastInteraction = Date.now();
  petState.lastUpdated = Date.now();

  switch (action) {
    case 'feed':
      petState.hunger = Math.min(100, petState.hunger + 20);
      petState.mood = Math.min(100, petState.mood + 5);
      petState.animationState = 'eating';
      break;
    case 'play':
      petState.mood = Math.min(100, petState.mood + 15);
      petState.energy = Math.max(0, petState.energy - 15);
      petState.animationState = 'bouncing';
      break;
    case 'pet':
      petState.mood = Math.min(100, petState.mood + 10);
      petState.animationState = 'purring';
      break;
  }

  // Save state after interaction
  saveState();

  // Send to webview
  if (currentPanel) {
    currentPanel.webview.postMessage({ command: 'syncState', state: petState });
  }

  // Reset animation state after animation completes
  const duration = getAnimationDuration(petState.animationState);
  setTimeout(() => {
    const moodState = getMoodAnimationState(petState);
    petState.animationState = moodState;
    saveState();
    if (currentPanel) {
      currentPanel.webview.postMessage({ command: 'syncState', state: petState });
    }
  }, duration);
}

/**
 * Deactivate the extension
 */
export function deactivate(): void {
  stopDecayTimer();
  currentPanel = undefined;
}
