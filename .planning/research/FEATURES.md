# Feature Research

**Domain:** VS Code Electronic Pet Extension
**Researched:** 2026-04-15
**Confidence:** MEDIUM

*Research conducted via competitive analysis of digital pet genre (Tamagotchi, Neko Works, My Android Cat) and existing VS Code productivity伴侣 extensions.*

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Pet visible in VS Code UI | Core value proposition - pet must be present in editor | LOW | Status bar icon, sidebar view, or两者兼具 |
| Basic pet animations | Digital pet genre convention -静态 image feels dead | MEDIUM | Idle, happy, sad, eating states minimum |
| Pet status system | Genre expectation - hunger/mood/energy stats | LOW | 3 stats with visual indicators |
| Interaction actions | Users expect to interact (feed, play, pet) | LOW | Button or command palette actions |
| Coding activity detection | Differentiates from generic desktop pet | MEDIUM | Keystrokes, active editing time, build events |
| Status persistence | Users don't want to restart care cycle | LOW | VS Code storage API, JSON file |
| Visual status feedback | Immediate acknowledgment of interactions | LOW | Brief animation or status bar change |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Coding-context reactions | Pet feels native to VS Code - reacts to your code, not just time | MEDIUM | Happy on successful build, concerned on errors, sleepy during long sessions |
| Evolving personality | Long-term engagement - pet remembers your patterns | HIGH | Subtle behavior changes based on usage history |
| Achievement/milestone system | Progression feeling - rewards for consistent engagement | MEDIUM | "First week with pet", "1000 lines coded" type badges |
| Humor and wit | Entertainment value - pet has personality, not just stats | MEDIUM | Chatty comments, funny reactions, memes for certain actions |
| Mini-games | Short entertainment breaks within VS Code | MEDIUM | 30-second games accessible via command palette |
| Multiple pet types | Personalization - choose cat, dog, dragon, etc. | MEDIUM | Unlockable via achievements or simple selection |
| Space-efficient UI | Developers hate wasted screen real estate | MEDIUM | Pet in status bar by default, expands on hover/click |
| Idle animations variety | Reduces repetitiveness, increases life-likeness | LOW | Breathing, tail swish, looking around |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Multi-pet support | "More pets = more fun" logic | Adds UI complexity, splits user attention, contradicts "simple" design principle | Single pet with richer personality instead |
| Cloud sync | "I use multiple machines" | Backend required, sync conflicts, complexity explosion | Local-only with export/import backup |
| Collaborative/multiplayer | "I want to show pet to teammates" | Backend, auth, social features = not a pet app anymore | Focus on single-user experience first |
| AI personality (LLM) | "Pet should have real conversations" | API costs, latency, privacy, unreliable responses | Pre-written responses with smart triggers |
| Real-time notifications | "I want alerts when pet needs something" | Annoying, interrupts flow, against "calm computing" | Subtle status bar changes instead |
| Desktop-wide pet | "I want pet on my whole desktop" | Scope creep, platform-specific code, outside VS Code API | Keep pet contained within VS Code |
| Extensive customization | "I want to customize everything" | UI bloat, decision paralysis | Preset themes with a few options |
| Complex needs (grooming, sickness) | Tamagotchi tradition | Too demanding for a companion app, not fun | Simple 3-stat system sufficient |

## Feature Dependencies

`
[Pet Display Core]
    └──requires──> [Basic Animation System]
                       └──requires──> [Interaction Handler]

[Status System]
    └──requires──> [Persistence Layer]

[Coding Activity Detection]
    └──requires──> [Status System]

[Interaction Actions]
    └──requires──> [Status System]
    └──requires──> [Animation System]

[Achievement System]
    └──requires──> [Persistence Layer]
    └──enhances──> [Status System] (provides goals)

[Mini-games]
    └──requires──> [Interaction Actions]
    └──enhances──> [Status System] (alternate income source)
`

### Dependency Notes

- **Pet Display Core requires Basic Animation System:** Cannot show pet without at least idle animation
- **Status System requires Persistence Layer:** Stats must be saved to be meaningful
- **Coding Activity Detection requires Status System:** Activity modifies stats
- **Interaction Actions requires both Status System and Animation System:** Interactions change stats and need visual feedback
- **Achievement System enhances Status System:** Provides goals beyond just keeping pet alive
- **Mini-games enhance Status System:** Alternate way to earn "food" or happiness

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Pet display in status bar with idle animation — core visibility, non-negotiable
- [ ] 3-stat status system (mood, hunger, energy) — genre expectation
- [ ] Basic interactions (feed, play, pet) — core engagement loop
- [ ] Coding activity detection (keystrokes + active time) — VS Code differentiation
- [ ] Local persistence — users don't want to restart care cycle
- [ ] 3-5 animations (idle, happy, sad, eating, sleeping) — makes pet feel alive

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Achievement/milestone system — triggers re-engagement
- [ ] Multiple pet types — personalization, replay value
- [ ] Mini-games — entertainment breaks, alternate stat income
- [ ] Humorous chat/comments — personality, entertainment value

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Evolving personality based on usage patterns — complex, needs user data
- [ ] Pet customization (colors, accessories) — UI complexity
- [ ] Export/import pet state — backup capability
- [ ] Multiple pet types with different stats — more complexity

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Pet display (status bar) | HIGH | LOW | P1 |
| 3-stat status system | HIGH | LOW | P1 |
| Basic interactions (feed/play/pet) | HIGH | LOW | P1 |
| Coding activity detection | HIGH | MEDIUM | P1 |
| Persistence | HIGH | LOW | P1 |
| Basic animations (3-5 states) | MEDIUM | MEDIUM | P1 |
| Humor/personality comments | MEDIUM | MEDIUM | P2 |
| Achievement system | MEDIUM | MEDIUM | P2 |
| Multiple pet types | MEDIUM | MEDIUM | P2 |
| Mini-games | MEDIUM | HIGH | P2 |
| Idle animation variety | LOW | LOW | P3 |
| Evolving personality | LOW | HIGH | P3 |
| Pet customization | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | VS Code Pet (existing) | Neko Works / My Android Cat | Our Approach |
|---------|------------------------|------------------------------|--------------|
| Pet display | Status bar icon only | Full desktop overlay | Status bar by default, sidebar expansion option |
| Status system | Simple mood only | Mood + hunger + energy | 3 stats matching genre expectation |
| Interactions | Limited (click to pet) | Tap to feed, play, brush | Feed, play, pet actions via commands |
| Coding integration | None | N/A | Keystroke detection, active time, build events |
| Animations | Basic GIF | Smooth 60fps animations | SVG/CSS animations for performance |
| Persistence | None | Local storage | VS Code storage API |
| Personality | Generic | Chatty, meme-filled | Pre-scripted humor, VS Code references |
| Mini-games | None | Some mini-games | Simple 30-second games post-MVP |
| Achievements | None | Achievement system | Unlock pets, badges post-MVP |

**Known VS Code Pet Extensions (Marketplace):**
- Generally crude interfaces (static images)
- Poor animation
- No coding activity integration
- No persistence
- No personality

**Our differentiation strategy:**
1. Coding-context reactions (happy on build success, concerned on errors)
2. Polished animations (SVG-based, not GIF)
3. Humor and personality in responses
4. Space-efficient UI (status bar presence)

## Sources

- Tamagotchi franchise analysis (1996-present)
- Neko Works / My Android Cat feature set
- VS Code Marketplace pet extensions survey
- "Calm computing" principles (Weiser, 1991)
- PROJECT.md core value: "让写代码不再孤单" (make coding less lonely)

---
*Feature research for: VS Code Electronic Pet Extension*
*Researched: 2026-04-15*
