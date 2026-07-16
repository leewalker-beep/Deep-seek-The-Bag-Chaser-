# Chapter Transition & Tier Advancement Design Report

This report outlines the proposed redesign of the **Tier Advancement & Chapter Transition** flow in *Bag Chaser*. The objective is to make each tier advancement feel like the beginning of a cinematic new chapter in the player’s life, rather than just another stat unlock. It focuses on pacing, clarity, emotional resonance, and avoiding popup fatigue.

---

## 1. Chapter Identities

Each progression tier is a milestone representing a fundamental shift in the player's worldly footprint. Below is the detailed identity mapping for each chapter of the protagonist's journey.

| Progression Tier | What is the player learning? | What new responsibility do they have? | What systems become important? | What should the Advisor teach? | What should the player feel? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **THE MUD (MUD)** | **Survival Basics:** The loop of active manual labor, risk/reward structures, and initial hustle plays. | **Self-preservation:** Keeping basic physical and mental health stable under extreme economic pressure. | Active executing hustles, simple rest recovery mechanics, and basic cash flow management. | "No one is coming to save you. Complete manual tasks, manage your stress, and accumulate your first real stake." | Grit, desperation, hunger, and anticipation of the climb. |
| **THE STREET (STREET)** | **Small-Scale Leverage:** How to transition manual effort into passive assets and build community presence. | **Earning Reputation:** Balancing local heat from street-level activities with public clout and rival relationships. | Vending machine route expansion, rent portfolios, Dynamic Reputation Engine, and local AI rivals. | "Now that you are off the block, your work must work for you. Invest in passive assets and defend your turf from local rivals." | Relief, emerging ambition, pride, and cautious optimism. |
| **THE STARTUP (STARTUP)** | **Corporate Scale:** How to transition from a sole proprietor to an operator who hires employees and builds a company. | **Capital Efficiency:** Managing payroll, scaling company valuations, and mitigating employee burnout risks. | Tech startup valuation tracks, employee automation, and early-stage venture capital. | "Incorporation shifts your risks. You are no longer trading hours for dollars; you are trading equity for leverage." | Competitiveness, sharp focus, stress of the grind, and empowerment. |
| **THE CORPORATE (CORPORATE)** | **Institutional Leverage:** How to manipulate massive organizations, media structures, and compliance rules. | **Managing Public Perception:** Protecting massive holdings from legal threats and keeping Clout high to offset high-tier taxes. | Media empires, film studios, regulatory compliance, and demographic public sentiment. | "The higher you climb, the more the rules change. Play the institutional boardrooms, control the narrative, and avoid public scandals." | Prestige, calculation, corporate sophistication, and ruthless efficiency. |
| **THE ELITE (ELITE)** | **Sovereign Leverage:** Controlling global markets, syndicate partnerships, and protecting massive wealth. | **Wealth Preservation:** Guarding large-scale holdings against hostile rival takeovers and managing extreme Heat/consequences. | Sovereign flex assets, hedge funds, rival counter-bids, and dynamic world consequences. | "You have entered a rare air. Your wealth is now a target. Lock down your assets and suppress antagonistic forces." | Elite status, paranoia, power, and absolute control. |
| **THE MOGUL (MOGUL)** | **Monopolistic Control:** How to coordinate multi-sector operations to prepare for final ideological legacy. | **Political Mobilization:** Funding PACs and planning presidential campaign logistics to transition from corporate to state power. | Global property empires, Political PAC funding, and the ACCEPT/REPLACE Ambitions system. | "Your business empire is complete. Now, you must secure your historical footprint by converting financial capital into state authority." | Dominance, legacy focus, deep reflection, and heavy responsibility. |
| **THE PRESIDENT (PRESIDENT)** | **Statecraft & Policy:** How to balance macroeconomic indicators (GDP, Inflation) with national policy. | **The Cabinet & the Nation:** Maintaining cabinet integrity, stabilizing the federal budget, and managing congressional approval. | Presidential cabinet loyalty, macro-economic triggers, Executive Orders, and past-deeds scandal events. | "Every decision you make now impacts millions. Keep your cabinet clean, stabilize the markets, and secure congressional support." | Absolute authority, crushing weight of state responsibility, and historical finality. |
| **THE OPEN ERA (OPEN)** | **Infinite Legacy:** Unlimited sandbox exploration and optimization of the ultimate empire. | **Mortal Transcendence:** Fulfilling extreme hidden milestones and achieving the highest historical rating. | Hall of Fame score optimization, 100% hustle mastery badges, and unconstrained high-risk trading. | "There are no rules, no ceilings, and no clocks. Complete your remaining life goals and cement your immortal memory." | Liberation, peaceful contemplation, supreme accomplishment, and absolute freedom. |

---

## 2. Current Transition Flow Analysis

### Current Sequence of Events:
1. **Advancement Check:** The player meets Tier Requirements (cash, clout, aura) and triggers `advanceTier()` or selects a branch upgrade.
2. **Specialization Selection:** If advancing, the player immediately opens the `SpecializationModal` to pick their career specialization (e.g. Street Kid, Dropout, etc.).
3. **Cinematic Transition:** The `CinematicTransition` screen renders and takes over the screen with a 3.0-second delay Ken Burns zoom, displaying the theme, artwork, and a narrative quote.
4. **Advisor Mentor Modal Popup:** An advisor mentor briefing (e.g., `TIER_ONBOARDING_DATA[currentTier]`) triggers automatically in the background of the screen.
5. **Multiple Overlapping Notifications:** Monthly news alerts, live world stories, milestones, and the advisor prompt pop up sequentially or simultaneously, sometimes overlapping or fighting for focus.
6. **Return to Gameplay:** The player dismisses the modal stack and is dropped back into standard hustle management.

### Issues Identified in the Current Flow:
* **Modal Congestion / Spam:** If a player triggers advancement, they are immediately hit with the Specialization selector, then a 3-second transition, then the Advisor Mentor popup, alongside potential Milestones, World Feed updates, and Economic shift alerts.
* **Cinematic Interruptions:** Although the Advisor modal checks `!pendingSpecialization`, it can still fire immediately after the cinematic or overlap with other interactive modal elements if state updates resolve in a rapid tick.
* **Lack of Intermission:** The transition lacks a calm, intentional "What's New in this Chapter" summary card that lets players pause, breathe, and read the major new rules of the tier before entering.

---

## 3. Proposed Refined Transition Flow

To establish a calm, cinematic, and highly intentional player experience, we propose a unified, state-driven transition pipeline that completely eliminates overlapping popup fatigue.

```
[Requirement Met]
       │
       ▼
[1. Specialization Selection Modal] ──(Deducts fees, locks in branch/class)
       │
       ▼
[2. Chapter Cinematic Transition] ──(Full-screen visual, blocks inputs, plays quote)
       │
       ▼
[3. "What's New in this Chapter" Screen] ──(Interactive summary card highlighting new rules/systems)
       │
       ▼
[4. Optional Advisor Briefing] ──(Fires only if Guidance is enabled and first time entering tier)
       │
       ▼
[5. Return to Gameplay]
```

### Detailed Sequence:
1. **Tier Advancement Selection:** The player chooses to advance and pays the transition fee.
2. **Cinematic Transition:** A full-screen overlay runs with zero active interactive UI elements, letting the player absorb the theme, color, and quote of the new chapter.
3. **The Chapter Hub Card ("What's New"):** Once the cinematic completes, a single, polished "What's New in Chapter X" summary deck opens. This card details:
   - **Main Theme:** The primary goal of the current tier.
   - **Unlocked Systems:** A visual showcase of the newly accessible systems (e.g. Venture Capital, Cabinet Management, Real Estate).
   - **The Stakes:** A clear breakdown of the increased monthly rent obligations and new threat levels.
4. **Optional Advisor Briefing:** An Advisor mentor modal displays next, but **only if** the player's Guidance level permits.
5. **Smooth Gameplay Intermission:** Standard UI tabs and buttons fade back in, ready for action.

---

## 4. Introducing Player-Controlled Guidance Settings

To prevent seasoned players from feeling nagged while ensuring new players get the support they need, we propose introducing player-controlled **Guidance Settings** into the profile/Zustand store.

### Guidance Level Settings:
* **Full Guidance (`'Full'`):** Triggers all onboarding tier summaries, contextual advisor warnings (high heat, low mental health, first million, etc.), and step-by-step game tutorial boxes.
* **Recommended (`'Recommended'`):** Triggers major tier advancement onboarding summaries and critical, survival-level advisor alerts (e.g., bankruptcy risk, jail dangers).
* **Minimal (`'Minimal'`):** Triggers only the core "What's New" tier chapter summaries. Contextual advisor warnings are fully suppressed.
* **Off (`'Off'`):** Suppresses all onboarding summaries and advisor prompts completely. The transition flows straight from the Cinematic back to clean gameplay.

### Core Implementation Strategy:
1. Introduce a state attribute `guidanceSettings: 'Full' | 'Recommended' | 'Minimal' | 'Off'` in `PlayerStats`.
2. Initialize it with a default value of `'Recommended'`.
3. Wrap all advisor trigger hooks and render blocks with matching setting checks.
4. Provide a settings option in the profile header/dashboard to toggle this value at any time.

---

## 5. Benefits, Potential Issues, and Effort Estimation

### Benefits:
* **Pacing & Polish:** The transition feels like a reward and a milestone rather than a chaotic UI clutter.
* **Empowered Players:** Players can customize their learning curves via Guidance Levels, ensuring veterans can play unobstructed while newcomers are securely guided.
* **State Cohesion:** By structuring the transition as a linear queue, we prevent bugs where state changes trigger multiple React rerenders that clash over screen space.

### Potential Issues & Mitigations:
* **State Race Conditions:** If the calendar advances immediately during transition, monthly news stories might flash behind the cinematic.
  * *Mitigation:* Ensure that standard month advancement results are stored and displayed *after* the cinematic queue has cleared.
* **Zustand Mutator Isolation:** Directly mutating `pl.narrativeFlags` must be managed cleanly using the approved `useGameStore.setState` patterns to avoid react lifecycle warning loops.
  * *Mitigation:* Consistently use pure flat store selectors and avoid constructing brand new compound objects inline during state evaluations.

### Estimated Implementation Effort:
* **Report Authoring & Initial Type-Safe Wireframing:** *Completed* (Part of this patch).
* **Core Transition State Machine & "What's New" Components:** 1-2 developer days (medium risk, high return).
* **Guidance Settings Toggle UI & Integration:** 0.5 developer days (low risk, high return).
