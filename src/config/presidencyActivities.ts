import type { PresidentialActivity } from '../types/game';

export const PRESIDENTIAL_ACTIVITIES: PresidentialActivity[] = [
  {
    id: 'budget_negotiations',
    title: 'Budget Negotiations',
    description: 'The fiscal year is ending. Negotiate the national budget with Congress.',
    category: 'BUDGET',
    icon: '💰',
    minigameType: 'RISK',
    choices: [
      {
        id: 'austerity',
        label: 'Austerity Measures',
        description: 'Cut spending aggressively to reduce national debt.',
        impact: {
          approval: -5,
          gdp: -2,
          inflation: -1,
          debt: -5,
          congressSupport: 10,
          federalBudget: 50000000
        },
        cabinetBonus: {
          roleId: 'treasury',
          multiplier: 1.5,
          message: 'Treasury Secretary streamlines the cuts.'
        }
      },
      {
        id: 'stimulus',
        label: 'Growth Stimulus',
        description: 'Increase spending on infrastructure and technology.',
        impact: {
          approval: 8,
          gdp: 5,
          inflation: 2,
          debt: 3,
          congressSupport: -5,
          federalBudget: -30000000
        },
        cabinetBonus: {
          roleId: 'treasury',
          multiplier: 1.2,
          message: 'Treasury identifies high-growth sectors.'
        }
      },
      {
        id: 'compromise',
        label: 'Bipartisan Compromise',
        description: 'A balanced approach to satisfy both sides.',
        impact: {
          approval: 2,
          gdp: 1,
          inflation: 0.5,
          debt: 0,
          congressSupport: 5,
          federalBudget: 10000000
        }
      }
    ]
  },
  {
    id: 'international_summit',
    title: 'International Summit',
    description: 'Meet with world leaders to discuss global trade and security.',
    category: 'DIPLOMACY',
    icon: '🌐',
    minigameType: 'PATTERN',
    choices: [
      {
        id: 'global_leader',
        label: 'Assert Leadership',
        description: 'Demand favorable terms for the nation.',
        impact: {
          approval: 5,
          foreignRelations: -5,
          worldPeace: -2,
          gdp: 2,
          aura: 10
        },
        requirement: {
          stat: { type: 'aura', value: 100 }
        }
      },
      {
        id: 'cooperation',
        label: 'Seek Cooperation',
        description: 'Build lasting alliances through mutual benefit.',
        impact: {
          approval: 2,
          foreignRelations: 15,
          worldPeace: 10,
          gdp: 1,
          clout: 10
        },
        cabinetBonus: {
          roleId: 'state',
          multiplier: 1.4,
          message: 'Secretary of State smooths over tensions.'
        }
      },
      {
        id: 'isolation',
        label: 'Prioritize Sovereignty',
        description: 'Withdraw from complex international agreements.',
        impact: {
          approval: 10,
          foreignRelations: -20,
          worldPeace: -10,
          gdp: -1,
          heat: 5
        }
      }
    ]
  },
  {
    id: 'emergency_crisis',
    title: 'Emergency Crisis Meeting',
    description: 'An unexpected domestic emergency requires immediate attention.',
    category: 'CRISIS',
    icon: '🚨',
    minigameType: 'MASH',
    choices: [
      {
        id: 'decisive_action',
        label: 'Direct Federal Action',
        description: 'Mobilize all available federal resources.',
        impact: {
          approval: 12,
          federalBudget: -20000000,
          heat: -10,
          aura: 5
        },
        cabinetBonus: {
          roleId: 'defense',
          multiplier: 1.3,
          message: 'Secretary of Defense optimizes logistics.'
        }
      },
      {
        id: 'local_support',
        label: 'Support Local Authorities',
        description: 'Provide funding and guidance to local governments.',
        impact: {
          approval: 5,
          federalBudget: -5000000,
          congressSupport: 5
        }
      },
      {
        id: 'media_management',
        label: 'Focus on Communication',
        description: 'Control the narrative to prevent panic.',
        impact: {
          approval: 2,
          aura: 15,
          heat: -5,
          clout: 10
        },
        cabinetBonus: {
          roleId: 'press',
          multiplier: 1.5,
          message: 'Press Secretary dominates the news cycle.'
        }
      }
    ]
  },
  {
    id: 'cabinet_vote',
    title: 'Cabinet Vote',
    description: 'The cabinet is divided on a major policy shift. Cast the tie-breaking vote.',
    category: 'CABINET',
    icon: '🗳️',
    minigameType: 'SEQUENCE',
    choices: [
      {
        id: 'radical_reform',
        label: 'Push Radical Reform',
        description: 'Align with the ambitious wing of the cabinet.',
        impact: {
          approval: -5,
          gdp: 4,
          inflation: 2,
          aura: 20,
          clout: -10
        },
        requirement: {
          stat: { type: 'clout', value: 150 }
        }
      },
      {
        id: 'stable_path',
        label: 'Choose Stability',
        description: 'Stick to the proven path to maintain order.',
        impact: {
          approval: 5,
          gdp: 1,
          inflation: 0.5,
          clout: 20
        }
      },
      {
        id: 'unity_pact',
        label: 'Forge a Unity Pact',
        description: 'Attempt to satisfy all cabinet members.',
        impact: {
          approval: 2,
          clout: 10,
          aura: 10,
          congressSupport: 5
        }
      }
    ]
  },
  {
    id: 'trade_negotiations',
    title: 'Trade Negotiations',
    description: 'Negotiate a new trade deal with a major economic bloc.',
    category: 'BUDGET',
    icon: '🚢',
    minigameType: 'RISK',
    choices: [
      {
        id: 'free_trade',
        label: 'Expand Free Trade',
        description: 'Remove barriers to increase global commerce.',
        impact: {
          gdp: 6,
          inflation: -1,
          foreignRelations: 10,
          approval: -2,
          clout: 5
        },
        cabinetBonus: {
          roleId: 'treasury',
          multiplier: 1.3,
          message: 'Treasury Secretary identifies new markets.'
        }
      },
      {
        id: 'protectionism',
        label: 'Protect Domestic Industry',
        description: 'Impose tariffs to favor local manufacturers.',
        impact: {
          gdp: -2,
          inflation: 3,
          approval: 10,
          foreignRelations: -15,
          debt: -2
        }
      },
      {
        id: 'tech_focus',
        label: 'Focus on Tech Exports',
        description: 'Prioritize high-value technology trade.',
        impact: {
          gdp: 4,
          aura: 10,
          clout: 10,
          foreignRelations: 5
        },
        requirement: {
          stat: { type: 'relations', value: 60 }
        }
      }
    ]
  },
  {
    id: 'election_debate',
    title: 'National Debate',
    description: 'Face your opponents in a televised national debate.',
    category: 'ELECTION',
    icon: '🎙️',
    minigameType: 'RHYTHM',
    choices: [
      {
        id: 'attack_mode',
        label: 'Aggressive Debate',
        description: 'Directly challenge the opponent\'s record.',
        impact: {
          approval: 8,
          clout: 15,
          aura: -5,
          heat: 10
        },
        cabinetBonus: {
          roleId: 'press',
          multiplier: 1.2,
          message: 'Press Secretary preps the soundbites.'
        }
      },
      {
        id: 'statesman',
        label: 'The Statesman',
        description: 'Focus on your own vision and achievements.',
        impact: {
          approval: 5,
          aura: 20,
          clout: 5,
          congressSupport: 5
        },
        requirement: {
          stat: { type: 'aura', value: 120 }
        }
      },
      {
        id: 'policy_wonk',
        label: 'Policy Deep Dive',
        description: 'Overwhelm the audience with technical expertise.',
        impact: {
          approval: 2,
          congressSupport: 15,
          clout: 10,
          gdp: 1
        }
      }
    ]
  },
  {
    id: 'security_briefing',
    title: 'National Security Briefing',
    description: 'Review classified reports on emerging global threats.',
    category: 'SECURITY',
    icon: '🛡️',
    minigameType: 'SEQUENCE',
    choices: [
      {
        id: 'covert_ops',
        label: 'Authorize Covert Ops',
        description: 'Neutralize threats before they manifest.',
        impact: {
          worldPeace: -5,
          foreignRelations: -10,
          heat: 15,
          aura: 10,
          federalBudget: -10000000
        },
        cabinetBonus: {
          roleId: 'defense',
          multiplier: 1.4,
          message: 'Defense leverages intelligence assets.'
        }
      },
      {
        id: 'cyber_defense',
        label: 'Prioritize Cyber Security',
        description: 'Strengthen the nation\'s digital infrastructure.',
        impact: {
          gdp: 2,
          aura: 5,
          clout: 10,
          federalBudget: -15000000,
          heat: -5
        }
      },
      {
        id: 'diplomatic_warning',
        label: 'Issue Diplomatic Warning',
        description: 'Use public and private channels to deter aggression.',
        impact: {
          foreignRelations: 5,
          worldPeace: 5,
          clout: 15,
          aura: 5
        },
        cabinetBonus: {
          roleId: 'state',
          multiplier: 1.3,
          message: 'State Dept coordinates with allies.'
        }
      }
    ]
  },
  {
    id: 'disaster_response',
    title: 'Disaster Response',
    description: 'A major natural disaster has struck. Coordinate the federal response.',
    category: 'DISASTER',
    icon: '🌪️',
    minigameType: 'MASH',
    choices: [
      {
        id: 'massive_aid',
        label: 'Massive Aid Package',
        description: 'Provide immediate financial and physical relief.',
        impact: {
          approval: 15,
          federalBudget: -40000000,
          debt: 2,
          heat: -15
        },
        cabinetBonus: {
          roleId: 'treasury',
          multiplier: 1.2,
          message: 'Treasury fast-tracks emergency funds.'
        }
      },
      {
        id: 'boots_on_ground',
        label: 'Deploy National Guard',
        description: 'Ensure order and provide immediate rescue efforts.',
        impact: {
          approval: 10,
          aura: 15,
          heat: -10,
          federalBudget: -10000000
        },
        cabinetBonus: {
          roleId: 'defense',
          multiplier: 1.5,
          message: 'Defense optimizes rescue operations.'
        }
      },
      {
        id: 'long_term_rebuild',
        label: 'Focus on Rebuilding',
        description: 'Prioritize long-term infrastructure and resilience.',
        impact: {
          gdp: 3,
          approval: 5,
          federalBudget: -25000000,
          congressSupport: 5
        }
      }
    ]
  },
  {
    id: 'diplomatic_incident',
    title: 'Diplomatic Incident',
    description: 'A misunderstanding at an embassy has escalated into a public row.',
    category: 'DIPLOMACY',
    icon: '🤝',
    minigameType: 'PATTERN',
    choices: [
      {
        id: 'apologize',
        label: 'Formal Apology',
        description: 'Take full responsibility to de-escalate quickly.',
        impact: {
          foreignRelations: 15,
          worldPeace: 5,
          approval: -5,
          aura: -10
        }
      },
      {
        id: 'stand_firm',
        label: 'Stand Firm',
        description: 'Defend the actions of your diplomatic corps.',
        impact: {
          foreignRelations: -15,
          approval: 10,
          aura: 15,
          clout: 5
        },
        requirement: {
          stat: { type: 'relations', value: 70 }
        }
      },
      {
        id: 'backchannel',
        label: 'Backchannel Resolution',
        description: 'Resolve the issue quietly without public posturing.',
        impact: {
          foreignRelations: 5,
          worldPeace: 2,
          clout: 15,
          heat: 5
        },
        cabinetBonus: {
          roleId: 'state',
          multiplier: 1.5,
          message: 'Secretary of State uses deep contacts.'
        }
      }
    ]
  },
  {
    id: 'intelligence_report',
    title: 'Intelligence Report',
    description: 'A whistleblower has uncovered potential corruption in a federal agency.',
    category: 'INTELLIGENCE',
    icon: '🕵️',
    minigameType: 'HOLD',
    choices: [
      {
        id: 'full_investigation',
        label: 'Full Public Inquiry',
        description: 'Root out corruption regardless of the political cost.',
        impact: {
          approval: 12,
          clout: -20,
          heat: -15,
          congressSupport: -10,
          aura: 10
        },
        cabinetBonus: {
          roleId: 'press',
          multiplier: 1.3,
          message: 'Press Secretary handles the fallout.'
        }
      },
      {
        id: 'internal_audit',
        label: 'Internal Audit',
        description: 'Handle the matter quietly to maintain agency morale.',
        impact: {
          clout: 10,
          heat: -5,
          approval: 2,
          federalBudget: -5000000
        },
        cabinetBonus: {
          roleId: 'treasury',
          multiplier: 1.2,
          message: 'Treasury identifies the bad actors.'
        }
      },
      {
        id: 'ignore_it',
        label: 'Classify the Report',
        description: 'Protect the administration\'s reputation at all costs.',
        impact: {
          approval: -5,
          clout: 20,
          heat: 20,
          aura: -10
        },
        requirement: {
          stat: { type: 'clout', value: 200 }
        }
      }
    ]
  }
];
