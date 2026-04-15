# VS Code Electronic Pet Extension - Research Summary

**Project:** VS Code Extension - Rich WebView UI (Electronic Pet/Digital Companion)  
**Research Date:** 2026-04-15  
**Confidence:** HIGH (Stack, Architecture, Pitfalls) | MEDIUM (Features)

---

## Executive Overview

This research synthesizes technical stack recommendations, feature planning, system architecture, and known pitfalls for building a VS Code electronic pet extension. The core value proposition is **"让写代码不再孤单"** (make coding less lonely) - a digital companion that reacts to coding activity and provides ambient interaction within VS Code.

---

## Recommended Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.x | Extension language - official VS Code recommendation |
| @types/vscode | ^1.88.0 | VS Code API types for TypeScript IntelliSense |
| esbuild | ^0.24.0 | Extension host bundler - 10-100x faster than webpack |
| React | 18.x | WebView UI framework - most mature option |
| @vscode/webview-ui-toolkit | ^1.4.0 | Official Microsoft webview component library |

### State Management

| Technology | Purpose |
|------------|---------|
| Zustand ^4.5.0 | Lightweight (1KB), no boilerplate, built-in persistence |
| vscode.setState/getState | Webview state persistence via VS Code API |

### Animation

| Technology | Use Case |
|------------|----------|
| CSS Animations | Simple transitions, button hovers, opacity fades |
| Framer Motion ^11.x | Complex character animations, sprite-based movement |
| CSS Keyframes | Character states (idle, happy, hungry) triggered by CSS classes |

### Supporting Libraries

- **DOMPurify ^3.x** - HTML sanitization for user input security
- **lucide-react ^0.400.0** - Lightweight, tree-shakeable icons
- **date-fns ^3.x** - Time-based pet states and cooldowns

### Build Pipeline

The extension uses **TWO separate build pipelines**:
1. Extension Host Bundle (esbuild) - for `src/extension.ts`
2. Webview Bundle (webpack or esbuild) - for `src-webview/`

**Critical:** If targeting VS Code Desktop + Web (github.dev, vscode.dev), the webview MUST be bundled into a single JS file.

### What NOT to Use

| Avoid | Reason | Use Instead |
|-------|--------|-------------|
| Inline scripts in webview HTML | CSP blocks them | Bundle JS and load via script tag |
| jQuery | Heavy (90KB) | React or vanilla JS |
| setTimeout for animations | Ignores VS Code reduced motion | CSS animations or Framer Motion |
| localStorage in webview | Persists unexpectedly | vscode.setState/getState or Zustand persist |

---

## Feature Landscape

### Table Stakes (Required for Launch)

- Pet visible in VS Code UI (status bar icon minimum)
- Basic pet animations (idle, happy, sad, eating - 3-5 states minimum)
- 3-stat status system (mood, hunger, energy) - genre expectation
- Interaction actions (feed, play, pet)
- Coding activity detection (keystrokes, active editing time, build events)
- Status persistence across sessions
- Visual feedback for interactions

### Differentiators (Competitive Advantage)

- **Coding-context reactions** - Pet reacts to code: happy on successful build, concerned on errors, sleepy during long sessions
- **Evolving personality** - Long-term engagement based on usage patterns
- **Achievement/milestone system** - Progression feeling, rewards for consistent engagement
- **Humor and wit** - Pet has personality, not just stats
- **Mini-games** - Short 30-second entertainment breaks
- **Multiple pet types** - Unlockable cats, dogs, dragons, etc.

### Anti-Features (Avoid)

| Feature | Why Problematic | Alternative |
|---------|-----------------|-------------|
| Multi-pet support | UI complexity, splits attention | Single pet with richer personality |
| Cloud sync | Backend required, sync conflicts | Local-only with export/import |
| AI personality (LLM) | API costs, latency, privacy, unreliable | Pre-written responses with smart triggers |
| Real-time notifications | Annoying, interrupts flow | Subtle status bar changes |

### MVP Definition (v1 Launch)

**Must have:**
- [ ] Pet display in status bar with idle animation
- [ ] 3-stat status system (mood, hunger, energy)
- [ ] Basic interactions (feed, play, pet)
- [ ] Coding activity detection (keystrokes + active time)
- [ ] Local persistence
- [ ] 3-5 animations (idle, happy, sad, eating, sleeping)

**Add after validation (v1.x):**
- Achievement/milestone system
- Multiple pet types
- Mini-games
- Humorous chat/comments

### Feature Prioritization

| Priority | Features |
|----------|----------|
| P1 (Must have) | Pet display, 3-stat system, basic interactions, coding activity detection, persistence, basic animations |
| P2 (Should add) | Humor/personality comments, achievement system, multiple pet types, mini-games |
| P3 (Future) | Idle animation variety, evolving personality, pet customization |

### Feature Dependencies

```
[Pet Display Core] ──requires──> [Basic Animation System] ──requires──> [Interaction Handler]
        │
        └──requires──> [Status System] ──requires──> [Persistence Layer]

[Interaction Actions] ──requires──> [Status System + Animation System]
[Achievement System] ──enhances──> [Status System]
[Mini-games] ──enhances──> [Status System]
```

---

## Architecture

### System Overview

```
VS Code Extension Host
├── Extension Controller (activate/deactivate, commands, panel management)
├── Pet Domain Layer
│   ├── Pet State Store (single source of truth)
│   ├── Pet Engine (state transitions, stat decay, interactions)
│   └── Activity Tracker (coding activity via editor events)
└── Persistence Layer (GlobalState, storagePath)

          ↕ postMessage / onDidReceiveMessage

WebView Process (Sandboxed)
├── Pet UI Layer (HTML/CSS, sprite, status HUD)
├── Animation Controller
├── Interaction Handler
└── WebView State Bridge (acquireVsCodeApi, getState/setState)
```

### Recommended Project Structure

```
src/
├── extension/           # Entry point, controller
│   ├── extension.ts
│   └── commands.ts
├── pet/                  # Pet domain logic
│   ├── state/            # PetState.ts, PetStore.ts
│   ├── engine/          # PetEngine.ts, DecayService.ts
│   ├── actions/         # PetActions.ts
│   └── persistence/     # PetPersistence.ts
├── activity/             # Coding activity tracking
│   ├── ActivityTracker.ts
│   └── ActivityTypes.ts
├── webview/              # WebView UI (sandboxed)
│   ├── webview/          # index.html, styles.css, app.ts
│   └── assets/           # sprites/, sounds/
├── shared/               # Shared types and constants
│   ├── types.ts
│   └── constants.ts
└── utils/                # logger.ts
```

### Key Architectural Patterns

1. **Message Passing Bridge** - Bidirectional async communication via postMessage/onDidReceiveMessage
2. **State Synchronization with Persistence** - Extension owns canonical state, syncs to webview, persists to GlobalState
3. **Timer-based Domain Logic** - Pet engine ticking in extension process for background stat decay
4. **Command-based Extension Actions** - VS Code commands registered and invoked from webview

### Build Order

| Phase | Content | Why |
|-------|---------|-----|
| Phase 1 | Extension shell, WebView HTML/CSS skeleton, message bridge, basic commands | Establishes contract between extension and webview |
| Phase 2 | PetState, PetStore, PetEngine, persistence | UI needs state; persistence needed for continuity |
| Phase 3 | ActivityTracker, activity-to-pet reactions | Depends on pet state existing first |
| Phase 4 | Sprite animations, status HUD, interaction feedback | Needs stable state sync to avoid glitches |

### Data Flows

**User Interaction:**
```
User clicks button → WebView postMessage → Extension PetEngine → PetStore.update → Persistence.save → broadcastState → WebView updates
```

**Activity-driven State Change:**
```
VS Code Editor Event → ActivityTracker → aggregate → PetEngine.reactToActivity → PetStore.update → broadcast
```

---

## Critical Pitfalls

### Phase 1 (Core WebView Setup) - Must Address Early

| Pitfall | Problem | Solution |
|---------|---------|----------|
| WebView State Loss | Content destroyed when hidden; state lost | Use getState()/setState() for persistence |
| Missing Serializer | State lost on VS Code restart | Register WebviewPanelSerializer |
| Memory Leaks | Timers/listeners not cleaned up on dispose | Clear in onDidDispose, use context.subscriptions |
| Incorrect CSP | Scripts/styles blocked or XSS risk | Use restrictive CSP with webview.cspSource |
| Theme Problems | Invisible in high-contrast mode | Use CSS variables, test all themes |
| localResourceRoots | Resources fail to load | Use asWebviewUri() for all local resources |
| Using Disposed Webview | Operations throw after close | Track panel reference, clear on dispose |
| retainContextWhenHidden abuse | High memory usage | Use getState/setState instead |

### Phase 2 (Interaction System) - Address When Adding Interactivity

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Message Race Conditions | Messages sent before recipient ready | Wait for ready signal, validate message types |
| acquireVsCodeApi reuse | Can only call once per session | Never call inside functions that may run multiple times |

### Anti-Patterns to Avoid

| Anti-Pattern | Why Wrong | Correct Approach |
|--------------|-----------|------------------|
| State in WebView | Lost on visibility change | Keep state in Extension process |
| Blocking activation | Poor UX, extension must activate quickly | Lazy initialization |
| Direct VS Code API from WebView | Sandboxed, cannot access | Use acquireVsCodeApi() message passing |
| Inline scripts without CSP | Security risk | External scripts + proper CSP |

### "Looks Done But Isn't" Checklist

- [ ] WebView Persistence: Serializer registered, state survives restart
- [ ] Memory Cleanup: All timers cleared on dispose, no leaks
- [ ] Theme Support: Works in light, dark, AND high-contrast modes
- [ ] Security: CSP present and restrictive, user input sanitized
- [ ] Resource Loading: All images/assets load via asWebviewUri
- [ ] Message Protocol: Both directions work, no race conditions
- [ ] Single Instance: Only one pet panel, reveal() used correctly
- [ ] Debug Ready: Can inspect webview, see console logs, reload

---

## Performance Considerations

| Bottleneck | Prevention |
|------------|------------|
| WebView performance | CSS transforms (GPU-accelerated), sprite sheets instead of many images |
| State sync overhead | Batch state updates, use requestAnimationFrame in webview |

### Scaling Path

| Users | Architecture |
|-------|--------------|
| 0-1k | Monolith extension, single pet instance |
| 1k-100k | Lazy sprite loading, debounce activity events |
| 100k+ | Background worker for activity tracking |

---

## Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| CSP | Restrictive meta tag with webview.cspSource |
| User input | Sanitize all displayed content with DOMPurify |
| Resource loading | Always use asWebviewUri() for local paths |
| localResourceRoots | Set explicitly to prevent workspace access |

---

## Key VS Code API Patterns

### Message Passing
```typescript
// Extension → WebView
panel.webview.postMessage({ command: 'stateUpdate', payload: petState });

// WebView → Extension  
const vscode = acquireVsCodeApi();
vscode.postMessage({ command: 'feed' });
```

### State Persistence
```typescript
// WebView side - survives reload
const vscode = acquireVsCodeApi();
const state = vscode.getState() || { hunger: 50 };
vscode.setState({ hunger: 30 });
```

### Theme Integration
```html
<body class="vscode-light"> <!-- or vscode-dark, vscode-high-contrast -->
  <div style="color: var(--vscode-editor-foreground)">
```

---

## Research Sources

- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [VS Code Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy)
- [VS Code Bundling Extensions](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
- [VS Code UX Guidelines - Webviews](https://code.visualstudio.com/api/ux-guidelines/webviews)
- [VS Code Webview UI Toolkit](https://github.com/microsoft/vscode-webview-ui-toolkit)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- Official Webview samples (microsoft/vscode-extension-samples)

---

*Synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*  
*Research Date: 2026-04-15*
