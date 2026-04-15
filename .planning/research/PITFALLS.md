# Pitfalls Research

**Domain:** VS Code WebView Extension Development - Electronic Pet/Digital Companion
**Researched:** 2026-04-15
**Confidence:** HIGH

## Critical Pitfalls
### Pitfall 1: WebView State Loss on Visibility Change

**What goes wrong:**
When a webview panel is moved to a background tab, VS Code destroys the webview content. All JavaScript state (variables, DOM state, animations) is lost. Setting webview.html reloads the entire content like an iframe refresh.

**Why it happens:**
VS Code optimizes resource usage by destroying webview content when hidden. Developers often assume webview state persists like a normal SPA.

**How to avoid:**
- Use `vscode.getState()` and `vscode.setState()` to persist JSON-serializable state before hidden
- Implement `onDidChangeViewState` to respond when webview becomes visible again
- For complex state, restore from extension-side storage via message passing

**Warning signs:**
- Pet animations restart from beginning when switching tabs
- Pet state (mood, hunger) resets to initial values
- Timers restart unexpectedly

**Phase to address:**
Phase 1 (Core WebView Setup) - Must establish state persistence pattern before adding interactive features

---

### Pitfall 2: Missing WebviewPanelSerializer for State Persistence

**What goes wrong:**
Closing and reopening VS Code loses all webview state. The pet mood, hunger, and other stats are reset to defaults on every VS Code restart.

**Why it happens:**
Developers implement `getState`/`setState` but forget to register a `WebviewPanelSerializer` via `registerWebviewPanelSerializer`. Without this, VS Code cannot restore webviews on restart.

**How to avoid:**
- Add `"onWebviewPanel:<viewType>"` to activationEvents in package.json
- Register serializer in `activate()`: `vscode.window.registerWebviewPanelSerializer("petView", new PetSerializer())`
- Serializer deserializeWebviewPanel must restore HTML AND send state via postMessage to webview

**Warning signs:**
- Pet resets completely on VS Code restart
- Webview panel does not reappear after closing and reopening VS Code
- No restore behavior when launching VS Code with extension active

**Phase to address:**
Phase 1 (Core WebView Setup) - Critical for user experience; electronic pet loses all progress otherwise
---

### Pitfall 3: Memory Leaks from Uncleaned Timers and Event Listeners

**What goes wrong:**
Using setInterval or setTimeout for animations/updates, then opening/closing panels repeatedly causes memory leaks. Old timers continue firing, webview references become invalid, exceptions pile up.

**Why it happens:**
When a webview panel is disposed, JavaScript timers and event listeners attached to the webview are not automatically cleaned up. The extension onDidDispose event must handle cleanup.

**How to avoid:**
- Store timer references and clear them in onDidDispose
- Remove event listeners registered with webview.onDidReceiveMessage
- Use context.subscriptions to auto-dispose registered handlers

**Warning signs:**
- Memory usage grows with each panel open/close
- Console errors after closing panel
- Pet updates continue in background after closing panel

**Phase to address:**
Phase 1 (Core WebView Setup) - Must establish cleanup discipline before any timer-based features

---

### Pitfall 4: Missing or Incorrect Content Security Policy

**What goes wrong:**
WebView fails to load scripts, styles, or images. Or worse, the CSP is too permissive allowing XSS attacks from workspace content.

**Why it happens:**
- CSP meta tag missing or blocking necessary resource types
- Using inline scripts without proper CSP unsafe-inline consideration
- Loading external resources without https restriction

**How to avoid:**
Always include a restrictive CSP in webview HTML head using webview.cspSource
- Use webview.cspSource for extension-local resources
- Only enable unsafe-inline if absolutely necessary
- Never use unsafe-eval

**Warning signs:**
- Console errors about refused script execution
- Images or styles not loading
- CSP warnings in DevTools

**Phase to address:**
Phase 1 (Core WebView Setup) - Security foundation
---

### Pitfall 5: Not Theming for All VS Code Themes

**What goes wrong:**
Pet displays correctly in default dark/light themes but becomes invisible or unreadable in high-contrast mode or custom themes.

**Why it happens:**
- Only testing with default themes
- Using hardcoded colors instead of VS Code theme variables
- Not using vscode-high-contrast CSS class

**How to avoid:**
- Use CSS variables for all colors: var(--vscode-editor-foreground)
- Test with high-contrast themes
- Apply theme classes: body.vscode-light, body.vscode-dark, body.vscode-high-contrast

**Warning signs:**
- Pet not visible in high-contrast mode
- Text/icons have poor contrast ratios

**Phase to address:**
Phase 1 (Core WebView Setup) - Use theme variables from start

---

### Pitfall 6: Incorrect localResourceRoots Configuration

**What goes wrong:**
Resources (images, CSS, fonts) fail to load from extension directory. Or extension accidentally loads resources from user workspace.

**Why it happens:**
- localResourceRoots defaults to restrictive set
- Developers use hardcoded file paths instead of asWebviewUri()

**How to avoid:**
- Set localResourceRoots to specific directories needed
- Use panel.webview.asWebviewUri(localFileUri) for all local resources
- Set localResourceRoots to empty array if no local resources needed

**Warning signs:**
- Unable to load resource errors in console
- Pet images/animation not displaying

**Phase to address:**
Phase 1 (Core WebView Setup)
---

### Pitfall 7: Message Passing Race Conditions

**What goes wrong:**
- Extension sends messages before webview is ready to receive
- Webview sends messages before acquireVsCodeApi() is called
- No handling for unknown message types

**Why it happens:**
- WebView initialization is asynchronous
- Message handling assumes synchronous setup

**How to avoid:**
- Wait for webview ready signal before sending messages
- Call acquireVsCodeApi() immediately on page load
- Implement message type validation

**Warning signs:**
- Cannot post message errors
- Messages arrive but are ignored

**Phase to address:**
Phase 2 (Interaction System)

---

### Pitfall 8: Using Disposed Webview

**What goes wrong:**
After a webview panel is closed/disposed, operations on it throw exceptions.

**Why it happens:**
- No reference tracking for webview lifecycle
- Event handlers still attached to disposed panel

**How to avoid:**
- Track currentPanel reference
- Clear reference on onDidDispose
- Check panel existence before operations

**Warning signs:**
- Cannot read properties of undefined errors
- Errors after closing the pet panel

**Phase to address:**
Phase 1 (Core WebView Setup)
---

### Pitfall 9: Overusing retainContextWhenHidden

**What goes wrong:**
Setting retainContextWhenHidden: true prevents webview destruction but keeps entire JavaScript state in memory. This is expensive and defeats VS Code optimization.

**Why it happens:**
Developers use it as an easy fix for state loss without understanding the performance cost.

**How to avoid:**
- Use getState()/setState() for state persistence instead
- Only use retainContextWhenHidden for truly complex state that cannot be serialized
- For pet with simple state, serialization is always correct

**Warning signs:**
- Memory usage stays high when panel is hidden
- Extension feels slow or resource-heavy

**Phase to address:**
Phase 1 (Core WebView Setup)

---

### Pitfall 10: Not Sanitizing User Input in HTML

**What goes wrong:**
If pet displays filenames, workspace paths, or user-controlled content, malicious workspace content could inject scripts.

**Why it happens:**
- Building HTML strings with template concatenation
- Assuming workspace content is trusted

**How to avoid:**
- Sanitize all user-controlled content before displaying
- Use DOM APIs for content insertion when possible
- Apply output encoding

**Warning signs:**
- Using template literals with user variables in HTML
- CSP warnings about blocked script execution

**Phase to address:**
Phase 1 (Core WebView Setup)
---

### Pitfall 11: Losing Extension-Host Communication on WebView Reload

**What goes wrong:**
When webview.html is set, the entire webview context reloads. acquireVsCodeApi() can only be called once per session.

**Why it happens:**
Setting webview.html is like iframe.src reload - full context destruction.

**How to avoid:**
- Never call acquireVsCodeApi() inside a function that may be called multiple times
- Structure state updates to not require full HTML refreshes
- Use message passing to update DOM elements rather than replacing HTML

**Warning signs:**
- acquireVsCodeApi can only be called once error
- Click handlers stop working after state update

**Phase to address:**
Phase 2 (Interaction System)

---

### Pitfall 12: Not Testing WebView Debugging Workflow

**What goes wrong:**
Unable to inspect webview content, debug JavaScript, or diagnose issues.

**Why it happens:**
- Not knowing about Developer: Toggle Developer Tools command
- WebViews before VS Code 1.56 need different debugging approach

**How to avoid:**
- Use Developer: Toggle Developer Tools to debug webviews
- Use Developer: Reload Webview during development
- Select active frame in DevTools console for webview scripts

**Warning signs:**
- Unable to see console.log from webview
- Cannot inspect webview DOM

**Phase to address:**
Phase 1 (Core WebView Setup)

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| retainContextWhenHidden: true | No state serialization needed | High memory usage | Never for pet state |
| Inline scripts without CSP | Works quickly | Security risk | Only during prototyping |
| Hardcoded paths instead of asWebviewUri | Simpler code | Breaks in production | Never |
| No serializer registration | One less thing | User loses progress | Never |
| Global state in webview | Easy variable access | State loss on reload | Only for ephemeral UI state |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Extension state | Storing webview state in extension | Use extension state for settings, webview for UI |
| Activity Bar/Sidebar | Creating multiple webview instances | Single webview reference, reveal() |
| File System | Loading resources with file:// paths | Always use asWebviewUri() |
| Theming | Using document.body.classList | CSS variables for theme-aware colors |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Too many setInterval timers | High CPU usage, battery drain | Consolidate into single animation loop | Always |
| Large state serialization | Slow save/restore | Keep pet state minimal | With complex pet inventory |
| Heavy images for animations | Slow loading, memory issues | Use CSS animations or sprite sheets | On extension install |
| Not debouncing rapid updates | UI flickering, lost updates | Debounce postMessage to extension | When coding activity events fire rapidly |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No CSP or permissive CSP | XSS from workspace files | Restrictive CSP with webview.cspSource |
| Loading workspace resources without validation | Malicious content | Validate URIs, use localResourceRoots |
| Unsanitized pet names/stats display | Stored XSS | Sanitize all displayed user content |
| Not using asWebviewUri for resources | Path traversal | Always convert local paths through VS Code API |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Opening new panel instead of revealing | Multiple pet windows | Track currentPanel, call reveal() |
| Not handling visibility changes | Pet freezes when hidden | Use visibility API, pause animations |
| No visual feedback for interactions | User unsure action worked | Immediate CSS transition/feedback |
| Starting animations on load | Jarring visual on tab switch | Only animate when visible |
| Ignoring focus state | Pet responds when typing | Check panel.visible before updating |

## "Looks Done But Isnt" Checklist

- [ ] WebView Persistence: Serializer registered, state survives restart
- [ ] Memory Cleanup: All timers cleared on dispose, no leaks after close
- [ ] Theme Support: Works in light, dark, AND high-contrast modes
- [ ] Security: CSP present and restrictive, user input sanitized
- [ ] Resource Loading: All images/assets load via asWebviewUri
- [ ] Message Protocol: Both directions work reliably, no race conditions
- [ ] Single Instance: Only one pet panel exists, reveal() used correctly
- [ ] Debug Ready: Can inspect webview, see console logs, reload webview

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| State loss on visibility | MEDIUM | Implement getState/setState, accept gap in pet mood |
| Memory leak from timers | LOW | Reload extension, close all panels |
| XSS from unsanitized input | HIGH | Audit displayed content, implement sanitization |
| Lost webview reference | MEDIUM | Reload extension, clear reference tracking bug |
| Serializer not registered | HIGH | Must update extension, users need reinstall |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| WebView State Loss | Phase 1: Core WebView Setup | Open/close tabs, state persists |
| Missing Serializer | Phase 1: Core WebView Setup | Restart VS Code, panel restores |
| Memory Leaks | Phase 1: Core WebView Setup | Open/close 10x, memory stable |
| CSP Issues | Phase 1: Core WebView Setup | Check resources load, no CSP errors |
| Theme Problems | Phase 1: Core WebView Setup | Test light/dark/high-contrast |
| Resource Loading | Phase 1: Core WebView Setup | Pet images animate correctly |
| Message Passing | Phase 2: Interaction System | Test all interactions work |
| WebView Reference | Phase 1: Core WebView Setup | Single panel, reveal works |
| retainContextWhenHidden | Phase 1: Core WebView Setup | Memory profile normal |
| XSS/Security | Phase 1: Core WebView Setup | Review CSP, sanitize content |

## Sources

- Official Webview API Documentation - https://code.visualstudio.com/api/extension-guides/webview
- Webview UX Guidelines - https://code.visualstudio.com/api/ux-guidelines/webviews
- VS Code Theme Color Reference - https://code.visualstudio.com/api/references/theme-color
- VS Code API Reference - https://code.visualstudio.com/api/references/vscode-api
- Content Security Policy Guidelines - https://developers.google.com/web/fundamentals/security/csp

---
*Pitfalls research for: VS Code WebView Extension - Electronic Pet*
*Researched: 2026-04-15*
