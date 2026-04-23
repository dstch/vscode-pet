"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
let petState = {
    mood: 80,
    hunger: 50,
    energy: 70,
    animationState: 'idle',
    lastInteraction: Date.now(),
    lastUpdated: Date.now()
};
let context;
let decayInterval;
let petView;
const HUNGER_DECAY_RATE = 5 * 60 * 1000;
const ENERGY_DECAY_RATE = 10 * 60 * 1000;
const DECAY_CHECK_INTERVAL = 60 * 1000;
const ACTIVITY_SESSION_WINDOW = 5 * 60 * 1000;
const MIN_MOOD_INCREASE = 1;
const MAX_MOOD_INCREASE = 2;
let lastSaveTimestamp = 0;
const GLOBAL_STATE_KEY = 'petState';
class PetViewProvider {
    constructor(ctx) {
        this.ctx = ctx;
    }
    resolveWebviewView(webviewView, _context, _token) {
        petView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(this.ctx.extensionPath)
            ]
        };
        this.updateWebviewContent(webviewView);
        webviewView.webview.onDidReceiveMessage((message) => {
            handleWebviewMessage(message);
        });
        webviewView.onDidDispose(() => {
            petView = undefined;
        });
        const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark
            ? 'vscode-dark'
            : 'vscode-light';
        webviewView.webview.postMessage({ command: 'theme', theme });
        webviewView.webview.postMessage({ command: 'syncState', state: petState });
    }
    updateWebviewContent(webviewView) {
        const scriptUri = webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(this.ctx.extensionPath, 'dist-webview', 'webview.js')));
        const nonce = getNonce();
        const csp = [
            "default-src 'none'",
            `img-src ${webviewView.webview.cspSource} https:`,
            `script-src 'nonce-${nonce}'`,
            `style-src ${webviewView.webview.cspSource} 'unsafe-inline'`
        ].join('; ');
        webviewView.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <title>Pet</title>
</head>
<body>
  <div id="root">Loading...</div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}
function activate(ctx) {
    context = ctx;
    const provider = new PetViewProvider(ctx);
    ctx.subscriptions.push(vscode.window.registerWebviewViewProvider('petView.main', provider));
    const disposable = vscode.commands.registerCommand('pet.open', () => {
        if (petView) {
            petView.show(true);
        }
    });
    ctx.subscriptions.push(disposable);
    loadState();
    startDecayTimer();
    ctx.subscriptions.push({ dispose: stopDecayTimer });
    vscode.workspace.onDidSaveTextDocument(() => {
        handleFileSave();
    });
    vscode.window.onDidChangeActiveColorTheme((e) => {
        if (petView) {
            const theme = e.kind === vscode.ColorThemeKind.Dark
                ? 'vscode-dark'
                : 'vscode-light';
            petView.webview.postMessage({ command: 'theme', theme });
        }
    });
}
function syncStateToWebview() {
    if (petView) {
        petView.webview.postMessage({ command: 'syncState', state: petState });
    }
}
function handleWebviewMessage(message) {
    switch (message.command) {
        case 'interact':
            handleInteraction(message.action);
            break;
        case 'syncState':
            petState = message.state;
            break;
        case 'getTheme':
            if (petView) {
                const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark
                    ? 'vscode-dark'
                    : 'vscode-light';
                petView.webview.postMessage({ command: 'theme', theme });
            }
            break;
    }
    syncStateToWebview();
}
function saveState() {
    const serialized = JSON.stringify(petState);
    context.globalState.update('petState', serialized);
}
function loadState() {
    const saved = context.globalState.get('petState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            petState = { ...petState, ...parsed };
            const elapsed = Date.now() - petState.lastUpdated;
            const hungerDecays = Math.floor(elapsed / HUNGER_DECAY_RATE);
            const energyDecays = Math.floor(elapsed / ENERGY_DECAY_RATE);
            petState.hunger = Math.max(0, petState.hunger - hungerDecays);
            petState.energy = Math.max(0, petState.energy - energyDecays);
            petState.lastUpdated = Date.now();
        }
        catch (e) {
            // Invalid saved state, use defaults
        }
    }
}
function startDecayTimer() {
    if (decayInterval) {
        return;
    }
    decayInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - petState.lastUpdated;
        let changed = false;
        if (elapsed >= HUNGER_DECAY_RATE) {
            const hungerDecays = Math.floor(elapsed / HUNGER_DECAY_RATE);
            petState.hunger = Math.max(0, petState.hunger - hungerDecays);
            petState.lastUpdated = now;
            changed = true;
        }
        const energyElapsed = now - petState.lastUpdated;
        if (energyElapsed >= ENERGY_DECAY_RATE) {
            const energyDecays = Math.floor(energyElapsed / ENERGY_DECAY_RATE);
            petState.energy = Math.max(0, petState.energy - energyDecays);
            petState.lastUpdated = now;
            changed = true;
        }
        if (petState.hunger < 30 || petState.energy < 30) {
            petState.mood = Math.max(0, petState.mood - 1);
            changed = true;
        }
        petState.mood = Math.max(0, Math.min(100, petState.mood));
        petState.hunger = Math.max(0, Math.min(100, petState.hunger));
        petState.energy = Math.max(0, Math.min(100, petState.energy));
        if (changed) {
            saveState();
            syncStateToWebview();
        }
    }, DECAY_CHECK_INTERVAL);
}
function stopDecayTimer() {
    if (decayInterval) {
        clearInterval(decayInterval);
        decayInterval = undefined;
    }
}
function handleFileSave() {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimestamp;
    if (timeSinceLastSave < ACTIVITY_SESSION_WINDOW || lastSaveTimestamp === 0) {
        const moodIncrease = Math.floor(Math.random() * (MAX_MOOD_INCREASE - MIN_MOOD_INCREASE + 1)) + MIN_MOOD_INCREASE;
        petState.mood = Math.min(100, petState.mood + moodIncrease);
    }
    lastSaveTimestamp = now;
    petState.lastInteraction = now;
    petState.lastUpdated = now;
    saveState();
    syncStateToWebview();
}
function getAnimationDuration(animationState) {
    switch (animationState) {
        case 'eating': return 1500;
        case 'bouncing': return 2000;
        case 'purring': return 1000;
        default: return 1000;
    }
}
function getMoodAnimationState(state) {
    if (state.hunger < 30 || state.energy < 30) {
        return 'sad';
    }
    if (state.hunger < 50 || state.energy < 50) {
        return 'neutral';
    }
    return 'idle';
}
function handleInteraction(action) {
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
    saveState();
    syncStateToWebview();
    const duration = getAnimationDuration(petState.animationState);
    setTimeout(() => {
        const moodState = getMoodAnimationState(petState);
        petState.animationState = moodState;
        saveState();
        syncStateToWebview();
    }, duration);
}
function deactivate() {
    stopDecayTimer();
    petView = undefined;
}
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=extension.js.map