# Stack Research

**Domain:** VS Code Extension - Rich WebView UI (Electronic Pet/Digital Companion)
**Researched:** 2026-04-15
**Confidence:** HIGH

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

```bash
# Core extension dependencies
npm install @vscode/webview-ui-toolkit react react-dom zustand dompurify lucide-react date-fns

# Dev dependencies for extension host
npm install -D typescript @types/react @types/react-dom @types/vscode esbuild @types/dompurify

# For webview bundling (separate webpack config)
npm install -D webpack webpack-cli ts-loader css-loader style-loader
```

## Webview Build Setup

The extension uses TWO separate build pipelines:

1. **Extension Host Bundle** (esbuild) - For `src/extension.ts`
2. **Webview Bundle** (webpack or esbuild) - For `src-webview/`

### Webview webpack.config.js (example)

```javascript
const path = require('path');

module.exports = {
  target: 'webworker',
  entry: './src-webview/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist-webview'),
    filename: 'webview.js',
    libraryTarget: 'var',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  externals: {
    'vscode': 'commonjs vscode',
  },
};
```

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

**If targeting VS Code Desktop + Web (github.dev, vscode.dev):**
- MUST bundle webview into single JS file (VS Code Web limitation)
- Use webpack with `libraryTarget: 'var'`
- Avoid dynamic imports that cannot be bundled

**If targeting VS Code Desktop only:**
- Can use esbuild for webview bundling (faster builds)
- More flexibility with asset loading

**If pet animations are sprite-based:**
- Use CSS sprites with `background-position` animations
- Load sprite sheets as base64 data URIs or via `asWebviewUri`

**If pet animations are CSS/vector-based:**
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

```typescript
// Extension side
panel.webview.postMessage({ command: 'feed', petId: 'pet1' });
panel.webview.onDidReceiveMessage(msg => {
  if (msg.command === 'stateUpdate') { /* ... */ }
});

// Webview side
const vscode = acquireVsCodeApi();
vscode.postMessage({ command: 'stateUpdate', hunger: 20 });
```

### 2. State Persistence

```typescript
// Webview side - survives webview reload
const vscode = acquireVsCodeApi();
const state = vscode.getState() || { hunger: 50, happiness: 80 };
vscode.setState({ hunger: 30, happiness: 85 });
```

### 3. Theme Integration

```html
<body class="vscode-light">  <!-- or vscode-dark, vscode-high-contrast -->
  <div style="color: var(--vscode-editor-foreground)">
    Themed content
  </div>
</body>
```

### 4. Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'none'; 
               img-src ${webview.cspSource} https:; 
               script-src ${webview.cspSource}; 
               style-src ${webview.cspSource};">
```

## Sources

- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview) — Official webview documentation, confirmed 2026-04-15
- [VS Code Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy) — Official extension structure guide
- [VS Code Bundling Extensions](https://code.visualstudio.com/api/working-with-extensions/bundling-extension) — Official esbuild/webpack guidance
- [VS Code UX Guidelines - Webviews](https://code.visualstudio.com/api/ux-guidelines/webviews) — Official UI best practices
- [VS Code Webview UI Toolkit](https://github.com/microsoft/vscode-webview-ui-toolkit) — Official Microsoft component library
- [esbuild](https://esbuild.github.io/) — Official esbuild documentation
- [Zustand GitHub](https://github.com/pmndrs/zustand) — State management, confirmed 2026-04-15

---
*Stack research for: VS Code Extension Rich WebView UI*
*Researched: 2026-04-15*
