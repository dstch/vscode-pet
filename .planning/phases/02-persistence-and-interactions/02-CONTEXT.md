# Phase 2: Persistence and Interactions - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Add time-based mechanics (stat decay), session persistence across VS Code restarts, and user interactions (feed/play/pet) with distinct animations. This phase makes the pet feel alive over time.

</domain>

<decisions>
## Implementation Decisions

### Stat Decay
- **D-01:** Timer-based decay runs in extension host (not webview) — ensures decay continues even when webview panel is hidden/closed
- **D-02:** Decay rates: hunger decreases 1 point every 5 minutes, energy decreases 1 point every 10 minutes when idle
- **D-03:** Mood decreases slowly when other stats are low (hunger < 30 or energy < 30)

### Persistence
- **D-04:** Save state on every state change using VS Code `GlobalState` API
- **D-05:** Restore state from GlobalState on extension activation
- **D-06:** Use `setState`/`getState` pattern for webview-to-extension state sync

### Animations
- **D-07:** Each interaction has a unique animation beyond "happy":
  - Feed: eating/chewing animation (1.5s)
  - Play: bouncing/excited animation (2s)
  - Pet: purring/scaling animation (1s)
- **D-08:** After interaction animation completes, return to appropriate mood-based state (idle/neutral/sad based on stats)

### Theme Support
- **D-09:** Use VS Code theme variables (--vscode-editor-foreground, --vscode-editor-background) for colors
- **D-10:** Body classes `vscode-light` and `vscode-dark` for theme-specific styling

### Interaction Effects
- **D-11:** Feed: hunger +20, mood +5
- **D-12:** Play: mood +15, energy -15
- **D-13:** Pet: mood +10, no energy cost

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Extension Architecture
- `src/extension.ts` — Current extension entry, panel creation, message handling
- `src/shared/types.ts` — PetState, PetStats interfaces

### WebView UI
- `src-webview/components/Pet.tsx` — Current Pet component with stats display
- `src-webview/styles.css` — CSS animations (keyframes for idle, happy, neutral, sad)

### Research (Phase 1)
- `.planning/research/STACK.md` — VS Code WebView API patterns, state persistence
- `.planning/research/PITFALLS.md` — Common pitfalls (timer cleanup, state loss prevention)

**No external specs — requirements are fully captured in decisions above**

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `Pet.tsx`: Already has interaction buttons (Feed, Play, Pet) and stats display
- `styles.css`: Already has animation keyframes for pet states

### Established Patterns
- Message passing: `panel.webview.postMessage({ command: 'syncState', state })` pattern in use
- Extension owns canonical state (petState in extension.ts)

### Integration Points
- Webview ↔ Extension: via `onDidReceiveMessage` and `postMessage`
- Persistence: GlobalState API in extension context

</codebase_context>

<specifics>
## Specific Ideas

- "The pet should feel alive even when I'm not interacting with it"
- "When I come back after a break, the pet should be hungry/tired"
- "Each interaction should feel distinct and satisfying"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-persistence-and-interactions*
*Context gathered: 2026-04-17*