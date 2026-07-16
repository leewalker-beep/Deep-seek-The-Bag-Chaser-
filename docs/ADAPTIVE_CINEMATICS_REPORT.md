# Architectural Proposal: Adaptive & Personalized Cinematics

This report presents the current state of onboarding and character creation flow in **Bag Chaser**, details the newly implemented low-risk improvements, and outlines a comprehensive architectural design to scale personalized, adaptive cinematics across future mid-game, late-game, and end-of-life chapters.

---

## 1. Onboarding & Character Creation Flow

### Current vs. Newly Implemented Flow

Previously, the character creation flow combined the selection of the core Origin Class (such as Street Kid or Dropout) and the specific Starting Variation (such as Delivery Hustler or Self-Taught Techie) on the exact same screen. This felt crowded and did not give players a feeling of choice-driven progression. Furthermore, the opening cinematic was a static text sequence that read identically for every single player.

We have redesigned and expanded this into a logical, high-fidelity **8-step wizard**:

1. **Welcome Screen (`welcome`)**
   - Presents a high-fidelity introduction with a dedicated *Legacy Inheritance Panel* detailing permanent meta-unlocks (Legacy Points and active perks) vs. left-behind elements.
2. **Enter Name (`enter_name`)**
   - Dedicated, centered name-entry step allowing the player to record their identity/alias.
3. **Choose Avatar (`choose_avatar`)**
   - A highly visual grid showcasing portraits/avatars for players to confirm their facial profile.
4. **Choose Origin / Background (`choose_origin`)**
   - Immersive selection of the primary Origin Class (Street Kid, Dropout, Benefactor, Legacy). Highlights the advantages, disadvantages, mindset, and playstyle hints of each class on a premium dashboard card.
5. **Select Starting Conditions (`select_starting_conditions`) [NEW STEP]**
   - Split from the origin step to give starting choices maximum weight and emotional focus.
   - **Starter Career Specialization Selector:** Choose a starting vehicle variation for that category (e.g. Scrap Yard Scavenger, Plasma Donor) that defines their baseline starting cash, clout, and aura.
   - **Starting Focus Modifier:** Customize their trajectory by selecting an active starting modifier:
     - 🚀 **AGGRESSIVE CAPITALIST:** +$250 Starting Cash.
     - 📣 **INFLUENCE HUSTLER:** +10 Starting Clout.
     - ✨ **CHARISMATIC PLAYER:** +10 Starting Aura.
     - ⚖️ **STABLE INSIDER:** Balanced starting stats.
6. **Opening Cinematic (`opening_cinematic`) [NEWLY ADAPTIVE]**
   - Rhythmic, animated text lines compiled via a dynamic, reactive `useMemo` block.
   - Narrations dynamically interpolate player Name, chosen Origin, Specialization, Starting Wealth, and Starting Focus Modifier.
   - Glow and shadow colors shift dynamically to set the emotional tone (e.g. Street Kid uses gritty rose/red tones, Dropout uses rebellious teal/violet hues, and Benefactor uses gold/cyan tones).
7. **Advisor Introduction (`advisor_intro`) [NEWLY ADAPTIVE]**
   - Briefing greetings from the Mentor/Advisor that dynamically reference the player's name and give specific tactical advice tailored to their chosen Starting Focus Modifier.
8. **First Month (`first_month`) [NEWLY ADAPTIVE]**
   - Final confirmation card displaying a complete, unified profile summary detailing Name, Origin Class, Specialized Starter Job, Strategy Focus, and Starting Cash aligned precisely with actual initial game state.

---

## 2. Dynamic Adaptive Narration Engine

### Architectural Concept
Rather than creating completely separate video or text files for each scenario (which increases bundle size and maintenance overhead), our adaptive engine utilizes **dynamic template interpolation** backed by standard React state and Zustand selectors.

```
                                 ┌───────────────────────────────────┐
                                 │   PLAYER PROFILE STATE            │
                                 │   - Name, Origin, Specialization   │
                                 │   - Focus Modifier, Legacy Perks  │
                                 └─────────────────┬─────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────┐      ┌───────────────────────────────────┐
│ NARRATIVE DATA SOURCE   │      │ ADAPTIVE TEMPLATE ENGINE          │
│ - Origin Templates      ├─────►│ - Dynamic useMemo compiles lines  │
│ - Focus Interpolations  │      │ - Calculates glow/visual colors   │
└─────────────────────────┘      └─────────────────┬─────────────────┘
                                                   │
                                                   ▼
                                 ┌───────────────────────────────────┐
                                 │ PROLOGUE CINEMATIC PRESENTATION   │
                                 │ - Animated rhythmic text panels   │
                                 │ - Seamlessly advances to Month 1  │
                                 └───────────────────────────────────┘
```

### Data Sources
1. **Player Profile Inputs (`playerName`, `selectedAvatarId`):** Explicitly specified identity.
2. **Background Config (`BACKGROUND_CATEGORIES` in `backgrounds.ts`):** Source of truth for baseline variation statistics, icons, and starting capital values.
3. **Focus Modifiers (`startingFocusId`):** Custom starting trajectory parameters mapped to extra game-start assets and biography hooks.
4. **Legacy Store (`bankedLegacyPoints`, `unlockedLegacyUpgradeIds` in `useGameStore`):** Enables the special "The Chosen" origin paths and permanent upgrades.

---

## 3. Scaling Adaptive Cinematics Across Future Chapters

To make every player feel that the entire game world is reactive, future chapters (such as Tier promotions, the Presidential Campaign, and Endgame Summary obituaries) should follow this exact pattern.

### Proposed Architecture for Late-Game Chapters

We propose establishing a centralized **Dynamic Narrative Service** (`src/engine/cinematicEngine.ts`) that evaluates the current player state and generates fully structured cinematic lines.

#### Structure of Cinematic Data Payload
```typescript
interface CinematicLine {
  text: string;
  glowColor: string; // e.g. 'shadow-emerald-500/20'
  duration?: number; // duration of display in ms
  audioCue?: string; // audio trigger name
}

interface DynamicCinematic {
  id: string;
  lines: CinematicLine[];
  advisorRecommendation: string;
}
```

#### Code Example for Late-Game Transitions (e.g. Transitioning to ELITE Tier)
```typescript
export function generateTierTransitionCinematic(pl: PlayerStats, nextTier: string): DynamicCinematic {
  const name = pl.name || 'HUSTLER';
  const primaryBusiness = pl.businesses?.[0]?.name || 'your enterprises';
  const rivalCount = pl.npcs?.filter(n => n.disposition < 40).length || 0;

  const lines: CinematicLine[] = [];

  if (nextTier === 'ELITE') {
    lines.push({
      text: `Welcome to high society, ${name}.`,
      glowColor: 'shadow-yellow-500/20'
    });

    if (pl.bag > 1000000) {
      lines.push({
        text: `With over a million dollars in liquid capital, your leverage is unmatched.`,
        glowColor: 'shadow-emerald-500/20'
      });
    } else {
      lines.push({
        text: `Your wealth is largely locked in assets, but your reputation preceded you.`,
        glowColor: 'shadow-blue-500/20'
      });
    }

    if (rivalCount > 0) {
      lines.push({
        text: `The boardroom doors are open, but watch your back. ${rivalCount} rivals are already watching.`,
        glowColor: 'shadow-rose-500/25'
      });
    } else {
      lines.push({
        text: `The boardrooms are empty of enemies. For now, you dictate the rules.`,
        glowColor: 'shadow-emerald-500/20'
      });
    }
  }

  return {
    id: `transition_${nextTier}`,
    lines,
    advisorRecommendation: `Secure real estate portfolios to offset Elite tax brackets.`
  };
}
```

---

## 4. Implementation Effort & Roadmap

| Chapter / Cinematic | Focus | Required Variables | Estimated Effort |
| :--- | :--- | :--- | :--- |
| **Tier Promotions (STREET to MOGUL)** | Acknowledging player's primary industry and rival statuses. | `pl.currentTier`, active businesses, hostile NPC count | **1 Developer Day** (Low Complexity) |
| **Presidential Campaign Launch** | Recognizing political leaning and public persona (e.g. Philanthropist vs. Crime Boss). | `pl.narrativeFlags.publicReputation`, campaign funds | **2 Developer Days** (Medium Complexity) |
| **Post-Mortem Chronicle / Obituary** | Weaving biography entries, famous milestones, and cause of death into a tragic or triumphant final sequence. | `pl.biography`, `fatalCause`, `deathBadge` | **1.5 Developer Days** (Low Complexity) |

---

## 5. Potential Risks & Mitigations

1. **Test Flakiness:**
   - *Risk:* Automated integration or smoke tests could break if they click through the cinematic transitions or expect static strings.
   - *Mitigation:* Explicitly verify UI actions against standard element selectors (like headings and buttons) rather than fragile, hardcoded text strings. Pre-populate mock flags in test blocks to bypass cinematics in pipeline runs.
2. **Narration Repetitiveness:**
   - *Risk:* If players trigger similar transition screens multiple times across consecutive runs, the narration might start feeling formulaic.
   - *Mitigation:* Build a lightweight array shuffle mechanism inside the dynamic narrative service to select from several synonymous phrase variations.
3. **Translation & Localization:**
   - *Risk:* Dynamic sentence structures are difficult to translate accurately due to varying grammar rules across languages.
   - *Mitigation:* Ensure dynamic pieces are constructed using atomic phrases or sentences rather than splicing single nouns into the middle of complex translated strings.
