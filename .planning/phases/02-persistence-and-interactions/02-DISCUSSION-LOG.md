# Phase 2: Persistence and Interactions - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 02-persistence-and-interactions
**Areas discussed:** Stat Decay, Persistence, Animations

---

## Stat Decay

| Option | Description | Selected |
|--------|-------------|----------|
| Timer-based in extension host | Run decay in extension process — works when panel hidden | ✓ |
| Timer-based in webview | Run in webview — pauses when panel closed | |
| Decay on interaction only | Stats only decrease when user interacts | |

**User's choice:** Timer-based in extension host (Recommended)
**Notes:** Ensures pet feels alive even when not looking at it

---

## Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| On every state change | Save immediately — most reliable | ✓ |
| Periodic save | Save every N seconds | |
| On deactivate only | Save when VS Code closes | |

**User's choice:** On every state change (Recommended)
**Notes:** Simple and reliable

---

## Animations

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — unique animations | Feed: eating, Play: bouncing, Pet: purring | ✓ |
| No — use 'happy' only | Simpler, all positive interactions trigger happy | |

**User's choice:** Yes — unique animations (Recommended)
**Notes:** Each interaction should feel distinct and satisfying

---

## Deferred Ideas

None

---

*Discussion completed: 2026-04-17*