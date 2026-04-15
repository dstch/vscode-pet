# VS Code 电子宠物

## What This Is

一款 VS Code 插件，让开发者在编辑器中养一只电子宠物。宠物可以陪伴开发者工作，随着代码编辑而互动，提供视觉反馈和情感陪伴，让编程过程更加有趣。

## Core Value

开发者的编程伴侣 — 一只活在 VS Code 状态栏/侧边栏的电子宠物，让写代码不再孤单。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 在 VS Code 中显示电子宠物界面
- [ ] 宠物状态系统（心情、饥饿度、精力）
- [ ] 与宠物交互的功能（喂食、玩耍、抚摸）
- [ ] 基于用户编码活动的状态变化
- [ ] 宠物外观和动画

### Out of Scope

- 多宠物支持 — 保持简单，单一宠物
- 云端同步宠物状态 — 本地存储即可
- 多人联机互动 — 单用户体验

## Context

- VS Code 扩展市场已有一些桌面宠物类插件，但大多功能简单、界面粗糙
- 目标用户：长时间在 VS Code 中工作的开发者
- 技术限制：VS Code Webview API、Extension API

## Constraints

- **平台**: VS Code 1.70+ (Electron-based)
- **语言**: TypeScript (官方推荐)
- **发布**: VS Code Marketplace

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Webview UI | 丰富的 UI 交互需求 | — Pending |
| 单宠物设计 | 简化复杂度，聚焦体验 | — Pending |

---

*Last updated: 2026-04-15 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state