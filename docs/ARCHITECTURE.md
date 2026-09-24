# Architecture

This document describes the technical architecture of Bag Chaser.

## Overview

Bag Chaser is a client-side React application built with TypeScript, Tailwind CSS, and Vite. It uses a centralized state management system (Zustand with persistence) and a modular engine-driven approach for game logic.

## State Management

The game state is managed using **Zustand** with modular slices:

- `playerStatsSlice`: Core player data (bag, clout, aura, health, heat).
- `hustleSlice`: Logic for executing, branching, and upgrading hustles.
- `marketSlice`: Market conditions and macroeconomic shifts.
- `presidentSlice`: Complex state for the Presidency tier.
- `challengeSlice`: Daily and rival-based challenges.
- `achievementSlice`: Progress tracking and unlocks.
- `uiSlice`: Navigation, advisor triggers, and modal states.

### Persistence

The store is persisted to `localStorage` using Zustand's middleware, allowing players to resume their runs seamlessly. Legacy progress (points and permanent unlocks) is preserved across runs.

## Engine Modules & Pure Helpers

Game logic is decoupled from React components into dedicated engine modules and pure helper functions:

- **Math Engine (`mathEngine.ts`)**: Centralizes all calculations for costs, yields, and multipliers.
- **Advancement Engine (`advancementEngine.ts`)**: Handles the "Next Month" transition, including rent deduction, passive income accumulation, and random narrative/world event triggers.
- **Hustle Engine (`hustleEngine.ts`)**: Manages execution strategies for different hustle types (e.g., standard, choice-based, or minigame-driven).
- **Advisor Trigger Utils (`advisorTriggerUtils.ts`)**: Contains tier onboarding data and situational trigger checks (`checkAdvisorTriggers`).
- **Mastery Utils (`masteryUtils.ts`)**: Manages Crown mastery thresholds and progress calculations.
- **Stat Breakdown Helper (`statBreakdownHelper.ts`)**: Computes monthly source-to-screen stat deltas for player transparency.

## Data Flow

```text
User Interaction -> Store Action -> Engine Logic -> State Update -> Component Re-render
```

1. **User Interaction**: Player clicks a "Run Hustle" button or plays a minigame.
2. **Store Action**: `executeHustle` action is triggered in `hustleSlice`.
3. **Engine Logic**: `executeHustleAction` in `hustleEngine` is called, utilizing `mathEngine` for calculations.
4. **State Update**: The store is updated with finalized results (cash, clout, aura, heat, mental health).
5. **Component Re-render**: React components observe the state change and re-render.

## Configuration-Driven Design

Most game content is defined in static configuration files (`src/config/`):

- **Hustles**: Defined in `src/config/hustles/base.ts`.
- **Tiers**: Requirements and descriptions in `src/config/tiers.ts`.
- **Narrative Events**: Partitioned tier files in `src/config/narrative/`.
- **World Feed Templates**: Externalized in `src/config/worldFeed/templates.json`.
- **Portraits**: Registered in `src/config/portraitRegistry.ts`.

## Testing & Quality Assurance

- **Unit & Integration Tests**: Executed via Bun test runner (`bun test`) or Vitest.
- **E2E Tests**: Verified via Playwright (`npx playwright test`).
- **Build Checks**: Verified via `npm run build` (`tsc -b && vite build`).
