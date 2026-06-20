# Bag Chaser Minigame Audit Report

## MUD Tier
- **Delivery Gigs (TrafficDodge): 4/10**
  - **What works:** Basic movement registers correctly.
  - **Needs fixing:** Layout is tiny and stuck in bottom-left. Needs full-screen jump mechanics as noted.
- **Street Eats: 6/10**
  - **What works:** Icon interaction is clear and responsive.
  - **Needs fixing:** Complete lack of visual variety. Adding level-specific menu items (tacos -> combo plates) is necessary.
- **Manual Labor (LaborBuild): 5/10**
  - **What works:** Simple tap-to-build mechanic is understandable.
  - **Needs fixing:** Zero difficulty scaling. Must increase tap speed requirements (3 taps/sec -> 7 taps/sec) for L1-L5.
- **Ghost Mode: 7/10**
  - **What works:** Strongest MUD game; scaling logic for speed is already implemented and feels good.
  - **Needs fixing:** Visual feedback could be crunchier.
- **Scrap Metal (MagneticSweep): 5/10**
  - **What works:** The magnet theme fits the tier.
  - **Needs fixing:** Interaction feels cosmetic because the outcome is predetermined. Needs active "catch" mechanics.
- **Plasma Donation: 6/10**
  - **What works:** The timing bar is clear.
  - **Needs fixing:** Lacks speed scaling. Needle/target should move faster at higher levels.

## STREET Tier
- **Content Creation: 5/10**
  - **What works:** Topic variety is good.
  - **Needs fixing:** Swipe up/down is insensitive. Card must slide fully off-screen for clear registration.
- **Podcast (TapRhythm): 5/10**
  - **What works:** Rhythm matching works technically.
  - **Needs fixing:** Boring at high levels. Needs "drops" and tempo increases (L1: 0 drops -> L5: 3 drops + fast).
- **Dropshipping (SwipeAuthentic): 6/10**
  - **What works:** Tinder-style swipe is intuitive for mobile.
  - **Needs fixing:** Swipe threshold is too high (>50% move required). Needs smoother registration and faster timers.
- **Vintage Reselling (PinchToInspect): 5/10**
  - **What works:** Unique use of pinch gesture.
  - **Needs fixing:** Zero difficulty scaling. Higher levels should require more precise or faster inspections.
- **Tech Flip (TechRepairDrag): 6/10**
  - **What works:** Drag-and-drop mechanics are responsive.
  - **Needs fixing:** No scaling. Higher levels should have more components or tighter time limits.
- **Music Production (BeatSequence): 5/10**
  - **What works:** Simon-says mechanic is functional.
  - **Needs fixing:** Sequence doesn't grow as requested. Needs to scale from 4 to 12 notes and repeat for learning.

## STARTUP Tier
- **Streetwear (StreetwearMatch): 8/10**
  - **What works:** Best in tier. Scaling (more parts to match) is perfectly implemented.
  - **Needs fixing:** Some UI overlap on small screens.
- **SMM Agency (HashtagTap): 6/10**
  - **What works:** Fast-paced reaction gameplay.
  - **Needs fixing:** Lacks difficulty scaling. Needs higher hashtag frequency and faster decay per level.
- **Runner Fleet (RunnerRoute): 6/10**
  - **What works:** Lane-switching mechanics are responsive.
  - **Needs fixing:** Zero difficulty scaling. Needs more obstacles and higher speed for city dispatch/logistics hub.
- **Meme Coins (MemeCoinPump): 7/10**
  - **What works:** Fun "shake" mechanic for pumping.
  - **Needs fixing:** "Dump" button needs to be more prominent. Needs higher volatility scaling per level.
- **SaaS MVP (DragScale): 4/10**
  - **What works:** Drag-to-scale infrastructure is a good metaphor.
  - **Needs fixing:** Interaction is too brief and lacks depth. Needs more variables to balance.
- **Agency Scale (TapAssign): 5/10**
  - **What works:** Clear "ticket" system metaphor.
  - **Needs fixing:** Scaling is missing. Higher levels should have significantly more staff/clients to manage.
- **E-com Brand (EcomCatch): 5/10**
  - **What works:** Classic catch-mechanic is easy to understand.
  - **Needs fixing:** Scaling is missing. Needs faster item speed and frequency.

## CORPORATE Tier
- **Music Festival (SlotMachine): 6/10**
  - **What works:** High-stakes casino feel fits the tier.
  - **Needs fixing:** Almost entirely luck-based. Needs a "skill stop" or additional reels for higher levels.
- **Global Franchise (Roulette): 7/10**
  - **What works:** Functional casino game.
  - **Needs fixing:** No scaling mechanics.
- **Data Analytics (HigherLower): 6/10**
  - **What works:** Simple, addicting card mechanic.
  - **Needs fixing:** Streak requirements don't increase per level.
- **Crypto Mining (DiceCraps): 7/10**
  - **What works:** Detailed craps implementation.
  - **Needs fixing:** No scaling.
- **VA Agency (Blackjack): 7/10**
  - **What works:** Solid blackjack implementation.
  - **Needs fixing:** No scaling.
- **Lobbying (HigherLower) / Disaster Recovery (Roulette): 6/10**
  - **What works:** Reusing proven mechanics works for these branches.
  - **Needs fixing:** Lack of scaling inherited from base components.

## ELITE Tier
- **Real Estate (BoardroomBattle): 8/10**
  - **What works:** The strategic panel-driven approach feels appropriate for ELITE.
  - **Needs fixing:** Bidding war mechanics (BoardroomBattle) could be more interactive.
- **Venture Capital: 8/10**
  - **What works:** Choice-based capital deployment is very engaging.
  - **Needs fixing:** BalanceScale component (if reachable) lacks difficulty scaling.
- **Hedge Fund (ReactionGrid): 6/10**
  - **What works:** Nodes-based reaction gameplay.
  - **Needs fixing:** Too easy for ELITE tier. Needs significantly more nodes and faster sequences.
- **Private Equity (BoardroomBattle): 7/10**
  - **What works:** High-stakes bidding war feel.
  - **Needs fixing:** Similar to Real Estate, the "BoardroomBattle" mechanic needs more depth than just clicking "BID".

## MOGUL Tier
- **Film Studio / Space Investment / Philanthropy: 8/10**
  - **What works:** Primarily panel-driven strategy. The "high stakes" decision making works well for this tier.
  - **Needs fixing:** The "ShakeToInfluence" or "MarketPredictor" fallbacks are a bit basic.
- **Fight Promoter (MarketPredictor): 6/10**
  - **What works:** Bidding against rivals creates tension.
  - **Needs fixing:** The "MarketPredictor" mechanic is identical across levels; needs more volatility and faster rival counter-bids.
- **Media Empire (TapApprove): 6/10**
  - **What works:** Binary approval flow is fast.
  - **Needs fixing:** Lacks scaling. Needs faster item flow and more "tricky" items.
- **Luxury Conglomerate (DragMerge): 6/10**
  - **What works:** 2048-style merge mechanic.
  - **Needs fixing:** Too few items to merge. Scaling should add more item types and smaller grids.

## PRESIDENT Tier
- **Campaign Trail (PresidentialCampaign): 7/10**
  - **What works:** The "Shake for Hype" mechanic fits the campaign trail.
- **Executive Orders: 8/10**
  - **What works:** Excellent data-driven impact system. Mastery bonuses (from lower-tier hustles) add great discovery depth.
- **Cabinet: 8/10**
  - **What works:** Loyalty system and starting bonuses for "crushed rivals" create strong continuity with the earlier game.
- **Crisis Events: 7/10**
  - **What works:** High-pressure situations that drain the Federal Treasury.
  - **Needs fixing:** Resolution is currently just a button click/resource spend; could use "Risk Assessment" minigame more consistently.
- **Presidential Actions (State of the Union, Debate Prep, etc.): 6/10**
  - **What works:** Excellent reuse of existing minigame mechanics for thematic actions.
  - **Needs fixing:** Inherit all the scaling issues of the base components. Timing windows (HoldHype) and tempos (TapRhythm) must scale with term progress.
- **Dashboard & Systems: 9/10**
  - **What works:** The Dual-budget system, Cabinet loyalty, and Macro indicators create a deep simulation.

## Overall Finding:
**~80% of minigames lack any form of difficulty scaling across their levels.** Most mechanics are functional but static, making level 5 feel identical to level 1.
