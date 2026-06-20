# Onboarding Analysis: Current Failure & Proposed Fix

## 1. Root Cause Analysis: Why the Current Approach is Failing

The current onboarding uses a **Forced-Step Overlay** approach. While intended to guide the player, it creates several critical "stuck" points:

### A. The "Glass Wall" (Z-Index & Pointer Events)
- **Problem:** The `TutorialOverlay` uses a fixed container with `z-[100]`. Although it uses `clip-path` to create a "hole," the backdrop is set to `pointer-events: auto`.
- **Impact:** On many mobile browsers and some desktop configurations, the "hole" does not reliably pass touch events to the elements underneath. When a minigame launches (e.g., Delivery Gigs), the tutorial card and backdrop sit on top of the game, preventing the player from swiping or tapping game elements.

### B. Minigame Interaction Blocking
- **Problem:** Minigames like `SwipeOrder` require full-screen interaction. The Tutorial Step 1 ("Play Minigame") targets the `PLAY` button. Once clicked, the minigame starts *underneath* the overlay.
- **Impact:** The player sees the game but cannot play it because the Tutorial Step 1 overlay is still active, waiting for a "success" state that the player can't trigger because they can't touch the game.

### C. Layout Fragility & Element Disappearance
- **Problem:** The overlay relies on `document.querySelector` and `getBoundingClientRect` via a `setInterval(100ms)`.
- **Impact:** When the UI transitions (e.g., from Hustle Grid to Hustle Detail), there is a lag where the highlight "ghosts" over the old position. If an element disappears, the `highlightRect` becomes null, and the backdrop often defaults to covering the entire screen, locking the player out.

### D. Mobile Target Conflicts
- **Problem:** The tutorial card is positioned at `bottom: 24px`.
- **Impact:** On an iPhone SE or similar small screens, this card directly overlaps with the primary interaction buttons (Execute/Play) or the minigame's bottom UI elements. The player literally cannot see what they are supposed to tap.

---

## 2. Option A: Salvaging the Forced-Step Approach (The "Patch")

If we must keep the current approach, the following fixes are required to make it functional:

### A. Non-Blocking Backdrop
- Change the backdrop `pointer-events: auto` to `pointer-events: none`.
- Only set `pointer-events: auto` on the **Tutorial Card** itself.
- **Why:** This allows clicks to pass through the "hole" (and the entire mask) naturally to the game elements.

### B. Smart Positioning (Avoid Overlap)
- Implement logic to detect if the target element is in the bottom 50% of the viewport.
- If it is, slide the Tutorial Card to the **top** of the screen.
- **Why:** Prevents the card from covering the buttons the player needs to tap.

### C. State-Triggered Visibility
- Hide the tutorial overlay completely when `showMinigame` is true.
- **Why:** Removes the "Glass Wall" during active gameplay.

---

## 3. Option B (Recommended): Switch to Goal-Based HUD

Instead of a blocking overlay, we should switch to a **Non-Blocking Goal HUD**.

### The Concept
- **Persistent Goal Bar:** A slim bar at the top of the screen that tells the player their current objective (e.g., "Goal: Earn $100").
- **State-Driven Progress:** The HUD monitors the `GameState` (bag, clout, tier) and advances automatically when conditions are met.
- **Non-Blocking:** The HUD has no backdrop. The player is free to explore the UI, but the HUD provides a "North Star."

### Why it solves the issues:
- **No Interaction Blocking:** Since there is no full-screen backdrop, minigames remain fully interactive.
- **Mobile-First:** A top-anchored bar stays out of the "Thumb Zone" (the bottom 60% of the screen where most interactions happen).
- **Resilient:** It doesn't care about CSS selectors or DOM rects. If the player earns $100 via a different hustle than the one "suggested," the goal still completes.

---

## 4. Mobile-First Design Plan (Goal-Based)

### Layout (The "Top Toast")
- **Height:** 60px max.
- **Position:** Fixed at the top, just below the Status Bar.
- **Visuals:** Dark semi-transparent background with a progress ring or bar.
- **Interaction:** Tap to expand for a longer explanation; otherwise, it's just a passive guide.

### Implementation Details
- **Pulsing Cues:** Instead of a mask, add a `pulse` CSS animation to the "recommended" hustle card.
- **Auto-Scroll:** If the target hustle is off-screen, the HUD can show a small arrow pointing down.
- **Feedback:** When a goal is reached, the HUD flashes emerald and slides up to show the next goal.

---

## 5. Proposed Goal Sequence
1. **The First Dollar:** "Hustle Delivery Gigs to earn $100." (Trigger: `bag >= 100`)
2. **Reputation Matters:** "Perform Content Creation to reach 10 Clout." (Trigger: `clout >= 10`)
3. **The Vibe Check:** "Enter Ghost Mode to earn 5 Aura." (Trigger: `aura >= 5`)
4. **Mental Fortitude:** "Use Rest & Recover to reach 100% Mental Health." (Trigger: `mentalHealth >= 100`)
5. **Moving Up:** "Accumulate $500 and Advance to the STREET tier." (Trigger: `currentTier === 'STREET'`)
