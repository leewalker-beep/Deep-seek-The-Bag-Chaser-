# Balancing Guide

This document explains the mathematical model and balancing philosophy of Bag Chaser.

## Mathematical Model

### 1. Base Calculation (`calculateHustleMath`)
The core calculation for a hustle execution is:
`BaseStat * LevelMultiplier * MarketMultiplier * MinigameMultiplier`

- **Level Multipliers**:
  - Level 1: 1.0x
  - Level 2: 2.0x
  - Level 3: 3.5x
  - Level 4: 5.0x

### 2. Multiplier Stacking (`getEffectiveHustleStats`)
Multipliers are applied in a specific order to prevent runaway values while rewarding progression:

1.  **Dynamic Modifiers**: Sentiment Multiplier * World Event Multiplier. This product is **capped between 0.3x and 2.5x**.
2.  **Mastery Badges**: Each mastered hustle provides a permanent buff (usually 1.05x) to a specific stat (Yield, Clout, Aura, Mental, Heat).
3.  **Tier Bonuses**: Reaching certain tiers provides a permanent 2% yield boost to all hustles in that tier.
4.  **Tier Mechanics**:
    - **MUD**: 1.5x Mental drain.
    - **MOGUL**: 0.9x Yield tax (represents overhead/corruption).
    - **PRESIDENT**: Aura-based Clout bonus.
5.  **Legacy Multiplier**: Permanent `1 + (LegacyPoints * 0.001)` boost to all yields.
6.  **Specializations**: Class-specific multipliers (e.g., +20% cash for "Hustler").
7.  **Flex Assets**: Rare items (like Tech Conglomerates) that provide compounding bonuses.

## Economy Safeguards

- **Stat Caps**: Clout and Aura are capped based on the current tier to prevent players from over-farming low-level content.
- **Rent Scaling**: Rent increases exponentially with tiers, acting as a "soft floor" that forces players to move up or go bankrupt.
- **Heat Scaling**: High-tier actions generate more heat, making it harder to "stay under the radar" at higher wealth levels.

## Balancing Philosophy

### Progression Speed
- **MUD -> STREET**: ~10 months. Designed to teach the basic loop.
- **STREET -> STARTUP**: ~30 months. Introduction to passive income and scaling.
- **CORPORATE -> ELITE**: ~40 months. Heavy focus on strategy and market cycles.

### Passive Income
Passive income is intended to cover rent and provide a small surplus. It should never be so high that it makes active hustling irrelevant until the `OPEN` tier.

### Challenge Rewards
Daily and Rival challenges provide a meaningful boost (e.g., $500K–$2M for ELITE, $10M–$50M for MOGUL) but should not be the primary source of income.

## Recommendations for Future Content

- **Yield Buffers**: When adding MOGUL-tier hustles, include a `1.12x` buffer on Level 1 yields to offset the 0.9x MOGUL tax, ensuring players don't immediately lose money.
- **Sector Variety**: Ensure new hustles are spread across different sectors (Retail, Tech, Manufacturing) to make the World Event system more engaging.
