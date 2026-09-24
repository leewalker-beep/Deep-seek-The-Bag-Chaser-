# Adding Content

This guide explains how to add new content to Bag Chaser.

## Adding a Hustle

1. **Define the Hustle**: Open `src/config/hustles/base.ts`.
2. **Add to `HUSTLES`**:
    ```typescript
    HUSTLES.my_new_hustle = {
      id: 'my_new_hustle',
      name: 'New Hustle',
      tier: 'STREET',
      icon: '🔥',
      description: 'A cool new way to earn.',
      miniGame: 'QuickReaction', // Optional
      branches: {
        l1: { level: 1, cost: 0, yieldCash: 5000, yieldClout: 10, yieldAura: 5, mentalHealth: -10, ... }
      }
    };
    ```
3. **Configure Mastery Requirements**: In `src/utils/masteryUtils.ts`, add custom crown completion targets to `MASTERY_REQUIREMENTS` and label strings to `PLAY_LABELS`.
4. **Assign Sector**: Map your hustle ID to an economic sector in `src/config/sectors.ts`.

## Adding a Minigame

1. **Create Component**: Add a new `.tsx` file in `src/components/minigames/` using `GameViewport` for full-screen layout consistency.
2. **Implement Interface**: The component must accept `onComplete(multiplier: number)` and `level: number` props.
3. **Lazy Import**: Lazy-load the minigame in `src/App.tsx`.
4. **Register in Registry Integrity Suite**: Update `src/tests/minigameRegistryIntegrity.test.ts` to include the new minigame ID.

## Adding a Narrative Event

1. **Select Tier File**: Open the corresponding tier JSON in `src/config/narrative/` (e.g., `mud.json`, `street.json`).
2. **Add Entry**:
    ```json
    {
      "id": "mysterious_investor",
      "title": "A Mysterious Call",
      "description": "An unknown number offers a deal...",
      "trigger": { "tier": ["STARTUP"], "probability": 0.1 },
      "choices": [
        {
          "id": "accept",
          "label": "Accept Deal",
          "consequences": { "bag": 100000, "heat": 20 },
          "setFlags": { "took_shady_deal": true }
        },
        { "id": "decline", "label": "Decline", "consequences": { "aura": 10 } }
      ]
    }
    ```
3. **Ensure Decline Option**: Non-critical events should include a zero-cost decline choice.

## Adding a World Event & Reaction Feed Template

1. **Open `src/config/worldFeed/templates.json`**.
2. **Add Headline & Reaction Templates**: Define templates for news multi-outlets and social reactions.
3. **Verify with Tests**: Run `bun test src/tests/world_events.test.ts`.

## Adding a Portrait Avatar

1. **Add SVG Asset**: Place a new SVG vector file in `src/assets/avatars/`.
2. **Register Portrait**: Add a portrait definition to `PORTRAITS` in `src/config/portraitRegistry.ts`.
