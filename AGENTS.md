<!-- GSD:project-start source:PROJECT.md -->
## Project

**VS Code 电子宠物**

一款 VS Code 插件，让开发者在编辑器中养一只电子宠物。宠物可以陪伴开发者工作，随着代码编辑而互动，提供视觉反馈和情感陪伴，让编程过程更加有趣。

**Core Value:** 开发者的编程伴侣 — 一只活在 VS Code 状态栏/侧边栏的电子宠物，让写代码不再孤单。

### Constraints

- **平台**: VS Code 1.70+ (Electron-based)
- **语言**: TypeScript (官方推荐)
- **发布**: VS Code Marketplace
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **TypeScript** | 5.x | Extension language | Official VS Code language recommendation, full type safety |
| **@types/vscode** | ^1.88.0 | VS Code API types | Required for TypeScript IntelliSense with extension APIs |
| **esbuild** | ^0.24.0 | Bundler (extension host) | Official recommended bundler, 10-100x faster than webpack |
| **React** | 18.x | Webview UI framework | Most mature webview UI framework, excellent ecosystem |
| **@types/react** | 18.x | React type definitions | Required for TypeScript with React |
### Webview UI Layer
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **@vscode/webview-ui-toolkit** | ^1.4.0 | Official VS Code webview components | Microsoft's official UI component library for webviews |
| **CSS Modules** | (built-in) | Styling | VS Code's recommended approach, prevents style collisions |
| **React** | 18.x | UI framework | Industry standard for complex interactive UIs |
### State Management
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Zustand** | ^4.5.0 | State management | Lightweight (1KB), no boilerplate, React-agnostic, built-in persistence |
| **vscode.setState/getState** | (API) | Webview state persistence | Built into VS Code webview API, survives webview reload |
### Animation & Visual Effects
| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| **CSS Animations** | (native) | Simple transitions | Button hovers, opacity fades, basic movement |
| **Framer Motion** | ^11.x | Complex animations | Character animations, sprite-based movement, physics |
| **CSS Keyframes** | (native) | Character states | Idle, happy, hungry animations triggered by CSS classes |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **DOMPurify** | ^3.x | HTML sanitization | Sanitizing user input in webview for security |
| **lucide-react** | ^0.400.0 | Icons | Lightweight icon library, tree-shakeable |
| **date-fns** | ^3.x | Date formatting | Time-based pet states, cooldowns |
## Installation
# Core extension dependencies
# Dev dependencies for extension host
# For webview bundling (separate webpack config)
## Webview Build Setup
### Webview webpack.config.js (example)
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| React | Preact | If bundle size is critical (Preact is 3KB vs React 40KB) |
| Zustand | Jotai | If you prefer atomic state subscriptions |
| Zustand | Redux Toolkit | If team is more familiar with Redux patterns |
| esbuild | webpack | Only if you need complex module federation |
| CSS Modules | Tailwind CSS | If team prefers utility-first CSS |
| Framer Motion | GSAP | If you need more advanced timeline control |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Inline scripts in webview HTML** | CSP (Content Security Policy) blocks them | Bundle JS and load via script tag |
| **jQuery** | Heavy (90KB), not needed with modern frameworks | React or vanilla JS |
| **Angular** | Too heavy and opinionated for webview | React or Vue |
| **Vue 2** | EOL (End of Life) | Vue 3 if preferred |
| **Webpack 4** | No longer maintained | Webpack 5 |
| **setTimeout for animations** | Doesn't respect VS Code's reduced motion preferences | CSS animations or Framer Motion |
| **Large image assets** | Webview memory limits | SVG or CSS-based graphics |
| **localStorage in webview** | Persists across sessions unexpectedly | vscode.setState/getState or Zustand persist |
## Stack Patterns by Variant
- MUST bundle webview into single JS file (VS Code Web limitation)
- Use webpack with `libraryTarget: 'var'`
- Avoid dynamic imports that cannot be bundled
- Can use esbuild for webview bundling (faster builds)
- More flexibility with asset loading
- Use CSS sprites with `background-position` animations
- Load sprite sheets as base64 data URIs or via `asWebviewUri`
- Pure CSS animations with `transform` and `opacity` for GPU acceleration
- SVG for character parts that need to animate independently
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@vscode/webview-ui-toolkit@1.4.0` | VS Code 1.78+ | Requires VS Code 1.78 or later |
| `react@18.x` | @types/react@18.x | Must match major versions |
| `zustand@4.x` | react@16.8+ | Requires React hooks |
| `esbuild@0.24.x` | Node 18+ | For extension host bundling |
| `framer-motion@11.x` | react@17+ | Works with React 18 |
## Key VS Code Webview API Patterns
### 1. Message Passing (Extension <-> Webview)
### 2. State Persistence
### 3. Theme Integration
### 4. Content Security Policy
## Sources
- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview) — Official webview documentation, confirmed 2026-04-15
- [VS Code Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy) — Official extension structure guide
- [VS Code Bundling Extensions](https://code.visualstudio.com/api/working-with-extensions/bundling-extension) — Official esbuild/webpack guidance
- [VS Code UX Guidelines - Webviews](https://code.visualstudio.com/api/ux-guidelines/webviews) — Official UI best practices
- [VS Code Webview UI Toolkit](https://github.com/microsoft/vscode-webview-ui-toolkit) — Official Microsoft component library
- [esbuild](https://esbuild.github.io/) — Official esbuild documentation
- [Zustand GitHub](https://github.com/pmndrs/zustand) — State management, confirmed 2026-04-15
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
