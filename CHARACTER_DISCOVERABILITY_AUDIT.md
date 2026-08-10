# Character-Driven Discoverability Audit Report
**Prepared by:** Jules, Software Engineer & UX Architect
**Subject:** Bridging Character Popups & Dialogue with Existing Systems
**Core Objective:** Empower game characters to act as organic bridges that guide players directly to deeper, under-discovered game consoles (*WorldReactionFeed, Biography, History, Reputation, Portfolio, Ledger, and Rivals*) exactly when relevant.

---

## 1. Contextual Navigation Design Architecture

To ensure 100% save-compatibility and prevent direct, invasive modifications to existing Zustand store slices, we design a state-driven navigation trigger system that utilizes the player's existing dynamic `pl.narrativeFlags` and local states.

### The Trigger & Navigation Pipeline:
1. **Dynamic Character Dialogue Analysis**: Child modals (`NarrativeEventModal`, `InteractiveStoryModal`, `LiveWorldEventModal`) inspect active narrative text, titles, or speaker identities for critical keywords or predefined Event IDs.
2. **Flag Setting**: When a player clicks a contextual action button (e.g. *"See reactions"*, *"View ledger"*), the modal updates the player stats store:
   - Sets `pl.narrativeFlags.open_feed = true` (to open the smartphone World Reaction Feed).
   - Sets `pl.narrativeFlags.open_scoreboard = true` and `pl.narrativeFlags.open_scoreboard_tab = 'tabName'` (to open the Scoreboard on tabs like `reputation`, `biography`, `history`, `ledger`, `portfolio`, etc.).
3. **App-Level Action Dispatcher**: Inside `src/App.tsx`, a simple, high-performance `useEffect` monitors these flag changes. Upon detecting a trigger, it opens the corresponding overlay modal (`setShowPhoneFeed(true)`, `setShowScoreboard(true)`) and immediately clears the flag in a single transaction.

---

## 2. Character Popup Locations & Discoverability Audit

The following table details every character-speaking popup location, mapped to its corresponding system target, reused state properties, and estimated implementation complexity.

| # | Popup Location | Dialogue Context & Speaker | Target Destination | Reused Data & Flags | Est. Effort |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **1** | `NarrativeEventModal.tsx` | **Public Controversy / Gossip** (e.g., Sofia: *"People are talking about you..."*) | `WorldReactionFeed` (Phone app) | `event.description`, `event.title`, keyword: "interview", "gossip", "media" | **Very Low** (15 lines of keyword scans) |
| **2** | `NarrativeEventModal.tsx` | **Rival Threats & Alliances** (e.g., Victor Kane: *"You've made powerful enemies."*) | `RivalLeaderboard` / Scoreboard Career Tab | Keyword: "rival", "Kane", "enemy", "bidding", "sabotage" | **Very Low** (10 lines of text checks) |
| **3** | `NarrativeEventModal.tsx` | **High-Overhead Transactions** (e.g., Marcus: *"Investors noticed..."*) | `Scoreboard` Ledger Tab / Portfolio Tab | Keyword: "investor", "acquisition", "balance", "capital" | **Very Low** (15 lines) |
| **4** | `InteractiveStoryModal.tsx` | **Deli Contact / Rise Dialogue** (e.g., Pops: *"I can't believe how far you've come..."*) | `Scoreboard` Biography Tab | `event.contextMessage`, keyword: "how far", "journey", "climb", "Pops" | **Very Low** (15 lines) |
| **5** | `LiveWorldEventModal.tsx` | **Breaking News / Social Trend** (e.g., Tabloid: *"Local figure scandals!"*) | `WorldReactionFeed` (Filtered Tab) | `event.headline`, `event.body`, `event.type` | **Low** (15 lines) |
| **6** | `LiveWorldEventModal.tsx` | **Market Flash Bulletin** (e.g., Wall Street: *"Recession hitting..."*) | `Scoreboard` Ledger Tab / Portfolio | `event.type === 'MARKET_FLASH'` | **Very Low** (10 lines) |
| **7** | `AdvisorMentorModal.tsx` | **Status / Balance Warnings** (e.g., Advisor: *"Mind is collapsing..."* or *"Protests beginning"*) | `Scoreboard` Reputation Tab / Critical Deck | `activeAdvisorPrompt.tabToOpen`, custom action callbacks | **None** (System already wired, needs minor prompt tuning) |

---

## 3. Step-by-Step Implementation Map

### Step A: Implement state-driven navigation handler inside `src/App.tsx`
Add a simple reactive callback handler to orchestrate target views.
```typescript
useEffect(() => {
  if (!pl || !pl.narrativeFlags) return;

  let updatedFlags = null;

  if (pl.narrativeFlags.open_feed) {
    setShowPhoneFeed(true);
    updatedFlags = { ...(updatedFlags || pl.narrativeFlags), open_feed: false };
  }

  if (pl.narrativeFlags.open_advisor) {
    setShowAdvisor(true);
    updatedFlags = { ...(updatedFlags || pl.narrativeFlags), open_advisor: false };
  }

  if (pl.narrativeFlags.open_scoreboard) {
    setShowScoreboard(true);
    const targetTab = pl.narrativeFlags.open_scoreboard_tab as string;
    updatedFlags = {
      ...(updatedFlags || pl.narrativeFlags),
      open_scoreboard: false,
      ...(targetTab ? { target_scoreboard_tab: targetTab, open_scoreboard_tab: '' } : {})
    };
  }

  if (updatedFlags) {
    useGameStore.getState().updatePl({
      narrativeFlags: updatedFlags
    });
  }
}, [pl?.narrativeFlags?.open_feed, pl?.narrativeFlags?.open_advisor, pl?.narrativeFlags?.open_scoreboard, updatePl, pl?.narrativeFlags]);
```

### Step B: Build dynamic dialogue keyword parser helper `src/utils/discoverabilityUtils.ts`
Establish a centralized pure function that scans any dialogues for appropriate targets.
```typescript
export interface DiscoverabilityLink {
  label: string;
  actionFlag: 'open_feed' | 'open_scoreboard';
  scoreboardTab?: 'career' | 'portfolio' | 'history' | 'biography' | 'reputation' | 'ledger';
}

export function scanDialogueForNavigationLinks(text: string): DiscoverabilityLink[] {
  const links: DiscoverabilityLink[] = [];
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes('talk') ||
    lowerText.includes('interview') ||
    lowerText.includes('chirp') ||
    lowerText.includes('opinion') ||
    lowerText.includes('reaction') ||
    lowerText.includes('scandal') ||
    lowerText.includes('media') ||
    lowerText.includes('news')
  ) {
    links.push({ label: 'See reactions', actionFlag: 'open_feed' });
  }

  if (
    lowerText.includes('rival') ||
    lowerText.includes('kane') ||
    lowerText.includes('enemy') ||
    lowerText.includes('competitor') ||
    lowerText.includes('sabotage')
  ) {
    links.push({ label: 'Open rival board', actionFlag: 'open_scoreboard', scoreboardTab: 'career' });
  }

  if (
    lowerText.includes('how far') ||
    lowerText.includes('biography') ||
    lowerText.includes('journey') ||
    lowerText.includes('climb') ||
    lowerText.includes('story') ||
    lowerText.includes('narrative')
  ) {
    links.push({ label: 'Read biography chapter', actionFlag: 'open_scoreboard', scoreboardTab: 'biography' });
  }

  if (
    lowerText.includes('reputation') ||
    lowerText.includes('clout') ||
    lowerText.includes('aura') ||
    lowerText.includes('perception')
  ) {
    links.push({ label: 'View reputation', actionFlag: 'open_scoreboard', scoreboardTab: 'reputation' });
  }

  if (
    lowerText.includes('investor') ||
    lowerText.includes('acquisition') ||
    lowerText.includes('portfolio') ||
    lowerText.includes('asset') ||
    lowerText.includes('real estate')
  ) {
    links.push({ label: 'View portfolio', actionFlag: 'open_scoreboard', scoreboardTab: 'portfolio' });
  }

  if (
    lowerText.includes('ledger') ||
    lowerText.includes('payout') ||
    lowerText.includes('yield') ||
    lowerText.includes('balance sheet') ||
    lowerText.includes('passive')
  ) {
    links.push({ label: 'View ledger', actionFlag: 'open_scoreboard', scoreboardTab: 'ledger' });
  }

  return links.slice(0, 2); // Cap at 2 shortcuts to prevent modal UI clutter
}
```

### Step C: Integrate Link Renderer into Child Modals
In modals like `NarrativeEventModal.tsx`, `InteractiveStoryModal.tsx`, and `LiveWorldEventModal.tsx`:
- Import `scanDialogueForNavigationLinks` and check active description text.
- Render dynamic navigation shortcut action button(s) next to "Continue" or narrative option choices:
```typescript
const navLinks = scanDialogueForNavigationLinks(event.description || "");

// In JSX:
{navLinks.map((link, idx) => (
  <button
    key={idx}
    onClick={() => {
      updatePl({
        narrativeFlags: {
          ...(pl.narrativeFlags || {}),
          [link.actionFlag]: true,
          ...(link.scoreboardTab ? { open_scoreboard_tab: link.scoreboardTab } : {})
        }
      });
      // Optionally dismiss/close the active modal if transitioning
    }}
    className="px-4 py-2 bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-black rounded-lg hover:bg-emerald-500/10 transition-colors"
  >
    🔍 {link.label}
  </button>
))}
```

---

## 4. Summary of Value

By implementing this architecture, players who read:
* Pops saying *"I can't believe how far you've come"* are instantly rewarded with a single-click portal to read their **chronicled biography chapter**.
* Victor Kane warning *"You've made powerful enemies"* can instantly open the **rival leaderboard** to counter-sabotage him.
* Tabloid alerts saying *"People are talking about you"* can directly jump to the **World Reaction Chirper timeline**.

This fulfills all UX discovery objectives organically, turning narrative popups into active system gateways, greatly elevating overall player comprehension and delight.
