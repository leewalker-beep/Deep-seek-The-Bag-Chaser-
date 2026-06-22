# RECOMMENDATION REPORT: Hustle Reward System Audit

## Overview
A comprehensive audit of all 52 hustles was performed, comparing values between the **Hustle Card (UI)**, the **Reward Card (Engine Result)**, and **The Receipts (Action Log/Events)**. Several systemic discrepancies were identified, primarily stemming from UI display logic failing to account for engine-level multipliers and tier-specific mechanics.

---

## 1. Systemic Issues

### A. Tier-Specific Multipliers (Display Bug)
- **Root Cause**: `hustleEngine.ts` applies significant modifiers based on the player's current tier (e.g., 1.5x Mental Hit in MUD, 1.2x Clout in ELITE, Clout Streak Bonus in STREET). The `HustleCard.tsx` component reads raw values from the config and does not apply these multipliers.
- **Fix**: Create a `calculateDisplayStats` utility function that mirrors the non-random parts of `executeHustleAction` and use it in `HustleCard.tsx`.
- **Impact**: High. Players feel cheated when they see -8 Mental but get hit with -12.

### B. Market and Legacy Multipliers (Display Bug)
- **Root Cause**: Yields are scaled by Market Multipliers and Legacy Points in the engine. The UI does not reflect these, leading to "Est. Yield" being significantly lower than actual gains.
- **Fix**: Update `HustleCard.tsx` to include `marketYieldMult` and `legacyMultiplier` in its calculation for "Est. Yield".
- **Impact**: Medium. Makes the game feel less deterministic than it is.

### C. Heat Hit Inconsistency (Calculation & Display Bug)
- **Root Cause**: Base heat hit is often defaulted to 5 in `mathEngine.ts`, but config values vary. Market multipliers further diverge the values.
- **Fix**: Standardize Heat Hit handling. Ensure `HustleCard` displays the same "Base * Market" value that `mathEngine` uses.
- **Impact**: Low.

---

## 2. Specific Hustle Issues

### Vending Machine (r_vending)
- **Problem**: The Receipts log the purchase cost as a negative profit, but the "Yield Cash" (Passive) is handled in `advanceMonth`, not in the `HUSTLE_COMPLETED` event. This makes the Receipt look like a pure loss.
- **Recommendation**: Add `passiveAdded` to the `HUSTLE_COMPLETED` event metadata and update `TheReceipts.tsx` to display "EXPECTED PASSIVE" for business purchases.

### Media Empire (media_empire) & Luxury Conglomerate
- **Problem**: Audit found missing `HUSTLE_COMPLETED` events and 0 yields at high levels.
- **Root Cause**: The strategy in `hustleEngine.ts` for these Mogul hustles might be returning results that bypass standard logging or hit undefined checks in the store.
- **Fix**: Verify Mogul strategies in `hustleEngine.ts`. Ensure they always return a valid `HustleExecutionResult` and that the store's `executeHustle` action properly handles them.
- **Bug Type**: Calculation/Logic Bug.

### Global Franchise (global_franchise)
- **Problem**: Extreme variance between Card and Reward.
- **Root Cause**: CORPORATE tier applies a 0.5x to 1.5x random variance to ALL cash yields. This is intended but should be mentioned in the UI (e.g., "High Volatility").
- **Recommendation**: Add a "Volatility" indicator to CORPORATE tier hustle cards.

---

## 3. Recommended Technical Fixes

1.  **Centralize Math**: Extract the multiplier logic from `hustleEngine.ts` into `mathEngine.ts` so both the UI and Engine can call the same "preview" function.
2.  **UI Updates**:
    - Update `HustleCard.tsx` to use the centralized preview function.
    - Update `TheReceipts.tsx` to handle `cost` and `yield` more explicitly instead of deriving from `profit`.
3.  **Audit Mogul/President Strategies**: Specifically check `media_empire` and `data_monopoly` strategies as they failed to log events during the automated audit.

---

## Conclusion
The core engine math is robust, but the UI is "flying blind" regarding the many multipliers active in the mid-to-late game. Fixes should focus on bringing display parity to the `HustleCard`.
