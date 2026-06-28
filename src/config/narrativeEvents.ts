import type { NarrativeEvent } from '../types/game';

export const NARRATIVE_EVENTS: NarrativeEvent[] = [
  // STREET KID / SCAVENGER - MUD/STREET
  {
    id: 'scavenger_prototype',
    title: 'The Prototype',
    description: 'While scouting the industrial waste zones, you found a discarded prototype for a high-end neural processor. It\'s labeled "Property of Global Dynamics". It still works.',
    trigger: {
      background: ['sk_scrap'],
      tier: ['MUD', 'STREET'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'sell_prototype',
        label: 'Sell to the Underground',
        description: 'Trade it to a black-market dealer for immediate liquid capital.',
        consequences: {
          bag: 15000,
          clout: 10,
          heat: 15
        }
      },
      {
        id: 'leak_prototype',
        label: 'Reverse Engineer & Leak',
        description: 'Strip the hardware, learn its secrets, and leak the blueprints to damage the corporation\'s stock.',
        consequences: {
          clout: 50,
          aura: 25,
          passiveCash: 500 // Permanent passive from "consulting"
        }
      }
    ]
  },

  // BENEFACTOR / MINING HEIR - STARTUP/CORPORATE
  {
    id: 'mining_labor_dispute',
    title: 'The Ghost of the Mines',
    description: 'A investigative journalist has uncovered old records of labor violations at your family\'s legacy mines. They are offering you a "private screening" of the evidence before it goes live.',
    trigger: {
      background: ['bn_mining'],
      tier: ['STARTUP', 'CORPORATE'],
      probability: 0.1,
      once: true
    },
    choices: [
      {
        id: 'settle_dispute',
        label: 'The Right Thing',
        description: 'Fund a massive reparations package for the old mining families and issue a public apology.',
        consequences: {
          bag: -100000,
          aura: 150,
          clout: 50
        }
      },
      {
        id: 'bury_evidence',
        label: 'Bury the Story',
        description: 'Use your growing influence to purchase the media outlet and make the reporter "disappear" from the industry.',
        consequences: {
          bag: -25000,
          clout: 100,
          aura: -150,
          heat: 20
        }
      }
    ]
  },

  // DROPOUT / TECHIE - STARTUP+
  {
    id: 'tech_black_project',
    title: 'Project Obsidian',
    description: 'An encrypted message arrives from an unknown sender. They want you to design a "backdoor" into a regional banking network. The pay is astronomical, but the risks are absolute.',
    trigger: {
      background: ['dr_tech'],
      tier: ['STARTUP', 'CORPORATE', 'ELITE'],
      probability: 0.12,
      once: true
    },
    choices: [
      {
        id: 'accept_obsidian',
        label: 'Accept the Contract',
        description: 'Code the backdoor. Take the money. Hope nobody finds the digital fingerprints.',
        consequences: {
          bag: 500000,
          heat: 60,
          aura: -50
        }
      },
      {
        id: 'report_obsidian',
        label: 'Report & Secure',
        description: 'Alert the authorities and help them patch the vulnerability. It\'s good for the resume.',
        consequences: {
          clout: 80,
          aura: 40,
          bag: 10000
        }
      }
    ]
  },

  // THE SHADOW - SPECIALIZATION
  {
    id: 'shadow_blackmail',
    title: 'Leverage Opportunity',
    description: 'Your informants have caught a local politician in a compromising position. As "The Shadow", you can leverage this for power or for silence.',
    trigger: {
      specialization: ['shadow'],
      tier: ['STARTUP', 'CORPORATE', 'ELITE', 'MOGUL'],
      probability: 0.15,
      once: false
    },
    choices: [
      {
        id: 'leverage_power',
        label: 'Political Favor',
        description: 'Trade the evidence for a reduction in regulatory scrutiny on your businesses.',
        consequences: {
          heat: -30,
          aura: -20,
          clout: 40
        }
      },
      {
        id: 'leverage_cash',
        label: 'Cold Cash',
        description: 'Simple extortion. $50,000 for the original drive.',
        consequences: {
          bag: 50000,
          aura: -10,
          heat: 5
        }
      }
    ]
  },

  // --- PERSISTENT NARRATIVE CHAINS ---

  // Chain 1: The Vengeful Investor
  {
    id: 'investor_chain_1',
    title: 'A Risky Proposal',
    description: 'A shadowy venture capitalist, "The Architect", offers you a massive injection of capital. "No questions asked," they say. "But I\'ll come for a favor later."',
    trigger: {
      tier: ['STARTUP', 'CORPORATE'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'accept_architect',
        label: 'Accept the Investment',
        description: 'Take the $250,000. You\'ll deal with the consequences later.',
        consequences: {
          bag: 250000,
          clout: 50
        },
        setFlags: { 'architect_investment': true, 'architect_debt': true }
      },
      {
        id: 'decline_architect',
        label: 'Decline Politely',
        description: 'There\'s no such thing as free money.',
        consequences: {
          aura: 20
        },
        setFlags: { 'architect_investment': false }
      }
    ]
  },
  {
    id: 'investor_chain_2',
    title: 'The Architect Returns',
    description: 'The favor has been called in. "The Architect" wants you to use your influence to push through a controversial zoning law that favors their holdings.',
    trigger: {
      tier: ['CORPORATE', 'ELITE', 'MOGUL'],
      probability: 0.2,
      once: true,
      flagReqs: { 'architect_debt': true }
    },
    choices: [
      {
        id: 'obey_architect',
        label: 'Push the Law',
        description: 'Your reputation takes a hit, but the debt is settled.',
        consequences: {
          aura: -150,
          clout: 100,
          heat: 40
        },
        setFlags: { 'architect_debt': false, 'architect_loyalist': true }
      },
      {
        id: 'refuse_architect',
        label: 'Refuse the Demand',
        description: 'You won\'t be a corporate puppet. Expect retaliation.',
        consequences: {
          aura: 100,
          clout: -50
        },
        setFlags: { 'architect_debt': true, 'architect_hostile': true }
      }
    ]
  },
  {
    id: 'investor_chain_3',
    title: 'Architect\'s Retribution',
    description: '"The Architect" is liquidating their positions in your companies, attempting a hostile takeover to strip your assets.',
    trigger: {
      tier: ['ELITE', 'MOGUL', 'PRESIDENT'],
      probability: 0.25,
      once: true,
      flagReqs: { 'architect_hostile': true, 'architect_debt': true }
    },
    choices: [
      {
        id: 'fight_takeover',
        label: 'Fight the Takeover',
        description: 'Burn through your reserves to buy back your shares and secure your control.',
        consequences: {
          bag: -1000000,
          clout: 200,
          aura: 50
        },
        setFlags: { 'architect_hostile': false, 'architect_debt': false, 'architect_defeated': true }
      },
      {
        id: 'surrender_control',
        label: 'Cede Control',
        description: 'Let them have what they want. You\'ll start over elsewhere, but the sting of defeat is heavy.',
        consequences: {
          bag: -5000000,
          clout: -500,
          aura: -200,
          mentalHealth: -40
        },
        setFlags: { 'architect_hostile': false, 'architect_debt': false, 'architect_victorious': true }
      }
    ]
  },

  // Chain 2: The Shadowy Syndicate
  {
    id: 'syndicate_chain_1',
    title: 'The Whispering Hand',
    description: 'You\'ve been approached by a representative of "The Whispering Hand", a global syndicate that operates in the gaps between laws. They want to use your logistics network for "special cargo."',
    trigger: {
      tier: ['CORPORATE', 'ELITE'],
      probability: 0.12,
      once: true
    },
    choices: [
      {
        id: 'join_syndicate',
        label: 'Partner Up',
        description: 'The profits are too high to ignore. Just don\'t ask what\'s in the boxes.',
        consequences: {
          bag: 100000,
          heat: 30,
          aura: -50
        },
        setFlags: { 'syndicate_member': true }
      },
      {
        id: 'report_syndicate',
        label: 'Tip off the Feds',
        description: 'Play it clean. The authorities will appreciate the lead.',
        consequences: {
          clout: 60,
          aura: 40
        },
        setFlags: { 'syndicate_enemy': true }
      }
    ]
  },
  {
    id: 'syndicate_chain_2',
    title: 'Syndicate Escalation',
    description: 'The Whispering Hand is being squeezed by a federal crackdown. They need you to "clean" a massive amount of capital through your ventures immediately.',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.2,
      once: true,
      flagReqs: { 'syndicate_member': true }
    },
    choices: [
      {
        id: 'launder_syndicate',
        label: 'Wash the Money',
        description: 'It\'s dangerous, but the syndicate pays a 20% commission.',
        consequences: {
          bag: 1000000,
          heat: 70,
          aura: -100
        },
        setFlags: { 'syndicate_deep': true }
      },
      {
        id: 'cut_ties',
        label: 'Cut Ties',
        description: 'It\'s getting too hot. Shut down the operation and go dark.',
        consequences: {
          bag: -200000,
          clout: -100,
          heat: -20
        },
        setFlags: { 'syndicate_member': false, 'syndicate_threatened': true }
      }
    ]
  },

  // --- ORIGIN EVENTS ---

  // Street Kid Persistence
  {
    id: 'origin_sk_debt',
    title: 'Old Neighborhood Debt',
    description: 'A figure from your past has surfaced. They claim you owe them for "protection" back in the day. Now that you\'re rich, they want a payout.',
    trigger: {
      category: ['street_kid'],
      tier: ['CORPORATE', 'ELITE'],
      probability: 0.1,
      once: true
    },
    choices: [
      {
        id: 'pay_off_sk',
        label: 'Pay for Silence',
        description: 'Give them $50,000 to go away forever.',
        consequences: {
          bag: -50000,
          aura: -10
        }
      },
      {
        id: 'show_strength_sk',
        label: 'Show them the Door',
        description: 'You\'re not that kid anymore. Remind them who you\'ve become.',
        consequences: {
          clout: 50,
          aura: 20,
          heat: 10
        }
      }
    ]
  },

  // Dropout Persistence
  {
    id: 'origin_dr_rival',
    title: 'The Academic Rival',
    description: 'One of your former professors is publicly critiquing your business model in the media, calling it "unstructured" and "destined for collapse."',
    trigger: {
      category: ['dropout'],
      tier: ['STARTUP', 'CORPORATE', 'ELITE'],
      probability: 0.1,
      once: true
    },
    choices: [
      {
        id: 'debate_dr',
        label: 'Public Debate',
        description: 'Crush them with real-world results in a televised interview.',
        consequences: {
          clout: 100,
          aura: 50
        }
      },
      {
        id: 'ignore_dr',
        label: 'Ignore the Noise',
        description: 'The numbers speak for themselves. You have more important things to do.',
        consequences: {
          mentalHealth: 10
        }
      }
    ]
  },

  // Benefactor Persistence
  {
    id: 'origin_bn_audit',
    title: 'The Legacy Audit',
    description: 'Internal auditors have found "discrepancies" in the trust fund that launched your career. Regulatory scrutiny is imminent.',
    trigger: {
      category: ['benefactor'],
      tier: ['ELITE', 'MOGUL'],
      probability: 0.1,
      once: true
    },
    choices: [
      {
        id: 'clean_audit',
        label: 'Full Disclosure',
        description: 'Pay the fines and open the books. Transparency is the best policy.',
        consequences: {
          bag: -500000,
          aura: 100,
          heat: -30
        }
      },
      {
        id: 'hide_audit',
        label: 'Mask the Trail',
        description: 'Hire the best creative accountants money can buy to bury the discrepancies.',
        consequences: {
          bag: -100000,
          clout: 50,
          aura: -50,
          heat: 50
        }
      }
    ]
  },

  // --- SPECIALIZATION EVENTS ---

  // Influencer
  {
    id: 'spec_influencer_viral',
    title: 'The Viral Crisis',
    description: 'A video of you has gone viral, but it\'s being taken out of context. Your brand is at a tipping point.',
    trigger: {
      specialization: ['influencer'],
      tier: ['STARTUP', 'CORPORATE', 'ELITE'],
      probability: 0.15,
      once: false
    },
    choices: [
      {
        id: 'apologize_viral',
        label: 'The Tears Video',
        description: 'Issue a sincere (or well-acted) apology. Protect the Aura.',
        consequences: {
          aura: 100,
          clout: -50
        }
      },
      {
        id: 'lean_in_viral',
        label: 'Lean into the Chaos',
        description: 'Any publicity is good publicity. Double down and watch the numbers climb.',
        consequences: {
          clout: 200,
          aura: -100,
          heat: 20
        }
      }
    ]
  },

  // Shadow
  {
    id: 'spec_shadow_heist',
    title: 'The Invisible Heist',
    description: 'Your connections in the underworld have planned a high-stakes digital heist. As "The Shadow", they want you to provide the encryption keys for the target\'s vault.',
    trigger: {
      specialization: ['shadow'],
      tier: ['ELITE', 'MOGUL'],
      probability: 0.15,
      once: false
    },
    choices: [
      {
        id: 'provide_keys',
        label: 'Provide the Keys',
        description: 'Take a cut of the score. Your involvement remains hidden.',
        consequences: {
          bag: 750000,
          heat: 15,
          aura: -50
        }
      },
      {
        id: 'refuse_heist',
        label: 'Refuse Involvement',
        description: 'Too risky, even for you. Some scores aren\'t worth the exposure.',
        consequences: {
          aura: 50,
          heat: -10
        }
      }
    ]
  },

  // Institutionalist
  {
    id: 'spec_inst_merger',
    title: 'The Strategic Merger',
    description: 'A mid-sized competitor is struggling. As an "Institutionalist", you can absorb them to solidify your market share.',
    trigger: {
      specialization: ['institutional'],
      tier: ['CORPORATE', 'ELITE', 'MOGUL'],
      probability: 0.15,
      once: false
    },
    choices: [
      {
        id: 'acquire_merger',
        label: 'Hostile Acquisition',
        description: 'Strip the assets and fire the management. Pure efficiency.',
        consequences: {
          bag: -250000,
          passiveCash: 5000,
          clout: 50,
          aura: -30
        }
      },
      {
        id: 'partner_merger',
        label: 'Collaborative Merger',
        description: 'Keep the team and build a stronger foundation together.',
        consequences: {
          bag: -400000,
          passiveCash: 4000,
          aura: 100,
          clout: 30
        }
      }
    ]
  },

  // --- RIVAL STORY ARCS ---

  {
    id: 'rival_memory_grudge',
    title: 'Rivalry Escalation',
    description: 'One of your rivals is taking your success personally. They\'ve started a smear campaign to tarnish your reputation.',
    trigger: {
      tier: ['CORPORATE', 'ELITE', 'MOGUL'],
      probability: 0.15,
      once: false
    },
    requirement: {
      stat: { type: 'heat', value: 30 }
    },
    choices: [
      {
        id: 'counter_rival',
        label: 'Counter-Smear',
        description: 'Fight fire with fire. Leak their own dirty secrets.',
        consequences: {
          clout: 50,
          aura: -50,
          heat: 20
        }
      },
      {
        id: 'buy_rival_out',
        label: 'The Golden Handshake',
        description: 'Offer them a "consulting" role to keep their mouth shut.',
        consequences: {
          bag: -100000,
          aura: 20,
          heat: -10
        }
      }
    ]
  },
  {
    id: 'rival_crushed_tribute',
    title: 'A Fallen Giant',
    description: 'A rival you recently crushed is offering to sell you their remaining secrets for a chance to retire in peace.',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'buy_secrets',
        label: 'Buy the Intel',
        description: 'Their data could give you a massive edge.',
        consequences: {
          bag: -500000,
          clout: 200,
          aura: 50,
          passiveCash: 10000
        }
      },
      {
        id: 'refuse_tribute',
        label: 'Let them Rot',
        description: 'You don\'t need anything from a loser.',
        consequences: {
          aura: -20,
          clout: 20
        }
      }
    ]
  },

  // --- PRESIDENCY NARRATIVE ---

  {
    id: 'pres_scandal_leak',
    title: 'The Oval Office Leak',
    description: 'Classified documents regarding your pre-presidency business dealings have leaked. The media is calling for an impeachment inquiry.',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'deny_pres',
        label: 'The Denial',
        description: 'Call it "Fake News" and mobilize your base.',
        consequences: {
          clout: 100,
          aura: -200,
          heat: 50
        }
      },
      {
        id: 'sacrifice_aide',
        label: 'Sacrifice a Cabinet Member',
        description: 'Blame a rogue staffer and fire them publicly.',
        consequences: {
          clout: -100,
          aura: -50,
          heat: -30
        }
      }
    ]
  },
  {
    id: 'pres_intl_crisis',
    title: 'Global Tensions',
    description: 'An international trade dispute is threatening to boil over into a kinetic conflict. Your response will define your legacy.',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.15,
      once: false
    },
    choices: [
      {
        id: 'diplomacy_pres',
        label: 'Economic Sanctions',
        description: 'Pressure them financially. It hurts the global economy, but saves lives.',
        consequences: {
          bag: -1000000,
          aura: 200,
          clout: 50
        }
      },
      {
        id: 'force_pres',
        label: 'Show of Force',
        description: 'Deploy the fleet. Remind the world who holds the power.',
        consequences: {
          clout: 300,
          aura: -100,
          heat: 60
        }
      }
    ]
  },
  {
    id: 'pres_cabinet_revolt',
    title: 'Cabinet Conflict',
    description: 'Your Secretary of State and Secretary of Treasury are at each other\'s throats. The discord is leaking into the press.',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.15,
      once: false
    },
    choices: [
      {
        id: 'mediate_cabinet',
        label: 'Force Mediation',
        description: 'Locked-door meeting until they find a compromise.',
        consequences: {
          aura: 50,
          mentalHealth: -20
        }
      },
      {
        id: 'fire_both_cabinet',
        label: 'Clean Slate',
        description: 'Fire them both. You need absolute loyalty.',
        consequences: {
          clout: 100,
          aura: -50,
          heat: 20
        }
      }
    ]
  },

  // GENERAL - HIGH HEAT
  {
    id: 'heat_crackdown',
    title: 'The Investigation',
    description: 'The heat is getting too high. Federal agents have been spotted outside your main office. You need to act before they serve a warrant.',
    trigger: {
      minMonth: 12,
      probability: 0.2,
      once: false
    },
    requirement: {
      stat: { type: 'heat', value: 80 }
    },
    choices: [
      {
        id: 'bribe_agents',
        label: 'The "Donation"',
        description: 'Make a significant contribution to the Law Enforcement Benevolent Fund.',
        consequences: {
          bag: -50000,
          heat: -40,
          aura: -10
        }
      },
      {
        id: 'shred_files',
        label: 'Burn the Evidence',
        description: 'Destroy everything. Clean slate, but your operations will take a hit.',
        consequences: {
          heat: -60,
          clout: -30,
          mentalHealth: -20
        }
      }
    ]
  }
];
