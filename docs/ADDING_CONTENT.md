# Adding Content

This guide explains how to add new content to Bag Chaser.

## Adding a Hustle

1.  **Define the Hustle**: Open `src/config/hustles/base.ts`.
2.  **Add to `HUSTLES`**:
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
3.  **Assign Sector**: Open `src/config/sectors.ts` and map your hustle ID to a sector (e.g., `Technology`, `Retail`).

## Adding a Minigame

1.  **Create Component**: Add a new `.tsx` file in `src/components/minigames/`.
2.  **Implement Logic**: The component should accept an `onComplete(multiplier: number)` prop.
3.  **Register Hustle**: In `src/config/hustles/base.ts`, set the `miniGame` field to the component name.
4.  **Update App.tsx**: If it's a new global minigame type, ensure it's imported and handled in the execution flow.

## Adding a Narrative Event

1.  **Open `src/config/narrativeEvents.ts`**.
2.  **Add Entry**:
    ```typescript
    {
      id: 'mysterious_investor',
      title: 'A Mysterious Call',
      description: 'An unknown number offers a deal...',
      trigger: { tier: ['STARTUP'], probability: 0.1 },
      choices: [
        {
          id: 'accept',
          label: 'Accept Deal',
          consequences: { bag: 100000, heat: 20 },
          setFlags: { took_shady_deal: true }
        },
        { id: 'decline', label: 'Decline', consequences: { aura: 10 } }
      ]
    }
    ```

## Adding a World Event

1.  **Open `src/config/worldEvents.ts`**.
2.  **Add Configuration**:
    ```typescript
    {
      id: 'ai_revolution',
      name: 'AI Revolution',
      rarity: 'RARE',
      duration: [6, 12],
      sectorModifiers: {
        'Technology': 1.5,
        'Finance': 0.2
      },
      newsTemplates: {
        start: 'AI is taking over everything!',
        end: 'The AI hype has cooled down.'
      }
    }
    ```

## Adding a Legacy Upgrade

1.  **Define Interface**: Check `src/types/legacy.ts`.
2.  **Add to Config**: Open `src/config/legacyUpgrades.ts`.
3.  **Implement Effect**:
    - If it's a stat buff, update `getInitialStats` in `src/store/initialState.ts`.
    - If it's a gameplay buff, update the relevant engine (e.g., `mathEngine.ts` for yield boosts).

## Adding a Specialization

1.  **Open `src/config/specializations.ts`**.
2.  **Add Spec**:
    ```typescript
    {
      id: 'tech_titan',
      name: 'Tech Titan',
      description: 'Master of the digital realm.',
      tier: 'STARTUP',
      yieldCashMult: 1.2,
      requirement: { stat: { type: 'clout', value: 500 } }
    }
    ```
