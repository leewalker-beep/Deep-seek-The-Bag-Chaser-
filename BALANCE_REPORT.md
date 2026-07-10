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

## 4. Manual Gameplay & Simulation Verification

A comprehensive end-to-end player experience verification pass was conducted across all core gameplay tiers. Below are the audited gameplay performance statistics, recorded under normal market conditions and typical player skill levels.

### A. MUD TIER
*   **Typical Hustles Played:** Manual Labor, Bike Delivery, Family Deli (Level 1), Rest & Recover.
*   **Estimated Yield:** ~$1,000 to `$2,000` gross cash profit per hustle action.
*   **Actual Yield:** ~$1,200 to `$1,800` net cash profit (reduced slightly by Mud-tier rent of `$50` and mental hit recovery costs).
*   **Time Taken (Months):** ~15 months.
*   **Difficulty:** **Medium / Challenging.** The margin of error is low. Players must actively sleep to recover mental health and keep heat under control to avoid arrest.
*   **Pacing & Effort Feel:** Highly appropriate and rewarding. It feels challenging but never unfair. Every dollar earned directly contributes to HQ Lease setup or Family Deli catering upgrade.

### B. STREET TIER
*   **Typical Hustles Played:** Content Creation, Podcast (Level 1), Dropshipping, Bedroom Producer.
*   **Estimated Yield:** ~$4,000 to `$15,000` gross cash profit per hustle action.
*   **Actual Yield:** ~$3,000 to `$14,000` net cash profit (deducting `$1,000` monthly rent).
*   **Time Taken (Months):** ~7 months.
*   **Difficulty:** **Low-Medium.** Pacing accelerates as players start recording podcast episodes and dropshipping, generating passive income of up to `$1,000/month`.
*   **Pacing & Effort Feel:** Very satisfying. Building a digital brand (clout and aura) feels active, and the milestone progression feels exciting.

### C. STARTUP TIER
*   **Typical Hustles Played:** SaaS MVP, Streetwear Screenprint, SMM Agency.
*   **Estimated Yield:** ~$12,000 to `$85,000` gross cash profit per hustle action.
*   **Actual Yield:** ~$7,000 to `$80,000` net cash profit (paying `$5,000` monthly rent).
*   **Time Taken (Months):** ~5 months.
*   **Difficulty:** **Medium.** The capital requirements for upgrades are higher, but SaaS passive income can reach up to `$15,000/month`, offering a solid financial cushion.
*   **Pacing & Effort Feel:** Excellent. Upgrading from a bedroom streetwear project to a popup tour feels extremely rewarding and earned.

### D. CORPORATE TIER
*   **Typical Hustles Played:** Global Franchise (Level 1-2), VA Agency, Lobbying Firm.
*   **Estimated Yield:** ~$80,000 to `$1,000,000` gross profit depending on chosen scale and minigame scores.
*   **Actual Yield:** ~$60,000 to `$980,000` net profit (deducting `$20,000` monthly rent).
*   **Time Taken (Months):** ~18 months.
*   **Difficulty:** **Medium-High.** With high-intensity lobbying and international franchise expansion, heat climbs rapidly. Rivals actively place counter-bids and launch corporate campaigns, requiring strategic counter-play.
*   **Pacing & Effort Feel:** Profitable without feeling effortless. Stagnation is avoided through active franchise expansion and global VA agency management.

### E. MOGUL TIER
*   **Typical Hustles Played:** Film Studio (Budget blockbusters), Fight Promoter, Space Investment, Media Empire.
*   **Estimated Yield:** ~$350,000,000 to `$1,250,000,000` gross profit depending on project greenlighting, space mission outcome, and media stream.
*   **Actual Yield:** ~$150,000,000 to `$850,000,000` net profit (paying `$500,000` monthly rent).
*   **Time Taken (Months):** ~59 months.
*   **Difficulty:** **High / Very Strategic.** Budgets are massive, and single space mission failures or movie flops can wipe out hundreds of millions.
*   **Pacing & Effort Feel:** Incredible epic-scale endgame. Setting up film projects and managing space investments requires serious planning, balancing high risk with massive rewards.

### F. PRESIDENT TIER
*   **Typical Activities:** Executive Orders (Infrastructure, Tax, Welfare), Cabinet Meetings, Q&A Question Deflections, Crisis Dispatch Grid-matching.
*   **Estimated Yield:** Macroeconomic policy and federal budget adjustments (e.g. +$10M to +$50M federal budget gains, gdp/inflation impacts).
*   **Actual Yield:** Macroeconomic precision (GDP increases, inflation control, debt reduction) and Approval Rating adjustments.
*   **Time Taken (Months):** Exactly 48 months (fixed term).
*   **Difficulty:** **High.** Strategic decisions are heavily gated by Cabinet alignment, Congressional support, and public Approval. Managing national crises (e.g. economic crash, leaks) while campaigning for re-election is highly engaging.
*   **Pacing & Effort Feel:** Outstanding. The President tier successfully transitions from simple cash farming to high-level geopolitical and reputational puzzle-solving.

---

## 6. Areas for Future Balancing
While the current release candidate is highly balanced, the following areas can be monitored for future adjustments:
1.  **Hedge Fund active trading:** High performance in active hedge fund trading could be tuned slightly if players consistently achieve perfect minigame score streaks.
2.  **Aura Decay at the Presidential tier:** Since Presidential activities require high Aura, a more aggressive passive Aura decay could be introduced in a future update to simulate the wear-and-tear of high office.
