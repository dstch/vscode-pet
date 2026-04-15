# Architecture Research

**Domain:** VS Code Extension - WebView-based Rich UI
**Researched:** 2026-04-15
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Extension Controller                  │    │
│  │  - activate()/deactivate() lifecycle                  │    │
│  │  - Command registration                               │    │
│  │  - WebView panel management                           │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                     │
├─────────────────────────┼───────────────────────────────────┤
│                         │         Extension Process          │
│  ┌──────────────────────┴──────────────────────────────┐    │
│  │                    Pet Domain Layer                   │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │ Pet State   │  │ Pet Actions │  │ Activity    │   │    │
│  │  │ Store       │  │ Handler     │  │ Tracker     │   │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │    │
│  │         │                │                │         │    │
│  │  ┌──────┴─────────────────┴────────────────┴──────┐  │    │
│  │  │              Pet Engine                          │  │    │
│  │  │  - State transitions                             │  │    │
│  │  │  - Stat decay (hunger, energy, mood)            │  │    │
│  │  │  - Interaction response                         │  │    │
│  │  └─────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              Persistence Layer                       │     │
│  │  - GlobalState for pet state                         │     │
│  │  - ExtensionContext.storagePath                      │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                    postMessage / onDidReceiveMessage
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    WebView Process (Sandboxed)               │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │ Pet UI Layer  │  │ Animation     │  │ Interaction   │      │
│  │ - HTML/CSS   │  │ Controller    │  │ Handler       │      │
│  │ - Pet Sprite │  │ - CSS anim.   │  │ - Click/touch │      │
│  │ - Status HUD │  │ - Frame seq.  │  │ - Post msg    │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ WebView State Bridge                                   │   │
│  │ - acquireVsCodeApi()                                   │   │
│  │ - getState()/setState() for UI state                   │   │
│  │ - message event handler                               │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Extension Controller | Extension lifecycle, command registration, panel creation | extension.ts - activate/deactivate |
| Pet State Store | Single source of truth for pet stats (hunger, energy, mood, happiness) | TypeScript class/module in shared folder |
| Pet Engine | State transitions, stat decay logic, interaction outcomes | Pure functions + timer-based decay |
| Activity Tracker | Monitor coding activity via editor events | VS Code API event listeners |
| Persistence Layer | Save/load pet state across sessions | GlobalState + JSON serialization |
| WebView UI Layer | Render pet, animations, status HUD | HTML/CSS/JavaScript in webview |
| Message Bridge | Bidirectional communication between extension and webview | postMessage + onDidReceiveMessage |
| Animation Controller | Pet sprite animations, expressions | CSS animations + sprite sheet |

## Recommended Project Structure

```
src/
├── extension/              # Extension entry point and controller
│   ├── extension.ts        # activate(), deactivate(), panel management
│   └── commands.ts         # Command handlers (feed, play, pet)
├── pet/                    # Pet domain logic (runs in extension process)
│   ├── state/
│   │   ├── PetState.ts     # Pet state interface and class
│   │   └── PetStore.ts     # State management
│   ├── engine/
│   │   ├── PetEngine.ts    # Core pet logic (eat, play, rest, tick)
│   │   └── DecayService.ts # Periodic stat decay
│   ├── actions/
│   │   └── PetActions.ts   # Action creators
│   └── persistence/
│       └── PetPersistence.ts  # GlobalState read/write
├── activity/               # Coding activity tracking
│   ├── ActivityTracker.ts # Editor event listeners
│   └── ActivityTypes.ts    # Activity data structures
├── webview/                # WebView UI (runs in sandboxed webview)
│   ├── webview/
│   │   ├── index.html      # WebView entry point
│   │   ├── styles.css      # Pet UI styles
│   │   ├── app.ts          # WebView main script
│   │   ├── PetRenderer.ts  # Pet DOM manipulation
│   │   ├── AnimationController.ts
│   │   └── MessageHandler.ts
│   └── assets/
│       ├── sprites/        # Pet sprite images
│       └── sounds/         # Interaction sounds (optional)
├── shared/                 # Shared types between extension and webview
│   ├── types.ts            # Message types, state interfaces
│   └── constants.ts        # Shared constants
└── utils/
    └── logger.ts           # Logging utility
```

### Structure Rationale

- **`extension/`:** Entry point isolation, keeps Extension Host initialization clear
- **`pet/`:** Domain logic separate from UI for testability and reusability
- **`activity/`:** Coding activity tracking as independent module
- **`webview/`:** WebView-related files centralized, assets subdirectory manages static resources
- **`shared/`:** Contract between Extension and WebView (types, constants) in shared
- **`utils/`:** Helper utilities stored separately

## Architectural Patterns

### Pattern 1: Message Passing Bridge (WebView Communication)

**What:** Bidirectional async communication between extension process and webview using postMessage/onDidReceiveMessage
**When to use:** Any webview UI that needs to display dynamic state or trigger extension actions
**Trade-offs:** Simple and VS Code-native, but requires serialization and manual message type routing

**Example:**
```typescript
// Extension side - sending to webview
webviewPanel.webview.postMessage({ command: 'stateUpdate', payload: petState });

// Extension side - receiving from webview
webviewPanel.webview.onDidReceiveMessage(message => {
  switch (message.command) {
    case 'feed': handleFeed(); break;
    case 'play': handlePlay(); break;
  }
});

// WebView side - sending to extension
const vscode = acquireVsCodeApi();
vscode.postMessage({ command: 'feed' });

// WebView side - receiving from extension
window.addEventListener('message', event => {
  const { command, payload } = event.data;
  if (command === 'stateUpdate') updatePetUI(payload);
});
```

### Pattern 2: State Synchronization with Persistence

**What:** Extension owns the canonical pet state, syncs to webview via messages, persists to GlobalState
**When to use:** When state must survive webview destruction/restoration and VS Code restarts
**Trade-offs:** Clear ownership, reliable persistence, but requires careful sync on visibility changes

**Example:**
```typescript
// On webview show: extension sends current state
panel.onDidChangeViewState(e => {
  if (e.webviewPanel.visible) {
    panel.webview.postMessage({ command: 'syncState', state: petStore.getState() });
  }
});

// Webview state persistence (survives content destruction)
const vscode = acquireVsCodeApi();
vscode.setState({ mood: 'happy', frame: 3 });
const restored = vscode.getState();
```

### Pattern 3: Timer-based Domain Logic (Pet Engine)

**What:** Pet state changes via setInterval/setTimeout in extension process, not webview
**When to use:** Background processes like stat decay that must run even when webview is hidden
**Trade-offs:** Works correctly in background, but must manage panel lifecycle to avoid memory leaks

**Example:**
```typescript
// Extension process - pet engine ticking
let decayTimer: NodeJS.Timer | undefined;

export function activate() {
  decayTimer = setInterval(() => {
    petEngine.tick();
    if (petStore.hasChanged()) {
      broadcastStateToWebviews();
    }
  }, 60000);
}

panel.onDidDispose(() => {
  clearInterval(decayTimer);
});
```

### Pattern 4: Command-based Extension Actions

**What:** VS Code commands registered for user actions, invoked from webview via postMessage
**When to use:** Actions that can be triggered from UI or command palette
**Trade-offs:** Native VS Code integration, but requires round-trip

**Example:**
```typescript
// Register command in extension
context.subscriptions.push(
  vscode.commands.registerCommand('pet.feed', () => {
    petEngine.feed();
    broadcastState();
  })
);

// WebView triggers via message
vscode.postMessage({ command: 'feed' });
```

## Data Flow

### Request Flow (User Interaction)

```
[User clicks 喂食 button in WebView]
    │
    ▼
[WebView] --postMessage({command: 'feed'})--> [Extension]
    │                                              │
    │                                              ▼
    │                                    [PetEngine.processFeed()]
    │                                              │
    │                                              ▼
    │                                    [PetStore.update(state)]
    │                                              │
    │                                              ▼
    │                                    [Persistence.save()]
    │                                              │
    ◄────────────postMessage({state})──────────────┘
    │
[WebView updates DOM/CSS to reflect new state]
```

### Activity-driven State Change

```
[VS Code Editor Event] (onDidChangeTextEditor)
    │
    ▼
[ActivityTracker] --aggregate--> [Activity Stats]
    │
    ▼
[PetEngine.reactToActivity(stats)]
    │
    ▼
[PetStore.updateState()] --> [Broadcast to WebView]
```

### State Persistence Flow

```
[Extension Start / Pet First Load]
    │
    ▼
[PetPersistence.load()] --> [GlobalState.get('petState')]
    │                           │
    │                      ┌────┴────┐
    │                      │ No data │ Yes data
    │                      └────┬────┘
    │                           │
    ▼                      [Create New]  [Deserialize JSON]
[PetStore.initialize(state)]
    │
    ▼
[PetEngine.startDecayTimer()]
    │
    ▼
[WebView Panel Created] --> [Send initial state to WebView]
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|-------------------------|
| 0-1k users | Monolith extension is fine. Single pet instance, simple state. |
| 1k-100k users | Consider lazy loading of sprites, debouncing activity events |
| 100k+ users | Split activity tracking into background worker if needed |

### Scaling Priorities

1. **First bottleneck: WebView performance** - CSS animations may stutter on low-end machines
   - Fix: Use CSS transforms (GPU-accelerated), sprite sheets instead of many images
2. **Second bottleneck: State sync overhead** - Frequent postMessages could lag UI
   - Fix: Batch state updates, use requestAnimationFrame in webview

## Anti-Patterns

### Anti-Pattern 1: Storing State in WebView

**What people do:** Keeping pet state inside webview JavaScript variables
**Why it's wrong:** WebView content is destroyed when panel becomes hidden, state is lost
**Do this instead:** Keep state in Extension process, use getState/setState for UI-only state

### Anti-Pattern 2: Blocking Extension Lifecycle with WebView

**What people do:** Starting long-running processes before activating extension
**Why it's wrong:** Extension must activate quickly, blocking causes poor UX
**Do this instead:** Use lazy initialization, only start timers when pet panel is first shown

### Anti-Pattern 3: Direct VS Code API Access from WebView

**What people do:** Trying to call vscode.workspace APIs directly from webview script
**Why it's wrong:** WebView runs in sandboxed context, cannot access VS Code API directly
**Do this instead:** Use acquireVsCodeApi() for message passing bridge

### Anti-Pattern 4: Inline Scripts Without CSP

**What people do:** Embedding inline JavaScript and styles in webview HTML
**Why it's wrong:** Security risk, VS Code may block or warn
**Do this instead:** External scripts/styles + proper Content-Security-Policy meta tag

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| VS Code Editor | Activity tracking via onDidChangeTextEditor | Debounce events, aggregate keystrokes/lines |
| File System | Sprite/image loading via asWebviewUri | Use localResourceRoots restriction |
| GlobalState | Persistence via context.globalState | JSON serialize pet state |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Extension ↔ WebView | postMessage | Async, JSON serializable only |
| PetStore ↔ PetEngine | Direct function calls | Same process, synchronous |
| ActivityTracker ↔ PetEngine | Event emission + handler | Loose coupling via events |
| UI Layer ↔ Animation | DOM events | CSS class toggling, requestAnimationFrame |

## Build Order Implications

**Phase 1: Foundation (Extension Shell)**
- Extension entry point with panel creation
- WebView HTML/CSS skeleton with message bridge
- Basic command registration
- *Why first:* Establishes the contract between extension and webview

**Phase 2: State Management (Pet Core)**
- PetState interface and PetStore class
- PetEngine with basic actions (feed, play, rest)
- Persistence to GlobalState
- *Why second:* UI needs state to display, persistence needed for continuity

**Phase 3: Activity Integration**
- ActivityTracker with editor event listeners
- Activity to pet state reaction logic
- *Why third:* Depends on pet state existing first

**Phase 4: Rich UI (WebView Polish)**
- Sprite animations, expression changes
- Status HUD with stats visualization
- Interaction feedback (sounds, particles)
- *Why last:* Needs stable state sync to avoid UI glitches

## Sources

- [VS Code Webview API Documentation](https://code.visualstudio.com/api/extension-guides/webview)
- [VS Code Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy)
- [VS Code Extension Samples - Webview](https://github.com/microsoft/vscode-extension-samples/tree/main/webview-sample)
- [VS Code Extension Samples - Webview View](https://github.com/microsoft/vscode-extension-samples/tree/main/webview-view-sample)
- [Content Security Policy Guidelines](https://developers.google.com/web/fundamentals/security/csp/)

---
*Architecture research for: VS Code Electronic Pet Extension*
*Researched: 2026-04-15*