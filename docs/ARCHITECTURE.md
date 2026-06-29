# Architecture

This document describes the technical architecture of Bag Chaser.

## Overview

Bag Chaser is a client-side React application built with TypeScript and Vite. It uses a centralized state management system (Zustand) and a modular engine-driven approach for game logic.

## State Management

The game state is managed using **Zustand** with several slices to organize logic:

- `playerStatsSlice`: Core player data (bag, clout, aura, health).
- `hustleSlice`: Logic for executing and upgrading hustles.
- `marketSlice`: Market conditions and shifts.
- `presidentSlice`: Complex state for the Presidency tier.
- `challengeSlice`: Daily and rival-based challenges.
- `achievementSlice`: Progress tracking and unlocks.
- `uiSlice`: Navigation and modal states.

### Persistence

The store is persisted to `localStorage` using Zustand's middleware, allowing players to resume their runs. Legacy progress (points and unlocks) is also persisted across runs.

## Engine Modules

Game logic is decoupled from React components into dedicated engine modules:

- **Math Engine (`mathEngine.ts`)**: Centralizes all calculations for costs, yields, and multipliers. It ensures consistent application of bonuses from badges, tiers, specializations, and events.
- **Advancement Engine (`advancementEngine.ts`)**: Handles the "Next Month" transition, including rent deduction, passive income accumulation, and random event triggers.
- **Hustle Engine (`hustleEngine.ts`)**: Manages the execution strategies for different hustle types (e.g., standard, choice-based, or mini-game driven).
- **Stat Engine (`statEngine.ts`)**: Enforces stat caps and handles basic stat modifications.
- **Achievement Engine (`achievementEngine.ts`)**: Tracks progress towards permanent unlocks and badges.
- **Legacy Engine (`legacyEngine.ts`)**: Calculates the legacy score and handles meta-progression.
- **President Engine (`presidentEngine.ts`)**: Manages the intricate mechanics of the Presidency tier (approval, GDP, debt).
- **Challenge Engine (`challengeEngine.ts`)**: Generates and validates daily/rival challenges.

## Data Flow

```text
User Interaction -> Store Action -> Engine Logic -> State Update -> Component Re-render
```

1. **User Interaction**: Player clicks a "Run Hustle" button.
2. **Store Action**: `executeHustle` action is triggered in `hustleSlice`.
3. **Engine Logic**: `executeHustleAction` in `hustleEngine` is called, which in turn uses `mathEngine` for calculations.
4. **State Update**: The store is updated with the results (new cash, clout, etc.).
5. **Component Re-render**: React components observe the state change and update the UI.

## Configuration-Driven Design

Most game content is defined in static configuration files (`src/config/`):

- **Hustles**: Defined in `hustles/base.ts`.
- **Tiers**: Requirements and descriptions in `tiers.ts`.
- **Narrative Events**: Triggers and choices in `narrativeEvents.ts`.
- **World Events**: Sector-specific modifiers in `worldEvents.ts`.
- **Specializations**: Buffs and requirements in `specializations.ts`.
- **Sectors**: Mapping of hustles to economic sectors in `sectors.ts`.

## Core Frameworks

### Living World
The `advancementEngine` and `mathEngine` work together to create a dynamic environment. Sentiment and World Events apply multipliers to specific sectors, which are defined in `sectors.ts`.

### Rival System
Rivals are managed in the `playerStatsSlice`. They have their own net worth growth and can trigger challenges or "smoke" events if the player becomes too dominant or falls behind.

### Imperial Ledger (The Receipts)
The `TheReceipts.tsx` component visualizes the financial history and ROI breakdown by querying the `actionLog` stored in the state.

### Difficulty Scaling
Difficulty (1: Trust Fund, 2: Middle Grind, 3: Grinder) affects starting stats and tier requirements via `getInitialStats` and `getUnlockedHustles`.

## Save/Load Flow

1. On mount, the Zustand store initializes from `localStorage`.
2. If no save exists, the player is directed to the `PROLOGUE`.
3. During gameplay, every action that modifies state triggers a background save via Zustand middleware.
4. Upon "Game Over", the run state is cleared, but legacy points and unlocked upgrades are preserved.
