# Comprehensive QA and Balancing Audit Report

**Status:** Draft / Final Audit
**Auditor:** Jules (Senior QA Engineer)
**Build Health:** Good (Stable core, balancing tweaks needed for high-tier play)

---

## 1. Critical Bugs

### ISSUE-001: Jail Economy Leak (Economy/Balance)
* **Severity:** Critical
* **Description:** At ELITE tier and above, passive income from businesses, real estate, and flex assets continues to accrue at a rate that far exceeds the monthly jail penalties (bag loss and rent).
* **Steps to Reproduce:**
  1. Reach ELITE tier with typical passive income (e.g., $1M/month).
  2. Get arrested.
  3. Observe the "Bag" amount during months in jail.
* **Expected Behaviour:** Jail should be a significant financial drain or at least freeze business growth to some extent.
* **Actual Behaviour:** Player continues to get richer while incarcerated.
* **Suggested Fix:** Implement a "Management Penalty" while in jail that reduces passive income by 50-80% due to lack of oversight.

---

## 2. High Priority Bugs

### ISSUE-002: Death Trigger Ambiguity (Logic)
* **Severity:** High
* **Description:** Players report health hitting zero without death. Automated tests show this is intended in the tutorial, but in late-game scenarios, the `checkDeathConditions` might be called before or after certain stat-recovery logic.
* **Steps to Reproduce:**
  1. Complete tutorial.
  2. Perform a hustle that brings mental health exactly to 0.
* **Expected Behaviour:** Immediate transition to Death Screen.
* **Actual Behaviour:** In some race conditions or specific code paths (e.g., monthly advancement), the check might be skipped until the next action.
* **Suggested Fix:** Ensure `checkDeathConditions` is the absolute last call in every state-mutating action in `hustleSlice.ts`.

### ISSUE-003: Clout Scaling Inconsistency (Balance/Minigames)
* **Severity:** High
* **Description:** Several minigames (e.g., Content Creation) scale cash yield based on performance but leave clout yield flat. This devalues high performance for players focused on tier advancement.
* **Steps to Reproduce:**
  1. Execute 'cc' (Content Creation) with 0.5x performance.
  2. Execute 'cc' with 2.0x performance.
  3. Observe clout gains are identical ($3 in both cases).
* **Expected Behaviour:** All rewards (Cash, Clout, Aura) should scale with minigame performance.
* **Actual Behaviour:** Only cash scales in most strategies.
* **Suggested Fix:** Update `hustleEngine.ts` strategies to apply the `minigameMultiplier` to `yieldClout` and `yieldAura` consistently.

---

## 3. Medium Issues

### ISSUE-004: Tooltip Overflow on Mobile (UI/UX)
* **Severity:** Medium
* **Description:** Tooltips in `StatsPanel.tsx` use a fixed `w-32`. On a 375px wide screen, the rightmost tooltips (Mental Health/Heat) might still clip despite `right-0` positioning.
* **Steps to Reproduce:**
  1. View the game on a 375px mobile device.
  2. Hover over the "HEAT" or "MENTAL" stat.
* **Expected Behaviour:** Tooltip stays within the viewport.
* **Actual Behaviour:** Potential horizontal scroll or clipping.
* **Suggested Fix:** Use a max-width and more flexible positioning or a centralized tooltip system.

### ISSUE-005: Rival Poaching Overlap (Balance)
* **Severity:** Medium
* **Description:** Rival poaching in `advancementEngine.ts` targets a random passive source and reduces it by 20%. Multiple rivals can hit the same source, potentially nuking it to near-zero with no counterplay other than "Counter-Bid" (which is temporary).
* **Steps to Reproduce:**
  1. Reach a tier with 3+ rivals.
  2. Wait several months.
* **Expected Behaviour:** Rivals should target different sources or have a cooldown on targeting the same source.
* **Actual Behaviour:** Total randomness allows for extreme compounding penalties on a single business.
* **Suggested Fix:** Track "Last Sabotaged" on a per-source basis.

---

## 4. Low Issues / UX Improvements

### ISSUE-006: News Ticker Overload (UX)
* **Severity:** Low
* **Description:** During rapid play or world events, the news ticker can fill with 50+ messages. The de-duplication helps, but important information (like "RAID RISK") can be buried quickly.
* **Suggested Fix:** Implement a "Priority News" system where critical alerts (RED) stay on the left or scroll slower.

### ISSUE-007: Bio Consistency (Narrative)
* **Severity:** Low
* **Description:** Biography entries for business purchases occasionally use slightly different naming conventions than the hustles themselves.
* **Suggested Fix:** Centralize bio entry strings in `hustles/base.ts`.

---

## 5. Overall Build Health

The core engine is extremely robust. The math for tier progression is well-tuned for the early-to-mid game. The primary concern is the "Legend" phase (Elite/Mogul/President) where the player's economic power currently outpaces the game's ability to punish or challenge them (especially in jail).

### ISSUE-008: Test Suite Fragility (Infrastructure)
* **Severity:** Medium
* **Description:** Current test suite has several regressions and configuration issues. Vitest is attempting to run Playwright `.spec.ts` files, leading to startup errors. Additionally, core logic tests are failing due to missing state initialization (e.g., `isTutorialSkipped`).
* **Actual Behaviour:** `npm test` reports 4+ failures and 9 file-load errors.
* **Suggested Fix:** Update `vitest.config.ts` to exclude `tests/` (Playwright) folder. Ensure all tests use `getInitialStats` and explicitly set `isTutorialSkipped: true` for post-prologue logic.

**Next Steps Recommended:**
1. Fix the Jail Management Penalty.
2. Unify minigame scaling across all rewards.
3. Tighten the death check loop.
4. Clean up the test suite configuration to separate unit tests from E2E tests.
