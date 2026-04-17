# Phase 3: Activity Integration - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect pet behavior to user coding activity. When the user actively edits code, the pet's mood increases. This makes the pet feel like a genuine companion who shares in the coding experience.

</domain>

<decisions>
## Implementation Decisions

### Activity Detection
- **D-01:** Detect coding activity via VS Code `onDidSaveTextDocument` events
- **D-02:** Track saves per session to measure "active coding" vs idle

### Mood Response
- **D-03:** Gradual mood increase: +1-2 mood per file save during active session
- **D-04:** Mood increase capped at 100 (max)
- **D-05:** Active session defined as: saves within 5-minute window

### State Sync
- **D-06:** Real-time sync — state changes immediately reflect in webview via postMessage
- **D-07:** No batching — every state change triggers a sync message

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Extension Architecture
- `src/extension.ts` — Current extension entry, panel creation, message handling
- `src/shared/types.ts` — PetState, PetStats interfaces

### WebView UI
- `src-webview/components/Pet.tsx` — Current Pet component
- `src-webview/styles.css` — CSS animations

### Prior Phase Context
- `.planning/phases/02-persistence-and-interactions/02-CONTEXT.md` — Stat decay, persistence, interaction patterns

**No external specs — requirements are fully captured in decisions above**

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- Message passing via `postMessage` already established
- GlobalState persistence already in place
- Timer-based activity already implemented for decay

### Established Patterns
- Extension owns canonical state, webview is purely presentational
- State changes flow: user action → extension updates state → postMessage to webview

### Integration Points
- VS Code API: `onDidSaveTextDocument` for activity detection
- Existing message passing: `syncState` command already in use

</codebase_context>

<specifics>
## Specific Ideas

- "The pet should be happy when I'm coding, sad when I'm idle"
- "Make the mood increase feel natural, not gamey"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-activity-integration*
*Context gathered: 2026-04-17*