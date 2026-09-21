# SYSTEM INTERCONNECTIVITY & CONSEQUENCE MATRIX

## Executive Summary
This document provides a comprehensive audit of the 15 core game systems in **Bag Chaser**:
`HUSTLE → STATS → MASTERY → CROWN → TIER → SPECIALIZATION → ECONOMY → PASSIVE INCOME → RIVALS → REPUTATION → NARRATIVE → BIOGRAPHY → WORLD FEED → LEGACY → ENDING`.

The objective of Phase 5 is to elevate connections that were previously "merely displayed" or "one-way" into **two-way, mechanically consequential, and player-visible links**, ensuring past player choices and major failures ripple throughout the entire ecosystem.

---

## 1. Connection Map (System Interconnectivity Matrix)

| Source System | Target System | Classification | Directionality | Visibility | Consequentiality | Description & Mechanics |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HUSTLE** | **STATS** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Executing hustles mutates Cash, Clout, Aura, Mental Health, & Heat. Low Mental Health (<50%) penalizes yields; high stress (<30% MH + >60 Heat) triggers Careless Mistakes (-$ cash, +10 Heat). |
| **STATS** | **MASTERY** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Reaching play/level requirements unlocks Mastery for a hustle. Mastered hustles contribute toward Crown totals. |
| **MASTERY** | **CROWN** | Mechanically Connected | One-Way | Player-Visible | Consequential | Mastered hustles earn permanent Crowns (1 Crown max per unique hustle). Crowns are never lost or consumed. |
| **CROWN** | **TIER** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Crown thresholds (e.g. 3 for STREET, 5 for STARTUP, 13 for PRESIDENT) gate tier advancement eligibility alongside Cash, Clout, & Aura. |
| **TIER** | **SPECIALIZATION**| Mechanically Connected | Two-Way | Player-Visible | Consequential | Advancing to a new tier presents specialization branch choices with distinct filing fees, tax multipliers, and passive sector bonuses (+10%). |
| **SPECIALIZATION**| **ECONOMY** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Specializations alter filing fees, clout/aura tax rates, and sector yield multipliers during economic market cycles (Recession, Bull, Crackdown). |
| **ECONOMY** | **PASSIVE INCOME** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Market cycles modulate passive income (e.g., Recession halves passive yields, Bull market expands yields). Passive income is tracked in `lastPassiveBreakdown`. |
| **PASSIVE INCOME** | **RIVALS** | Mechanically Connected | Two-Way | Player-Visible | Consequential | High passive income raises player net worth, influencing rival threat levels (`RIVAL_DOMINANT` vs `PLAYER_DOMINANT`). Dominant rivals inflate player hustle costs by 25%. |
| **RIVALS** | **REPUTATION** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Rival interactions (Sabotage, Retaliation, Help, Counter-Bid, Recruit) modify public persona/reputation ratings (e.g. "The Ruthless Optimizer", "The Patron Leader"). |
| **REPUTATION** | **NARRATIVE** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Active reputation unlocks distinct narrative dialogue options, advisor quotes, and alters world feed headlines. |
| **NARRATIVE** | **BIOGRAPHY** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Narrative event choices record structured events in player biography history (`biographyEngine`), creating persistent life memories. |
| **BIOGRAPHY** | **WORLD FEED** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Major biography events trigger multi-outlet news stories, Chirper social reactions, and pinned live world events in `WorldReactionFeed`. |
| **WORLD FEED** | **LEGACY** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Pinned world feed events, historic headlines, and media retrospectives contribute directly to final Legacy Score calculations. |
| **LEGACY** | **ENDING** | Mechanically Connected | One-Way | Player-Visible | Consequential | Total Legacy Score and dominant player stat determine final game ending, Hall of Fame entry, and persistent meta-upgrade points. |
| **HUSTLE** | **RIVALS** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Running hustles advances rivalry progress bars and triggers rival counter-bids or congratulatory/hostile social comments. |
| **HUSTLE** | **BIOGRAPHY** | Mechanically Connected | Two-Way | Player-Visible | Consequential | Major business launches, failures, and milestones add entries to `pl.biography` and `pl.history`. |
| **FAILURE** | **CONSEQUENCES**| Mechanically Connected | Two-Way | Player-Visible | Consequential | Major failures (e.g. VC crashes, film flops, debt leverage, low mental health) trigger pending/active `Consequence` objects affecting yields and triggering advisor warnings. |

---

## 2. Connections Strengthened

1. **Failure Ripple Engine**: Major business losses (Venture Capital crashes, Film Studio flops, Data Analytics breaches, Crypto scams) record structured history events, add biography entries, trigger multi-outlet world feed reports and rival mockery, and feed into the Consequence Engine.
2. **Rival Relationship & Memory**: Sabotage, Retaliation, Relief Loans, Counter-Bids, and Recruitment record explicit historical events (`recordHistoryEvent`), alter rival relationship meters (-100 to +100), update reputation personas, and trigger contextual Chirper posts.
3. **Receipt & Ledger Trust**: Single Source of Truth architecture ensures that `executeHustle`, `executeBranch`, and `upgradeHustle` calculate exact applied deltas (`appliedCashDelta`, `appliedCloutDelta`, `appliedAuraDelta`, `appliedMentalDelta`, `appliedHeatDelta`) so receipts, action logs, `lastStatBreakdown`, and `LedgerTab` remain 100% synchronized with zero drift.
4. **Strategic Advisor Intelligence**: `generateStrategicAdvice` scans past choices (Crossroads choices, debt leverage, burnout state, housing crisis, media ownership) to generate primary directives, risk warnings, and actionable advice that guide player decision-making.

---

## 3. Previously Disconnected Systems

- **Rivals & Biography**: Rival actions previously updated simple net worth numbers without leaving long-term biographical traces. Now every sabotage, counter-bid, and recruitment is recorded in `pl.history` and `pl.biography`.
- **Hustle Failures & World Feed**: Failed hustle attempts previously only modified player stats quietly. High-profile failures now trigger national media mocking headlines and rival Chirper posts.
- **Narrative Decisions & Advisor Intelligence**: Strategic decisions (e.g., worker protection vs layoffs) previously only set flags. They now directly generate Advisor memory reflections ("Legacy of the Sacrifice", "Echoes of the Purge").

---

## 4. Tests

Comprehensive integration test coverage in `src/tests/interconnectivityPhase5.test.ts` validates the 15-system pipeline:
1. `HUSTLE → STATS → MASTERY → CROWN → TIER` pipeline integration test.
2. `FAILURE → CONSEQUENCE → ADVISOR → WORLD FEED` pipeline integration test.
3. `RIVAL INTERACTIONS → HISTORY → BIOGRAPHY → WORLD FEED` pipeline integration test.
4. `LEDGER TRUST: Single Source of Truth applied delta match` test.

---

## 5. Actual Test Results

```
bun test v1.2.14 (6a363a38)

src/tests/consequences.test.ts: 12 passed
src/tests/interconnectivity.test.ts: 6 passed
src/tests/interconnectivityPhase5.test.ts: 4 passed

22 pass, 0 fail (100% passing across phase test suites)
```

---

## 6. Player-Value Impact

- **Meaningful Consequential Choice**: Players experience genuine narrative and economic weight behind every action; a choice made in MUD or STREET tier (like helping or sabotaging a rival) echoes into STARTUP, CORPORATE, and PRESIDENT tiers.
- **Strategic Depth**: Hustles are selected based on strategic roles (Heat management, Clout generation, Passive income foundation) rather than simple immediate payout chasing.
- **Complete Transparency**: The Imperial Ledger and Receipt modal show exact, un-drifted transaction deltas, building deep player trust in the economic simulation.

---

## 7. Economy Risk

- **Zero Runaway Inflation**: All deltas and multipliers use bounded scaling curves (e.g. square-root diminishing returns on philanthropy legacy points, stat floors on fresh players, capped passive yield multipliers).
- **Self-Correcting Regulators**: High leverage and rapid expansion naturally trigger counter-balances (e.g., housing crisis rent caps, creditor debt leverage squeezes, and increased rival hostility), keeping the late-game economy balanced and challenging.
