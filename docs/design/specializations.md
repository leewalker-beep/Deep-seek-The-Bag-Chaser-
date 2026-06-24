# Design Document: Specialization Perks

## Overview
Specialization Perks transform the "Stat Tax" (the 40% loss of Clout/Aura upon tier advancement) into a strategic choice. Players select one perk when they advance a tier, allowing them to shape their character's trajectory and playstyle.

## The Perks

| Perk ID | Name | Clout Tax | Aura Tax | Yield Bonus | Special Effect |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **influencer** | The Influencer | 10% | 50% | +20% Clout | +10% Heat gain from all actions. |
| **shadow** | The Shadow | 50% | 10% | +20% Aura | -25% Heat gain from all actions. |
| **institutional** | The Institutionalist | 30% | 30% | +15% Cash | -20% filing fees for next tier. |
| **grinder** | The Grinder | 20% | 20% | - | -20% Mental Health hit from all hustles. |
| **vanguard** | The Vanguard | 40% | 40% | +25% Clout/Aura | +15% Mental Health hit (high stress). |
| **balanced** | The Veteran | 25% | 25% | +10% All | No negative side effects. |

## Mechanics

1. **Trigger:** When `advanceTier` is called and requirements are met.
2. **Selection:** A modal appears presenting 3 random perks from the list.
3. **Application:**
   - The selected perk determines the `Math.floor(stat * multiplier)` applied to Clout and Aura.
   - The `activeSpecializationId` is saved to the player's state.
   - The perk is added to `specializationHistory` for legacy tracking.
4. **Persistent Buffs:** The `mathEngine` checks `activeSpecializationId` to apply yield and stat modifiers to every hustle executed in the new tier.

## Impact on Retention
By allowing players to choose which stat they "save," the feeling of unfair loss is replaced by a feeling of character building. A player focusing on Clout will choose "The Influencer," making their transition feel like a progression of their chosen path rather than a reset.
