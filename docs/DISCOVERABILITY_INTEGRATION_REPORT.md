# Character-Driven Discoverability Integration Report
**Prepared by:** Jules, Software Engineer & UX Architect
**Subject:** Bridging Character Popups & Dialogue with Existing Core Systems

---

## 1. Executive Summary

To naturally improve **discoverability** of hidden and late-game systems within *Bag Chaser* without intrusive tutorials, we have integrated a **Character-Driven Discoverability System**. This system connects character dialogues and breaking world news stories directly to deep gameplay systems (*Biography, History, Reputation, Portfolio, Ledger, WorldReactionFeed, and Rivals*) using a contextual, state-driven navigation pipeline.

Whenever a character or media bulletin references topics like public opinion, rivals, media coverage, investment progress, or empire balance sheets, the modal instantly offers a contextual shortcut action button. This empowers the player to learn by curiosity and immediately explore the associated screens.

---

## 2. Contextual Link Architecture & Mapping

We scanned all character popups, dialogue contexts, and live bulletin streams to establish a robust keyword-mapping routing matrix.

| Source Popup Location | Dialogue Context & Keyword Signals | Destination Target | Action Flag / Payload | Est. Complexity |
| :--- | :--- | :--- | :--- | :---: |
| **Narrative Event Modal** (`NarrativeEventModal.tsx`) | Public controversy, media interviews, gossip, tabloids (*"gossip"*, *"news"*, *"public"*) | **World Reaction Phone Feed** | `open_feed = true` | **Very Low** |
| **Narrative Event Modal** (`NarrativeEventModal.tsx`) | Rival threats and competitor bickerings (*"rival"*, *"enemies"*, *"sabotage"*) | **Rival Leaderboard** (Scoreboard Career) | `open_scoreboard = true`, tab: `'career'` | **Very Low** |
| **Narrative Event Modal** (`NarrativeEventModal.tsx`) | High-ticket investments, acquisitions, real estate (*"portfolio"*, *"real estate"*) | **Portfolio Tab** | `open_scoreboard = true`, tab: `'portfolio'` | **Very Low** |
| **Interactive Story Modal** (`InteractiveStoryModal.tsx`) | Pops' conversations, climbing stories, humble beginnings (*"journey"*, *"pops"*, *"how far"*) | **Biography Tab** | `open_scoreboard = true`, tab: `'biography'` | **Very Low** |
| **Live World Event Modal** (`LiveWorldEventModal.tsx`) | Media stories, breaking updates, social trending spikes | **World Reaction Phone Feed** (Filtered Category) | `open_feed = true` | **Low** |
| **Live World Event Modal** (`LiveWorldEventModal.tsx`) | Market bulletin flashes and central ledger adjustments (*"ledger"*, *"passive"*, *"overhead"*) | **Ledger Tab** | `open_scoreboard = true`, tab: `'ledger'` | **Very Low** |

---

## 3. Step-by-Step Technical Implementation Flow

We accomplished this feature using 100% save-compatibility guidelines and local state synchronization.

### Step 3.1: Centralized Keyword Scanner (`src/utils/discoverabilityUtils.ts`)
A lightweight, case-insensitive, pure parser scans all dialogue text for relevant semantic targets and returns up to 2 high-priority links to prevent modal clutter.

```typescript
export interface DiscoverabilityLink {
  label: string;
  actionFlag: 'open_feed' | 'open_scoreboard';
  scoreboardTab?: 'career' | 'portfolio' | 'history' | 'biography' | 'reputation' | 'ledger';
}

export function scanDialogueForNavigationLinks(text: string): DiscoverabilityLink[] {
  // Parses case-insensitive keywords and maps to action flags/scoreboard tabs
}
```

### Step 3.2: Reactive App-Level Dispatcher (`src/App.tsx`)
We added a React `useEffect` inside `App.tsx` that listens to `pl.narrativeFlags` updates (such as `open_feed`, `open_scoreboard`, and `open_scoreboard_tab`). When triggered, it opens the target overlay modal and cleans up the control flags inside a single state transaction.

### Step 3.3: Scoreboard Z-Index Layering Fix (`src/components/Scoreboard.tsx`)
To ensure the player has a flawless visual experience, we set the Scoreboard modal's z-index to `z-[3500]`. This allows it to stack dynamically on top of the active Narrative modal when triggered by a discoverability button. Once they close the Scoreboard, they return to the narrative modal to resolve their storyline choice.

---

## 4. Visual Verification & Proof of Work

Using a custom automated Playwright E2E verification suite, we successfully validated the entire user experience pipeline:
1. Loaded the local development server.
2. Programmatically triggered `char_pops_garden` (Arthur "Pops" Jenkins conversation).
3. The popup automatically scanned Pops' dialogue and displayed the **`🔍 READ BIOGRAPHY CHAPTER`** action button underneath the description.
4. Clicking the discoverability button successfully opened the Scoreboard directly onto the **Biography Tab** to reveal the progressive feature requirements.

*Screenshots were successfully generated and recorded at `/home/jules/verification/after.png` and `/home/jules/verification/scoreboard_bio.png` for review.*
