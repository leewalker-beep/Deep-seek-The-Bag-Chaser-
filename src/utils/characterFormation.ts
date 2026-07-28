import type { PlayerStats, WorldFeedItem } from '../types/game';
import * as Bio from '../engine/biographyEngine';

export type BehaviorCategory =
  | 'charity'
  | 'unethical'
  | 'education'
  | 'employee_support'
  | 'employee_exploit';

// Mapping choice ID -> behavior category
export const CHOICE_BEHAVIOR_MAP: Record<string, BehaviorCategory> = {
  // Education
  'executive_education': 'education',
  'accept_university_offer': 'education',

  // Employee Support / Exploit
  'fund_retreat': 'employee_support',
  'enforce_shifts': 'employee_exploit',
  'spec_inst_merger_partner_merger': 'employee_support',
  'acquire_merger': 'employee_exploit',
  'sarah_concede': 'employee_support',
  'sarah_fight': 'employee_exploit',
  'rosa_concede': 'employee_support',
  'rosa_break': 'employee_exploit',
  'purge_low_vibe': 'employee_exploit',
  'mandate_kombucha': 'employee_support',

  // Charity / Compassion
  'philanthropy_empire': 'charity', // Explicit repeatable mapping
  'settle_dispute': 'charity',
  'report_obsidian': 'charity',
  'philanthropic_legacy': 'charity',
  'syndicate_states_witness': 'charity',
  'pay_off_sk': 'charity',
  'marcus_help': 'charity',
  'pay_the_debt': 'charity',
  'maya_fund_center': 'charity',
  'maya_defend_center': 'charity',
  'maya_fundraiser_personal': 'charity',
  'maya_reform': 'charity',
  'maya_true_hero': 'charity',
  'pops_learn': 'charity',
  'rosa_help': 'charity',
  'pops_give_back': 'charity',
  'pops_legal_aid': 'charity',
  'pops_fund_hub': 'charity',
  'pops_reflect_roots': 'charity',
  'rosa_fund_campaign': 'charity',
  'rosa_policy_push': 'charity',
  'beatrice_fund': 'charity',
  'lexi_paint': 'charity',
  'lexi_fund_gallery': 'charity',
  'lexi_cultural_lead': 'charity',
  'big_g_peace_broker': 'charity',
  'big_g_hire_security': 'charity',
  'tessa_fund_leak': 'charity',
  'tessa_systemic_change': 'charity',
  'clark_tell_all': 'charity',
  'clark_publish': 'charity',
  'clark_legacy': 'charity',
  'sofia_lead': 'charity',
  'sofia_un_speech': 'charity',
  'sofia_nobel': 'charity',
  'valdez_sign': 'charity',
  'adler_implement': 'charity',
  'singh_partner': 'charity',
  'lane_meet': 'charity',
  'dynasty_embrace': 'charity',
  'dynasty_crown': 'charity',
  'partner_maximize': 'charity',
  'ipo_go_public': 'charity',
  'cartel_betray_them': 'charity',
  'digi_sync_trace_and_destroy': 'charity',
  'peace_mediate': 'charity',
  'peace_economic_pact': 'charity',
  'peace_eternal': 'charity',
  'monument_build': 'charity',
  'cab_praise_humble': 'charity',
  'protect_psyche': 'charity',

  // Unethical / Grey Area / Bribes
  'bury_evidence': 'unethical',
  'accept_obsidian': 'unethical',
  'leverage_power': 'unethical',
  'leverage_cash': 'unethical',
  'accept_architect': 'unethical',
  'obey_architect': 'unethical',
  'join_syndicate': 'unethical',
  'launder_syndicate': 'unethical',
  'syndicate_heist_join': 'unethical',
  'syndicate_kingpin': 'unethical',
  'hide_audit': 'unethical',
  'provide_keys': 'unethical',
  'marcus_refuse': 'unethical',
  'marcus_storage': 'unethical',
  'cut_ties_marcus': 'unethical',
  'look_away': 'unethical',
  'maya_ignore': 'unethical',
  'maya_betray_center': 'unethical',
  'maya_dismiss': 'unethical',
  'maya_bribe_senate': 'unethical',
  'elena_retain': 'unethical',
  'slick_accept': 'unethical',
  'clark_retain': 'unethical',
  'summers_fund_campaign': 'unethical',
  'khalid_smuggle': 'unethical',
  'dominic_partner': 'unethical',
  'dominic_fund_war': 'unethical',
  'vinnie_pay': 'unethical',
  'pops_intimidate': 'unethical',
  'pops_reflect_power': 'unethical',
  'slick_consignment_accept': 'unethical',
  'slick_heist': 'unethical',
  'miller_pay': 'unethical',
  'miller_pay_more': 'unethical',
  'miller_clean_slate': 'unethical',
  'cassie_buy_invite': 'unethical',
  'cassie_buy_shares': 'unethical',
  'cassie_take_control': 'unethical',
  'ray_ambush': 'unethical',
  'ray_launch_pmc': 'unethical',
  'dante_fix': 'unethical',
  'dante_fund_lobby': 'unethical',
  'dante_assume_immunity': 'unethical',
  'lila_back_coup': 'unethical',
  'big_g_pay': 'unethical',
  'tessa_bribe': 'unethical',
  'summers_support': 'unethical',
  'summers_buy_rights': 'unethical',
  'khalid_merge': 'unethical',
  'vane_kiss_ring': 'unethical',
  'vane_protect_legacy': 'unethical',
  'elara_hire': 'unethical',
  'elara_release_ai': 'unethical',
  'garrett_join': 'unethical',
  'garrett_corporate_state': 'unethical',
  'rosso_hire': 'unethical',
  'rosso_fund_drones': 'unethical',
  'rosso_global_trade': 'unethical',
  'reed_handle_scandal': 'unethical',
  'reed_backing_senate': 'unethical',
  'reed_senate_backing': 'unethical',
  'bennett_join': 'unethical',
  'fiona_hire': 'unethical',
  'fiona_buy_network': 'unethical',
  'fiona_control_narrative': 'unethical',
  'sterling_align': 'unethical',
  'sterling_arc_complete': 'unethical',
  'ivy_use_processor': 'unethical',
  'dominic_take_command': 'unethical',
  'xavier_thorne_contract': 'unethical',
  'thorne_contract': 'unethical',
  'thorne_fund_coup': 'unethical',
  'thorne_global_security': 'unethical',
  'olivia_activate_surveillance': 'unethical',
  'marcus_monopolize': 'unethical',
  'ashley_control_economy': 'unethical',
  'cole_fund_shadow': 'unethical',
  'cole_global_intel': 'unethical',
  'chen_monopolize': 'unethical',
  'chen_rule_retail': 'unethical',
  'side_with_summers': 'unethical',
  'ghost_join': 'unethical',
  'ghost_launch_crypto': 'unethical',
  'ghost_shadow_control': 'unethical',
  'volkov_monopoly_partner': 'unethical',
  'elena_ascend': 'unethical',
  'stone_accept': 'unethical',
  'stone_leak_dirt': 'unethical',
  'stone_use_link': 'unethical',
  'valdez_buy_keys': 'unethical',
  'valdez_exploit': 'unethical',
  'valdez_appoint': 'unethical',
  'partner_liquidate': 'unethical',
  'board_purge': 'unethical',
  'board_eternal': 'unethical',
  'ipo_acquire_rivals': 'unethical',
  'cartel_accept_pact': 'unethical',
  'cartel_install_puppet': 'unethical',
  'digi_sync_hire': 'unethical',
  'cab_friction_unify': 'unethical',
  'cab_friction_rivalry': 'unethical',
  'cab_praise_self': 'unethical',
  'monetize_psyche': 'unethical',
  'declare_war_on_fud': 'unethical',
  'cancel_delaware': 'unethical',
};

// Check and record character formation counts
export function recordCharacterChoice(
  pl: PlayerStats,
  eventId: string,
  choiceId: string
): { updatedPl: PlayerStats; news: string[] } {
  const updatedPl = { ...pl };
  const news: string[] = [];

  if (!updatedPl.narrativeFlags) {
    updatedPl.narrativeFlags = {};
  }
  if (!updatedPl.biography) {
    updatedPl.biography = [];
  }
  if (!updatedPl.recordedBioKeys) {
    updatedPl.recordedBioKeys = [];
  }

  // Determine behavior category from choice or event-choice combination
  let category: BehaviorCategory | undefined = CHOICE_BEHAVIOR_MAP[choiceId];
  if (!category && CHOICE_BEHAVIOR_MAP[`${eventId}/${choiceId}`]) {
    category = CHOICE_BEHAVIOR_MAP[`${eventId}/${choiceId}`];
  }

  if (!category) {
    return { updatedPl, news };
  }

  // Update counter flag
  const flagKey = `${category}_choices_count`;
  const count = ((updatedPl.narrativeFlags[flagKey] as number) || 0) + 1;
  updatedPl.narrativeFlags[flagKey] = count;

  // Milestone check for count threshold
  if (count === 3) {
    const milestoneNews = triggerMilestone(updatedPl, category);
    if (milestoneNews) {
      news.push(milestoneNews);
    }
  }

  return { updatedPl, news };
}

// Internal trigger milestone handler
function triggerMilestone(pl: PlayerStats, category: BehaviorCategory): string | null {
  const name = pl.name || 'the Chaser';
  let historyId = `milestone_${category}`;
  let historyTitle = '';
  let historyDesc = '';
  let bioEntry = '';
  let newspaperTitle = '';
  let newspaperSource = '';
  let newspaperBody = '';

  // Advisor queue prompt
  let advisorId = `advisor_milestone_${category}`;
  let advisorTitle = '';
  let advisorSubtitle = '';
  let advisorBullets: string[] = [];

  switch (category) {
    case 'charity': {
      historyTitle = 'The Philanthropic Journey';
      historyDesc = `Consistently prioritized compassion and community welfare over raw profit. Unlocked deep respect across the city.`;
      bioEntry = `Throughout the early years of the empire, ${name} developed a reputation for supporting local communities and choosing compassion over raw profit.`;
      newspaperTitle = 'A Leader of True Heart';
      newspaperSource = 'Metro Gazette';
      newspaperBody = 'Few business leaders have invested so consistently in charitable causes.';
      advisorTitle = '🕊️ THE PATH OF COMPASSION';
      advisorSubtitle = `"I've noticed you've consistently chosen people over profit, Chaser. Supporting local communities and choosing compassion over raw greed is a powerful, honorable route."`;
      advisorBullets = [
        'Your sustained generosity has built deep, lasting roots in the community.',
        'Local leaders and news outlets are starting to speak of your altruism.',
        'This reputation shields you from some of the coldest corporate realities.'
      ];
      break;
    }
    case 'unethical': {
      historyTitle = 'Operating in Grey Areas';
      historyDesc = `Developed a reputation for operating in legal grey areas and seizing fast-paced transactional advantages.`;
      bioEntry = `Throughout the climb to power, ${name} became widely known for operating in legal grey areas and utilizing strategic compromises to scale.`;
      newspaperTitle = 'Grey Area Operator';
      newspaperSource = 'Financial Times';
      newspaperBody = 'Whispers grow of regulatory grey areas and aggressive trading loops linked to the rising network.';
      advisorTitle = '🕶️ OPERATING IN GREY AREAS';
      advisorSubtitle = `"Discretion is key, Chaser. You've consistently operated in legal grey areas and made high-risk compromises. The world is watching."`;
      advisorBullets = [
        'You are developing a quiet reputation for prioritizing margin over morals.',
        'Rivals are noticing your flexibility and respect your pragmatism.',
        'Be careful—regulatory scrutiny or federal targets scale with visibility.'
      ];
      break;
    }
    case 'education': {
      historyTitle = 'The Patient Scholar';
      historyDesc = `Consistently invested in education and learning, establishing an elite, structured leadership pedigree.`;
      bioEntry = `Rather than chasing immediate shortcuts, ${name} demonstrated immense patience, establishing a deep academic pedigree and professional expertise.`;
      newspaperTitle = 'Pedigree Meets Power';
      newspaperSource = 'Ivy League Quarterly';
      newspaperBody = 'Pedigree meets power: Academic credentials form the bedrock of the rising commercial empire.';
      advisorTitle = '🎓 THE PATIENT SCHOLAR';
      advisorSubtitle = `"Patience and education are the ultimate forms of leverage. You have consistently invested in learning and structured expertise."`;
      advisorBullets = [
        'Credentials and elite pedigree build immense institutional credibility.',
        'You have shown long-term strategic patience on your climb.',
        'Your background is highly attractive for executive administrative roles.'
      ];
      break;
    }
    case 'employee_support': {
      historyTitle = 'The Patron Leader';
      historyDesc = `Prioritized the welfare, retention, and support of employees, creating a fierce blueprint of workforce loyalty.`;
      bioEntry = `Developed a reputation as a compassionate patron leader, consistently supporting, rewarding, and hiring staff with great care.`;
      newspaperTitle = 'A Beacon of Labor Welfare';
      newspaperSource = 'Labor Review';
      newspaperBody = 'Employee satisfaction reaches record highs at owned enterprises.';
      advisorTitle = '👥 THE PATRON LEADER';
      advisorSubtitle = `"Hiring and supporting your workforce builds fierce organizational loyalty. You have consistently prioritized staff welfare."`;
      advisorBullets = [
        'Hiring and rewarding staff creates a highly resilient operation.',
        'Operational mental health stays shielded from major fatigue.',
        'Unions and local labor bodies hail your leadership style.'
      ];
      break;
    }
    case 'employee_exploit': {
      historyTitle = 'The Ruthless Optimizer';
      historyDesc = `Enforced extreme operational efficiency and overworking strategies to extract maximum active cash flow.`;
      bioEntry = `Prioritized speed and extreme margin optimization, overworking and ignoring staff demands to maximize active income.`;
      newspaperTitle = 'Double Shifts & Extreme Margins';
      newspaperSource = 'Industrial Digest';
      newspaperBody = "How Vane's extreme workforce productivity is out-pacing the market through sheer discipline.";
      advisorTitle = '⚙️ THE RUTHLESS OPTIMIZER';
      advisorSubtitle = `"Efficiency is a cold master. You have consistently pushed your workforce to the limit to maximize active velocity."`;
      advisorBullets = [
        'Overworking and ignoring staff maximizes immediate margins.',
        'Worker friction and high operational Heat are the cost of velocity.',
        'Ensure you hold enough cash to buffer potential union protests.'
      ];
      break;
    }
  }

  // 1. Log History Event (Importance: 4)
  Bio.recordEvent(pl, historyDesc, historyId, 'LEGACY', 4, historyTitle);

  // 2. Append Biography entry
  if (!pl.biography.includes(bioEntry)) {
    pl.biography.push(bioEntry);
  }

  // 3. Post Newspaper item to World Feed
  const feedItem: WorldFeedItem = {
    id: `newspaper_${category}_${Date.now()}`,
    category: 'NEWS',
    text: `📰 NEWSPAPER REPORT (${newspaperSource}): "${newspaperBody}"`,
    source: newspaperSource,
    timestamp: Date.now(),
    month: pl.month
  };
  pl.worldFeed = [feedItem, ...(pl.worldFeed || [])].slice(0, 100);

  // 4. Queue Strategic Advisor prompt
  if (!pl.advisorQueue) {
    pl.advisorQueue = [];
  }
  const promptObj = {
    id: advisorId,
    title: advisorTitle,
    subtitle: advisorSubtitle,
    bullets: advisorBullets,
    ctaLabel: 'Continue'
  };
  pl.advisorQueue.push(promptObj);

  return `🏆 CHARACTER EVOLVED: You achieved the milestone: "${historyTitle}"!`;
}
