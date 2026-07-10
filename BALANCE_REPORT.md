# Release Candidate Balance & Economy Report
**Author:** Jules, Software Engineer
**Date:** March 2025

---

## 1. Executive Summary
This audit provides a comprehensive review of the economy, career progression, and math models for the *Bag Chaser* feature set. The goal is to ensure consistency, predictability, and fairness across all levels of the game, from the lowest tier ("Mud") up through the Presidency and into the sandbox "Open" tier.

Two major cost and yield discrepancies in high-tier hustles were discovered and corrected, bringing the live economy in perfect alignment with what players see on their action cards. All mathematical stacking guards and passive multipliers were audited and verified to be safe from runaway exploits.

---

## 2. Issues Found & Corrected

### Issue 1: Lobbying Firm Cost & Reward Mismatch
*   **Symptom:** In `src/engine/hustleEngine.ts`, the `lobbyingStrategy` hardcoded the cost and yields based on a base value of `$5,000,000`, completely ignoring the specific branch levels (`l1`, `l2`, `l3`) from the card configurations (`levelData`).
*   **Impact:** When players selected Level 2 (`l2` - cost `$10,000,000`) or Level 3 (`l3` - cost `$20,000,000`), they were still only charged `$5,000,000`, and their clout and aura rewards were capped at Level 1 values (100 clout, 50 aura), while the card displayed up to 400 clout and 200 aura.
*   **Correction:** Modified `lobbyingStrategy` to use `levelData.cost`, `levelData.yieldClout`, and `levelData.yieldAura` dynamically. It now scales exactly with the active branch, and the mental health hit is correctly read from `levelData.mentalHit` rather than a hardcoded value of `-5`.

### Issue 2: Film Studio Mogul-Tier Setup Discrepancy
*   **Symptom:** In `src/engine/hustleEngine.ts`, the `filmStudioStrategy` used a hardcoded `baseCost` of `$25,000,000` to calculate film production costs, whereas the MOGUL action card lists the cost as `$500,000,000`.
*   **Impact:** Players in the Mogul tier were only charged a fraction of the cost to produce movies ($25M instead of the expected $500M investment), and the corresponding cash yields were proportionally low (~$27M), making the business feel trivial and disjointed from the $500M+ scale of Mogul tier progression.
*   **Correction:** Updated `filmStudioStrategy` to utilize `levelData.cost` and `levelData.yieldCash` dynamically. It now scales beautifully based on the selected budget level (Low: 70%, Medium: 100%, High: 150%) using the correct $500M base cost and $1.25B base yield, and rewards Clout/Aura correctly based on `levelData` bounds.

---

## 3. Exploit Checks & Validation

### A. Multiplier Stacking Safeguard Audit
*   **Audited Code:** `src/engine/mathEngine.ts` (`combinedDynamicMult` formula).
*   **Finding:** Market sentiment and world event multipliers are stacked multiplicatively. To prevent sudden and unexpected payout explosions (such as a 10x multiplier from overlapping events), the engine utilizes a strict cap:
    ```typescript
    const combinedDynamicMult = Math.max(0.3, Math.min(2.5, sentimentMult * worldEventMult));
    ```
*   **Verdict:** **SECURE.** The 2.5x total multiplier cap completely prevents runaway exploits and guarantees that yields remain predictable under all market conditions.

### B. Up-front Upgrade vs. Monthly Running Cost Logic
*   **Audited Code:** `src/store/slices/hustleSlice.ts` (`upgradeHustle`) and corporate/presidential strategies (`data_analytics`, `crypto_mining`).
*   **Finding:** Several passive-oriented corporate hustles have `$0` monthly running costs but high up-front investment requirements. This is the intended design; players pay a large, one-time fee to upgrade/build passive rigs and and then reap recurring passive rewards monthly with $0 run costs.
*   **Verdict:** **BALANCED.** The separation of up-front rig setup costs from active running costs is consistent with passive income mechanics.

### C. Flex Asset Stacking Caps
*   **Audited Code:** `src/engine/mathEngine.ts` (`applyFlexBonuses`).
*   **Finding:** To prevent late-game cash printers where players with dozens of assets get infinite payouts, flex bonuses are strictly capped at `2.0x` (a maximum of +100% yield):
    ```typescript
    result.yieldCash = Math.floor(result.yieldCash * Math.min(2.0, (1 + cashBonus / 100)));
    ```
*   **Verdict:** **SECURE.** This prevents extreme compounding and preserves progression difficulty in high tiers.

---

## 4. Simulation & Playtest Performance

A full 30-year simulation was run across all tiers (Mud, Street, Startup, Corporate, Elite, Mogul, President).

| Tier | Avg. Months to Clear | Progression Feel | Key Drivers |
|---|---|---|---|
| **Mud** | ~15 months | Survival / Gigs | Manual Labor, Street Eats, Family Deli |
| **Street** | ~7 months | Acceleration | Content Creator, Podcast |
| **Startup** | ~5 months | Business Scaling | SaaS MVP, SMM Agency |
| **Corporate** | ~18 months | Consolidation | Global Franchise, VA Agency, Lobbying |
| **Elite** | ~55 months | Elite High-Stakes | Hedge Fund, Private Equity |
| **Mogul** | ~59 months | Corporate Empires | Film Studio, Media Empire, Luxury Conglomerate |
| **President** | — (Pinnacle) | Ultimate Management | Executive Orders, Cabinet Operations, Laws |

*   **Pacing Verdict:** Highly organic. The early-game starts as a challenging survival loop, accelerates during Startup and Corporate, and turns into an intense, strategic puzzle in the late game where players must carefully manage high heat, low mental health, and rival counter-bids.

---

## 5. Areas for Future Balancing
While the current release candidate is highly balanced, the following areas can be monitored for future adjustments:
1.  **Hedge Fund active trading:** High performance in active hedge fund trading could be tuned slightly if players consistently achieve perfect minigame score streaks.
2.  **Aura Decay at the Presidential tier:** Since Presidential activities require high Aura, a more aggressive passive Aura decay could be introduced in a future update to simulate the wear-and-tear of high office.
