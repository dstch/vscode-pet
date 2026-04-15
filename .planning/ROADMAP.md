# VS Code 电子宠物 - Roadmap

**Created:** 2026-04-15
**Granularity:** Coarse (3 phases)

---

## Phase 1: Foundation - Pet Display and Core State

**Goal:** Establish the pet in VS Code with basic state tracking.

### Requirements Covered
- PET-01, PET-02, PET-03 (Pet Display)
- STATE-01, STATE-02, STATE-03 (Core Stats: mood, hunger, energy)
- UI-01 (4+ animation states)

### Success Criteria
1. User can open the pet panel via command palette or sidebar icon
2. Pet renders in the WebView with no console errors
3. Idle animation plays continuously when no activity
4. All three stats (mood, hunger, energy) display and are readable
5. Clicking/interacting with the pet triggers a visible reaction

**Plans:** 1 plan(s)

Plans:
- [x] 01-01-PLAN.md — Extension shell, webview setup, and pet component with 4 animation states

---

## Phase 2: Persistence and Interactions

**Goal:** Add time-based mechanics, session persistence, and user interactions.

### Requirements Covered
- STATE-04, STATE-05 (Stat decay + persistence)
- INT-01, INT-02, INT-03, INT-04 (Feed, Play, Pet, Reaction animations)
- UI-02, UI-03 (Theme support + status HUD)

### Success Criteria
1. Stats decrease over time when user is not interacting (observable over 30+ minutes)
2. Closing and reopening VS Code restores pet to previous state
3. Feed button increases hunger; Play button increases mood and decreases energy; Pet button gives small mood boost
4. Each interaction triggers a distinct visible animation
5. UI displays correctly in both light and dark VS Code themes
6. Status bars/HUD shows numeric values for all three stats

---

## Phase 3: Activity Integration

**Goal:** Connect pet behavior to user coding activity.

### Requirements Covered
- ACT-01, ACT-02, ACT-03 (Coding detection + mood response + state sync)

### Success Criteria
1. Extension detects when user is actively editing files (keystrokes, file saves)
2. Pet mood stat increases measurably during active coding sessions
3. State changes in extension host correctly reflect in webview UI within 1 second
4. User can observe pet becoming happier during a coding session vs idle period

---

## Phase Status

| Phase | Status | Plans | Completion Criteria |
|-------|--------|-------|---------------------|
| Phase 1 | Complete | 1/1 | 5/5 success criteria |
| Phase 2 | Pending | 0/2 | 6/6 success criteria |
| Phase 3 | Pending | 0/1 | 4/4 success criteria |

---

*Last updated: 2026-04-16 after 01-01 plan completion*
