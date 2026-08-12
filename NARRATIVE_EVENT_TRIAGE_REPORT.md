# NARRATIVE EVENT TRIAGE REPORT: SINGLE-CHOICE COMMITMENTS

## 1. Executive Summary

This comprehensive triage report evaluates all **425 total narrative events** across the game's six tier JSON files to identify and classify every single-choice event. It establishes a clear line between **costly/consequence-carrying commitments** and **harmless story-beat milestones**.

### Key Findings
- **Total Unique Single-Choice Events**: **147** unique events out of 425 total events (approx. 35%). The rest of the 425 are programmatically duplicated across multiple files to allow cohesive storylines to span progression tiers.
- **Category A: Costly/Consequence-Carrying Commitments**: **99** unique events. These events enforce a direct, non-negotiable negative toll or high-fidelity lifestyle commitment. This includes spending cash, incurring recurring passive cash upkeep/drain, accumulating police Heat, receiving Aura or Clout penalties, or setting negative relationship/narrative flags (such as the liquidation of a partner or betraying a faction).
- **Category B: Harmless / Pure Story Beats**: **48** unique events. These represent positive career milestones, legendary tier endings, or faction alliances that yield only positive stat boosts (Aura, Clout, Cash Windfalls) and narrative progression, with zero negative trade-offs or penalties. These are completely fine as single-choice "Continue" beats.
- **Early Game Safety**: There are **exactly 0 single-choice events in the MUD tier**. The MUD tier is completely free of forced choices, ensuring players have absolute agency in the early hours.

---

## 2. UI Verification Analysis (Modal Bypass Check)

We conducted a deep-dive code verification of `src/components/NarrativeEventModal.tsx` and its underlying presentation component `src/components/ui/CinematicModal.tsx` to determine if players can bypass or close these single-choice screens without executing the action.

### UI Verification Matrix

| Vector | Is dismissible? | Code-Level Verification Details |
| :--- | :--- | :--- |
| **Backdrop Overlay Click** | **No** | `CinematicModal` binds backdrop click to its `onClose` prop. However, `NarrativeEventModal` invokes `CinematicModal` with `isOpen={true}` and does **not** pass an `onClose` callback, making backdrop clicks a complete no-op. |
| **Escape (Esc) Key** | **No** | Neither `NarrativeEventModal.tsx` nor `CinematicModal.tsx` registers any keydown/keyup event listener for keyboard interaction. Escape has no effect. |
| **Close ("X") Button** | **No** | There are no close icons, dismissal buttons, or footer cancel widgets rendered inside the modal structure. |
| **Implicit Bypasses** | **No** | The player is hard-locked inside the modal overlay. `pl.activeNarrative` is persisted in the core game store, and the modal will continue to render on top of the entire application until `resolveNarrativeEvent(choice.id)` is successfully invoked by clicking the single choice button. |

> **Triage Urgency Assessment**: **CRITICAL**. Because the interface offers no implicit or explicit escape routes, players are completely locked into taking the single option. If they do not have enough cash or cannot afford the stat hits, they are blocked or forced to absorb devastating penalties. This report is vital for design decision-making before crafting decline choices.

---

## 3. Directory of Costly/Consequence-Carrying Events (99 Events)

The following is the full directory of the 99 costly single-choice events, structured by their progression tiers. For each event, we outline the ID, Title, Character Source (where applicable), exact costs, and the flags set.

### CORPORATE TIER (21 Costly Events)

| Event ID | Title | Source NPC | Non-Negotiable Cost / Consequence | Key Flags Set |
| :--- | :--- | :--- | :--- | :--- |
| `cartel_1_the_meeting` | **The Southern Shadow** | System | Heat: +60, Aura: -300 | `cartel_member: True`<br>`rel_cartel: 100` |
| `char_big_g_3_retirement` | **The Neighborhood Elder** | System | Passive Cash/mo: -5,000 | `big_g_arc_complete: legit` |
| `char_cassie_2_insider` | **The Insider Tip** | Cassandra  | Cash: -1,000,000, Heat: +20 | `cassie_shares_bought: True` |
| `char_chen_1_market` | **Chen's Market Dominance** | Lawrence Chen | Cash: -1,000,000, Aura: -500 | `chen_monopoly: True`<br>`rel_chen: 100` |
| `char_clark_2_investigation` | **The Vane Connection** | Alistair Clark | Heat: +50, Clout: -200 | `clark_vane_exposed: True` |
| `char_dante_2_lobby` | **The Legislative Fix** | Dante Russo | Cash: -1,000,000, Aura: -200 | `dante_lobby_active: True` |
| `char_elara_1_sabotage` | **Digital Warfare** | Elara Moon | Cash: -100,000, Heat: +40 | `elara_active: True`<br>`rel_elara: 80` |
| `char_khalid_1_export` | **The Global Pipeline** | Khalid Al-Mansour | Cash: -100,000 | `khalid_partner: True`<br>`rel_khalid: 100` |
| `char_lexi_2_exhibition` | **The Underground Gallery** | Lexi  | Cash: -100,000, Heat: +20 | `lexi_gallery_funded: True` |
| `char_lila_1_invest` | **The Elite Opportunity** | Lila Hart | Cash: -1,000,000 | `lila_investor: True`<br>`rel_lila: 80` |
| `char_naomi_1_pr` | **The Image Maker** | System | Cash: -100,000 | `naomi_active: True`<br>`rel_naomi: 90` |
| `char_pops_3_expansion` | **Pops' Legacy Hub** | Arthur  | Cash: -250,000 | `pops_hub_active: True` |
| `char_ray_2_intelligence` | **The Sarge's Intel** | Raymond  | Cash: -100,000, Heat: +50 | `ray_kane_crushed: True` |
| `char_reed_1_campaign` | **The Political Engine** | System | Cash: -250,000 | `reed_ally: True`<br>`rel_reed: 100` |
| `char_rosa_2_political` | **Rosa's Run** | Rosa Mendez | Cash: -100,000 | `rosa_campaign_funded: True` |
| `char_slick_3_retirement` | **Slick's Last Score** | Terrence  | Cash: -500,000 | `slick_arc_complete: legit` |
| `char_summers_1_bill` | **The Zoning Bill** | Brooke Summers | Aura: -150 | `summers_bill_passed: True`<br>`rel_summers: 80` |
| `char_tessa_2_leak` | **The Panama Papers v2** | Tessa Brooks | Cash: -500,000, Heat: +40 | `tessa_vane_exposed: True` |
| `char_valdez_1_espionage` | **The Corporate Ghost** | Secretary Elena Valdez | Cash: -500,000, Heat: +15 | `valdez_spy: True`<br>`rel_valdez: 100` |
| `digi_sync_2_the_extortion` | **The Table Turns** | System | Cash: -500,000, Heat: +40 | `digi_sync_arc_complete: neutralized` |
| `partner_1_the_betrayal` | **Et Tu, Brute?** | System | Aura: -300, Negative Relationship Flag | `partner_status: liquidated` |

### ELITE TIER (49 Costly Events)

| Event ID | Title | Source NPC | Non-Negotiable Cost / Consequence | Key Flags Set |
| :--- | :--- | :--- | :--- | :--- |
| `board_1_the_coup` | **The Midnight Coup** | System | Aura: -500 | `board_status: purged` |
| `cartel_2_the_crackdown` | **The Federal Heat** | System | Negative Relationship Flag | `cartel_arc_complete: betrayed`<br>`rel_cartel: -500` |
| `char_ashley_1_innovation` | **Ashley's AI** | Ashley Weaver | Cash: -2,000,000 | `ashley_ai_active: True`<br>`rel_ashley: 100` |
| `char_ashley_2_quantum` | **Quantum Ashley** | Ashley Weaver | Cash: -50,000,000 | `ashley_quantum_active: True` |
| `char_bennett_1_trust` | **The Bennett Trust** | System | Cash: -1,000,000 | `bennett_managed: True`<br>`rel_bennett: 100` |
| `char_bennett_2_foundation` | **The Bennett Foundation** | System | Cash: -20,000,000 | `bennett_foundation_active: True` |
| `char_chen_2_franchise` | **Global Franchising** | Lawrence Chen | Cash: -10,000,000 | `chen_national_active: True` |
| `char_cole_1_security` | **Cole's Elite Guard** | Silas Cole | Cash: -1,000,000 | `cole_guard_active: True`<br>`rel_cole: 100` |
| `char_cole_2_black_ops` | **Shadow Operations** | Silas Cole | Cash: -10,000,000, Heat: +50 | `cole_shadow_active: True` |
| `char_dominic_1_muscle` | **The Russo Reach** | System | Cash: -200,000, Heat: +50 | `russo_partner: True`<br>`rel_dominic: 100` |
| `char_dominic_2_war` | **The Family War** | System | Cash: -5,000,000, Heat: +80 | `dominic_war_won: True` |
| `char_dubois_2_museum` | **The Dubois Museum** | System | Cash: -20,000,000 | `dubois_museum_active: True` |
| `char_elara_2_counter_hack` | **The Digital Counter-Strike** | Elara Moon | Heat: +30 | `elara_defended: True` |
| `char_elara_3_sentience` | **The Ghost in the Machine** | Elara Moon | Aura: -1000 | `elara_arc_complete: transcendent` |
| `char_fiona_1_propaganda` | **The Glass Ceiling** | System | Cash: -200,000, Aura: -200 | `fiona_active: True`<br>`rel_fiona: 80` |
| `char_fiona_2_network` | **The Glass Network** | System | Cash: -50,000,000, Aura: -1000 | `fiona_network_active: True` |
| `char_garrett_1_hostile` | **The Hostile Takeover** | Garrett Thorne | Cash: -2,000,000 | `garrett_ally: True`<br>`rel_garrett: 90` |
| `char_ghost_1_darknet` | **The Ghost Network** | Ghost | Cash: -500,000 | `ghost_network_active: True`<br>`rel_ghost: 100` |
| `char_ghost_2_crypto` | **Ghost Currency** | Ghost | Cash: -5,000,000, Heat: +40 | `ghost_crypto_active: True` |
| `char_ivy_1_quantum` | **The Quantum Leap** | System | Cash: -5,000,000 | `ivy_research_active: True`<br>`rel_ivy: 100` |
| `char_khalid_2_embargo` | **The Trade Embargo** | Khalid Al-Mansour | Cash: -1,000,000, Heat: +60 | `khalid_smuggling_active: True` |
| `char_khalid_3_monopoly` | **The Global Logistics King** | Khalid Al-Mansour | Cash: -20,000,000 | `khalid_arc_complete: king` |
| `char_leo_1_luxury` | **The Thorne Lifestyle** | System | Cash: -50,000,000 | `leo_hq_built: True`<br>`rel_leo: 100` |
| `char_lexi_3_renaissance` | **The Urban Renaissance** | Lexi  | Cash: -1,000,000 | `lexi_arc_complete: visionary` |
| `char_lila_2_takeover` | **The Vance Boardroom** | Lila Hart | Aura: -500 | `lila_arc_complete: partner` |
| `char_marcus_1_expansion` | **Marcus' Global Vision** | Marcus Miller | Cash: -5,000,000 | `marcus_global: True`<br>`rel_marcus: 100` |
| `char_marcus_2_logistics` | **The Global Hub** | Marcus Miller | Cash: -20,000,000 | `marcus_hub_active: True` |
| `char_miller_3_commissioner` | **The Commissioner** | System | Cash: -5,000,000 | `miller_arc_complete: clean_slate` |
| `char_olivia_1_network` | **The West Network** | System | Cash: -2,000,000 | `olivia_partner: True`<br>`rel_olivia: 100` |
| `char_ray_3_pmc` | **The Private Army** | Raymond  | Cash: -5,000,000 | `ray_arc_complete: pmc` |
| `char_reed_2_scandal` | **The Mayor's Secret** | System | Cash: -500,000, Heat: +40, Aura: -300 | `reed_scandal_managed: True` |
| `char_reed_3_senator` | **Senator Reed** | System | Cash: -5,000,000 | `reed_arc_complete: senator` |
| `char_rosso_1_shipping` | **The Rosso Route** | System | Cash: -500,000 | `rosso_partner: True`<br>`rel_rosso: 100` |
| `char_rosso_2_piracy` | **The High Seas Crisis** | System | Cash: -2,000,000, Heat: +30 | `rosso_defended: True` |
| `char_sarah_1_policy` | **The Sarah Policy** | System | Cash: -20,000,000 | `sarah_policy_active: True`<br>`rel_sarah: 100` |
| `char_sofia_1_charity` | **The Sofia Foundation** | System | Cash: -10,000,000 | `sofia_charity_active: True`<br>`rel_sofia: 100` |
| `char_sterling_1_legacy` | **The Vane Dynasty** | System | Aura: -300 | `sterling_ally: True`<br>`rel_sterling: 100` |
| `char_stone_1_kingmaker` | **Marcus Stone: The Kingmaker** | Marcus Stone | Heat: +50, Aura: -500 | `kingmaker_active: True`<br>`rel_stone: 100` |
| `char_stone_2_the_leak` | **Opposition Research** | Marcus Stone | Heat: +30, Aura: -500 | `stone_strategy: dirty`<br>`rel_stone: 100` |
| `char_summers_2_redevelopment` | **The Waterfront Project** | Brooke Summers | Cash: -5,000,000 | `summers_waterfront_active: True` |
| `char_summers_3_governor` | **Governor Summers** | Brooke Summers | Cash: -10,000,000, Aura: -1000 | `summers_arc_complete: kingmaker` |
| `char_thorne_1_military` | **The Thorne Defense** | System | Cash: -10,000,000 | `thorne_ally: True`<br>`rel_thorne: 100` |
| `char_thorne_2_coups` | **The Precision Coup** | System | Cash: -50,000,000, Aura: -2000 | `thorne_regime_change: True` |
| `char_twitch_3_mainframe_exploit` | **The Central Mainframe** | Kevin  | Heat: +80 | `twitch_arc_complete: hacked` |
| `char_valdez_2_intel` | **The Deep Dive** | Secretary Elena Valdez | Heat: +100, Aura: -500 | `valdez_heist_complete: True` |
| `char_vane_1_summons` | **The Vane Summit** | System | Aura: -200 | `vane_ally: True`<br>`rel_vane: 100` |
| `char_volkov_1_resource` | **The Volkov Resource** | Mikhail Volkov | Cash: -100,000,000 | `volkov_monopoly: True`<br>`rel_volkov: 100` |
| `dynasty_1_the_heir` | **The Unwanted Legacy** | System | Cash: -1,000,000 | `dynasty_status: heir_active` |
| `dynasty_2_training` | **The Heir's Ascent** | System | Cash: -100,000,000 | `dynasty_status: heir_proven` |

### PRESIDENCY TIER (13 Costly Events)

| Event ID | Title | Source NPC | Non-Negotiable Cost / Consequence | Key Flags Set |
| :--- | :--- | :--- | :--- | :--- |
| `board_2_consolidation` | **Absolute Power** | System | Cash: -500,000,000 | `board_status: absolute` |
| `char_elena_2_expansion` | **Dynamic Expansion** | System | Cash: -500,000,000 | `elena_expansion_active: True` |
| `char_fiona_3_truth` | **The Architect of Truth** | System | Aura: -2000 | `fiona_arc_complete: propagandist` |
| `char_garrett_3_world_order` | **The New World Order** | Garrett Thorne | Aura: -5000 | `garrett_arc_complete: sovereign` |
| `char_ivy_2_breakthrough` | **The Quantum Breakthrough** | System | Heat: +100 | `ivy_quantum_status: active` |
| `char_leo_2_lifestyle` | **Thorne Living** | System | Cash: -500,000,000 | `leo_city_active: True` |
| `char_olivia_2_surveillance` | **The Panopticon** | System | Aura: -1000 | `olivia_panopticon_active: True` |
| `char_sarah_2_global_policy` | **The Global UBI** | System | Cash: -100,000,000 | `sarah_global_ubi_active: True` |
| `char_sterling_2_innovation` | **Vane X** | System | Cash: -100,000,000 | `sterling_x_active: True` |
| `char_volkov_3_dyson` | **The Dyson Sphere** | Mikhail Volkov | Cash: -1,000,000,000 | `volkov_arc_complete: stellar` |
| `monument_1_the_architect` | **The Eternal Vane** | System | Cash: -50,000,000 | `monument_status: built` |
| `monument_2_expansion` | **The Living City** | System | Cash: -500,000,000 | `monument_status: metropolis` |
| `peace_1_the_crisis` | **The Brink of War** | System | Cash: -5,000,000 | `peace_status: hero`<br>`rel_world: 150` |

### STARTUP TIER (11 Costly Events)

| Event ID | Title | Source NPC | Non-Negotiable Cost / Consequence | Key Flags Set |
| :--- | :--- | :--- | :--- | :--- |
| `char_big_g_2_truce` | **The Neighborhood Truce** | System | Heat: +10 | `big_g_peace_broker: True` |
| `char_cassie_1_network` | **The High Table** | Cassandra  | Cash: -50,000 | `cassie_intro: True`<br>`rel_cassie: 80` |
| `char_dante_1_fixer` | **The Fixer's Fee** | Dante Russo | Cash: -30,000 | `dante_hired: True`<br>`rel_dante: 70` |
| `char_jdog_2_label` | **Mud Records** | Jermaine  | Cash: -200,000 | `jdog_label_active: True` |
| `char_lexi_1_mural` | **Colors of the Block** | Lexi  | Cash: -5,000 | `lexi_mural_done: True`<br>`rel_lexi: 100` |
| `char_miller_2_promotion` | **Lieutenant Miller** | System | Passive Cash/mo: -10,000 | `miller_status: high_level_protection` |
| `char_ray_1_defense` | **Tactical Edge** | Raymond  | Passive Cash/mo: -5,000 | `ray_security_active: True`<br>`rel_ray: 100` |
| `char_slick_2_warehouse` | **Slick's Secret Warehouse** | Terrence  | Heat: +40 | `slick_heist_done: True` |
| `char_tessa_1_audit` | **The IRS Audit** | Tessa Brooks | Cash: -25,000 | `tessa_consultant: True`<br>`rel_tessa: 70` |
| `char_twitch_2_surveillance` | **Eye in the Sky** | Kevin  | Cash: -50,000 | `twitch_eye_active: True` |
| `digi_sync_1_the_offer` | **The Silicon Underground** | System | Cash: -50,000, Heat: +20 | `digi_sync_active: True`<br>`rel_digi: 80` |

### STREET TIER (5 Costly Events)

| Event ID | Title | Source NPC | Non-Negotiable Cost / Consequence | Key Flags Set |
| :--- | :--- | :--- | :--- | :--- |
| `char_big_g_1_territory` | **Territory Tax** | System | Passive Cash/mo: -1,000 | `big_g_paid: True`<br>`rel_big_g: 50` |
| `char_jdog_1_studio` | **The Next Sound** | Jermaine  | Cash: -20,000 | `jdog_studio_active: True`<br>`rel_jdog: 90` |
| `char_miller_1_payoff` | **The Blue Toll** | System | Passive Cash/mo: -2,000 | `miller_paid: True`<br>`rel_miller: 60` |
| `char_slick_1_consignment` | **Slick's Side Hustle** | Terrence  | Heat: +25 | `slick_partner: True`<br>`rel_slick: 70` |
| `char_twitch_1_data_leak` | **The Twitch Signal** | Kevin  | Cash: -5,000, Heat: +10 | `twitch_partner: True`<br>`rel_twitch: 80` |

---

## 4. Directory of Harmless / Pure Story Beats (48 Events)

These 48 events are completely safe as single-choice "Continue" beats because they contain only beneficial consequences (positive aura/clout boosts, cash awards, positive passives) and represent milestone narrative outcomes or game endings. They do **not** require a decline choice.

| Event ID | Title | Non-Negotiable Benefit / Story Outcome | Key Flags Set |
| :--- | :--- | :--- | :--- |
| `board_3_the_monolith` | **The Monolith** | Clout: +50,000 | `board_arc_complete: monolith` |
| `cartel_3_new_order` | **The Power Vacuum** | Passive: +50,000/mo, Clout: +1,000 | `cartel_controlled: True` |
| `char_ashley_3_oracle` | **The Market Oracle** | Clout: +50,000, Aura: +5,000 | `ashley_arc_complete: oracle` |
| `char_bennett_3_global_philanthropist` | **The Global Philanthropist** | Clout: +5,000, Aura: +10,000 | `bennett_arc_complete: philanthropist` |
| `char_cassie_3_acquisition` | **The Final Acquisition** | Passive: +50,000/mo, Clout: +1,000 | `cassie_arc_complete: monopoly` |
| `char_chen_3_retail_god` | **Retail Empire** | Passive: +250,000/mo, Clout: +5,000 | `chen_arc_complete: magnate` |
| `char_clark_1_exclusive` | **The Front Page** | Clout: +100, Aura: +200 | `clark_story: truth`<br>`rel_clark: 90` |
| `char_clark_3_pulitzer` | **The Pulitzer** | Clout: +1,000, Aura: +2,000 | `clark_arc_complete: hero` |
| `char_cole_3_intelligence` | **The Ghost Agency** | Clout: +20,000, Heat: -500 | `cole_arc_complete: ghost` |
| `char_dante_3_justice` | **The Hand of Justice** | Clout: +2,000, Heat: -1,000 | `dante_arc_complete: untouchable` |
| `char_dominic_3_consigliere` | **The Consigliere** | Clout: +5,000, Heat: -100 | `dominic_arc_complete: godfather` |
| `char_dubois_1_culture` | **The Dubois Circle** | Clout: +500, Aura: +1,000 | `dubois_icon: True`<br>`rel_camille: 100` |
| `char_dubois_3_nobel` | **The Nobel Peace Prize** | Clout: +5,000, Aura: +10,000 | `dubois_arc_complete: idealist` |
| `char_elena_1_legacy` | **The Vance Legacy** | Clout: +10,000, Aura: +5,000 | `vance_union: True`<br>`rel_elena: 150` |
| `char_elena_3_world_rule` | **The Uncontested Rule** | Clout: +100,000, Aura: +50,000 | `elena_arc_complete: emperor` |
| `char_garrett_2_merger` | **The Grand Merger** | Passive: +100,000/mo, Clout: +2,000 | `garrett_merged: True` |
| `char_ghost_3_shadow_bank` | **The Shadow Bank** | Passive: +200,000/mo, Clout: +20,000 | `ghost_arc_complete: overlord` |
| `char_ivy_3_singularity` | **The Technological Singularity** | Clout: +100,000, Aura: +100,000 | `ivy_arc_complete: godhead` |
| `char_jdog_3_grammy` | **The Global Icon** | Clout: +500, Aura: +1,000 | `jdog_arc_complete: legendary` |
| `char_leo_3_immortality` | **The Immortal Architect** | Aura: +100,000 | `leo_arc_complete: legend` |
| `char_lila_3_legacy` | **The New Vance** | Passive: +100,000/mo, Aura: +1,000 | `lila_board_member: True` |
| `char_marcus_3_dominance` | **Supply Chain King** | Passive: +500,000/mo, Clout: +10,000 | `marcus_arc_complete: tycoon` |
| `char_naomi_2_scandal` | **Scandal Management** | Clout: +200, Aura: +500 | `naomi_brand_status: authentic` |
| `char_naomi_3_myth` | **The Living Myth** | Clout: +2,000, Aura: +5,000 | `naomi_arc_complete: iconic` |
| `char_olivia_3_global_mind` | **The Global Mind** | Clout: +20,000, Aura: +20,000 | `olivia_arc_complete: steward` |
| `char_rosa_3_victory` | **The Council Member** | Clout: +300, Aura: +500 | `rosa_arc_complete: reformed` |
| `char_rosso_3_admiral` | **The Admiral of the Oceans** | Passive: +1,000,000/mo, Clout: +5,000 | `rosso_arc_complete: admiral` |
| `char_sarah_3_utopia` | **Architect of Utopia** | Aura: +100,000 | `sarah_arc_complete: savior` |
| `char_sofia_2_un` | **The Diplomat** | Clout: +2,000, Aura: +10,000 | `sofia_un_active: True` |
| `char_sofia_3_peace` | **World Peace Architect** | Clout: +10,000, Aura: +50,000 | `sofia_arc_complete: saint` |
| `char_sterling_3_new_world` | **The New World Order** | Clout: +50,000, Aura: +10,000 | `sterling_arc_complete: overlord` |
| `char_stone_3_the_debate` | **The Staged Debate** | Clout: +500, Aura: +200 | `debate_result: perfect` |
| `char_tessa_3_chief_auditor` | **The Chief Auditor** | Clout: +1,000, Aura: +2,000 | `tessa_arc_complete: reformer` |
| `char_thorne_3_world_policing` | **World Policing** | Clout: +20,000, Heat: -500 | `thorne_arc_complete: peacekeeper` |
| `char_valdez_3_shadow` | **The Shadow Advisor** | Clout: +5,000, Heat: -200 | `valdez_arc_complete: ghost` |
| `char_vane_2_heir_crisis` | **The Vane Succession** | Clout: +1,000, Aura: +500 | `vane_legacy_protected: True` |
| `char_vane_3_new_era` | **The Passing of the Torch** | Passive: +500,000/mo, Clout: +5,000 | `vane_arc_complete: successor` |
| `char_volkov_2_fusion` | **The Fusion Breakthrough** | Passive: +5,000,000/mo, Clout: +10,000, Aura: +5,000 | `volkov_fusion_active: True` |
| `digi_sync_3_cyber_shield` | **The Cyber Shield** | Clout: +1,000, Heat: -50 | `digi_shield_active: True` |
| `dynasty_3_succession` | **The Passing of the Crown** | Clout: +20,000, Aura: +10,000 | `dynasty_arc_complete: eternal` |
| `ipo_1_the_valuation` | **The Trillion-Dollar Question** | Cash: +10,000,000, Clout: +1,000, Aura: +500 | `ipo_status: public` |
| `ipo_2_market_dom` | **Market Dominance** | Cash: +100,000,000, Clout: +10,000 | `ipo_status: dominant` |
| `ipo_3_too_big` | **Too Big to Fail** | Clout: +100,000 | `ipo_arc_complete: pillar` |
| `monument_3_immortality` | **Immortal Legacy** | Clout: +100,000, Aura: +100,000 | `monument_arc_complete: immortal` |
| `partner_2_the_replacement` | **The New Blood** | Passive: +25,000/mo, Clout: +500 | `partner_status: shark_active` |
| `partner_3_synergy` | **The Perfect Synergy** | Passive: +100,000/mo, Clout: +5,000 | `partner_arc_complete: perfect` |
| `peace_2_stabilization` | **Global Stabilization** | Passive: +100,000/mo, Clout: +2,000 | `peace_status: architect` |
| `peace_3_global_order` | **The New Global Order** | Clout: +100,000, Aura: +100,000 | `peace_arc_complete: governor` |