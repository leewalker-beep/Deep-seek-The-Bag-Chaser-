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

  // --- CHARACTER CHAINS ---

  // Marcus Chain
  {
    id: 'char_marcus_1',
    characterId: 'char_marcus',
    title: 'A Favor for a Friend',
    description: 'Marcus "Mook" Miller cornered you near your old block. "Listen, I got into some trouble with the wrong people," he says, looking around nervously. "I need 5k to clear my name. You\'re doing well, right?"',
    trigger: {
      tier: ['MUD', 'STREET'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'marcus_help',
        label: 'Help Marcus',
        description: 'Give him the money. He\'s your brother.',
        consequences: {
          bag: -5000,
          aura: 50
        },
        setFlags: { 'rel_marcus': 50, 'trust_marcus': 100, 'status_marcus': 'ally' }
      },
      {
        id: 'marcus_refuse',
        label: 'Refuse Him',
        description: 'You can\'t afford to be a charity. He needs to learn his own lessons.',
        consequences: {
          clout: 20,
          aura: -30
        },
        setFlags: { 'rel_marcus': -20, 'trust_marcus': 0, 'status_marcus': 'alive' }
      }
    ]
  },
  {
    id: 'char_marcus_2',
    characterId: 'char_marcus',
    title: 'Marcus\'s Opportunity',
    description: 'Marcus reaches out again. He\'s found a lead on some "high-end electronics" that fell off a truck. He wants you to provide the storage space.',
    trigger: {
      tier: ['STREET', 'STARTUP'],
      probability: 0.15,
      once: true,
      flagReqs: { 'status_marcus': 'ally' }
    },
    choices: [
      {
        id: 'marcus_storage',
        label: 'Provide Storage',
        description: 'Use your warehouse. A little risk for a lot of reward.',
        consequences: {
          bag: 20000,
          heat: 30,
          aura: -50
        },
        setFlags: { 'rel_marcus': 70, 'trust_marcus': 120 }
      },
      {
        id: 'marcus_decline_crime',
        label: 'Refuse Crime',
        description: 'You\'re going legit. You can\'t risk the heat.',
        consequences: {
          aura: 30,
          heat: -10
        },
        setFlags: { 'rel_marcus': 40, 'trust_marcus': 80 }
      }
    ]
  },

  // Ashley Weaver Chain
  {
    id: 'char_ashley_1',
    characterId: 'char_ashley',
    title: 'The Journalist\'s Inquiry',
    description: 'Ashley Weaver from the Metro Gazette is writing a piece on the "rising stars" of the city. She wants an exclusive interview.',
    trigger: {
      tier: ['STREET', 'STARTUP'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'ashley_interview_clean',
        label: 'The Clean Story',
        description: 'Tell her about your humble beginnings and your drive for success.',
        consequences: {
          clout: 40,
          aura: 30
        },
        setFlags: { 'rel_ashley': 30, 'trust_ashley': 50 }
      },
      {
        id: 'ashley_interview_raw',
        label: 'The Raw Truth',
        description: 'Give her the gritty details. It\'s risky, but it\'ll be a bestseller.',
        consequences: {
          clout: 100,
          heat: 20,
          aura: -20
        },
        setFlags: { 'rel_ashley': 50, 'trust_ashley': 80 }
      }
    ]
  },
  {
    id: 'char_ashley_2',
    characterId: 'char_ashley',
    title: 'The Leak',
    description: 'Ashley has found some dirt on Victor Kane, but her editor is blocking the story. She needs an anonymous source to "verify" the documents.',
    trigger: {
      tier: ['CORPORATE', 'ELITE'],
      probability: 0.2,
      once: true,
      flagReqs: { 'rel_ashley': 30 }
    },
    choices: [
      {
        id: 'ashley_leak_verify',
        label: 'Verify the Docs',
        description: 'Confirm the details. It\'s time Kane took a hit.',
        consequences: {
          clout: 100,
          aura: 50,
          heat: 15
        },
        setFlags: { 'rel_ashley': 80, 'trust_ashley': 100, 'kane_weakened': true }
      },
      {
        id: 'ashley_leak_refuse',
        label: 'Protect Yourself',
        description: 'Kane is dangerous. You can\'t be seen helping the press.',
        consequences: {
          aura: 20,
          clout: -20
        },
        setFlags: { 'rel_ashley': 10, 'trust_ashley': 30 }
      }
    ]
  },

  // Detective Cole Chain
  {
    id: 'char_cole_1',
    characterId: 'char_cole',
    title: 'Cole\'s Warning',
    description: 'Detective Silas Cole pays you a visit. "I\'ve seen guys like you come and go," he says. "Keep your nose clean, or I\'ll be the one who shuts you down."',
    trigger: {
      tier: ['STREET', 'STARTUP'],
      probability: 0.15,
      once: true
    },
    requirement: {
      stat: { type: 'heat', value: 40 }
    },
    choices: [
      {
        id: 'cole_cooperate',
        label: 'Offer Information',
        description: 'Give him a tip about a minor rival. Show him you\'re on the "right" side.',
        consequences: {
          heat: -30,
          aura: -40,
          clout: 30
        },
        setFlags: { 'rel_cole': 20, 'trust_cole': 40 }
      },
      {
        id: 'cole_defiant',
        label: 'Be Defiant',
        description: 'You have nothing to say to the police.',
        consequences: {
          heat: 10,
          clout: 50
        },
        setFlags: { 'rel_cole': -30, 'trust_cole': 0 }
      }
    ]
  },

  // Investor Chen Chain
  {
    id: 'char_chen_1',
    characterId: 'char_chen',
    title: 'Chen\'s Entrance',
    description: 'Lawrence Chen has noticed your growth. "You have potential," he says. "But potential is just another word for someone who hasn\'t made it yet. I can provide 500k, but I want a seat on your board."',
    trigger: {
      tier: ['STARTUP', 'CORPORATE'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'chen_accept',
        label: 'Accept Chen',
        description: 'Take the money and the expertise.',
        consequences: {
          bag: 500000,
          clout: 100,
          aura: -20
        },
        setFlags: { 'rel_chen': 50, 'trust_chen': 30, 'chen_on_board': true }
      },
      {
        id: 'chen_decline',
        label: 'Maintain Autonomy',
        description: 'You don\'t need his help or his control.',
        consequences: {
          aura: 50,
          clout: 20
        },
        setFlags: { 'rel_chen': 10, 'trust_chen': 10, 'chen_on_board': false }
      }
    ]
  },

  // Maya Vane Chain
  {
    id: 'char_maya_1',
    characterId: 'char_maya',
    title: 'A Sister\'s Concern',
    description: 'Your sister Maya visits. She\'s worried that your success is coming at too high a cost. "The neighborhood is changing," she says. "And not for the better. We need a community center, not more luxury condos."',
    trigger: {
      tier: ['STARTUP', 'CORPORATE'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'maya_fund_center',
        label: 'Fund the Center',
        description: 'Commit 100k to the community project.',
        consequences: {
          bag: -100000,
          aura: 200,
          clout: 50
        },
        setFlags: { 'rel_maya': 100, 'trust_maya': 100, 'community_hero': true }
      },
      {
        id: 'maya_ignore',
        label: 'Focus on Business',
        description: 'Explain that the business comes first. You can help later.',
        consequences: {
          aura: -50,
          clout: 30
        },
        setFlags: { 'rel_maya': 20, 'trust_maya': 40, 'community_hero': false }
      }
    ]
  },

  // Victor Kane Chain
  {
    id: 'char_victor_1',
    characterId: 'char_victor',
    title: 'Kane\'s Ultimatum',
    description: 'Victor Kane invites you to his penthouse. "You\'re becoming a nuisance," he says calmly. "Sell me your core business now for 2M, or I will dismantle everything you\'ve built."',
    trigger: {
      tier: ['CORPORATE', 'ELITE'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'victor_sell',
        label: 'Take the Deal',
        description: 'Cash out while you still can.',
        consequences: {
          bag: 2000000,
          clout: -300,
          aura: -100
        },
        setFlags: { 'rel_victor': 50, 'status_victor': 'ally', 'kane_merger': true }
      },
      {
        id: 'victor_refuse',
        label: 'Declare War',
        description: 'You\'re not selling. Not to him.',
        consequences: {
          clout: 100,
          aura: 50
        },
        setFlags: { 'rel_victor': -100, 'status_victor': 'rival', 'kane_hostile': true }
      }
    ]
  },

  // Sofia Ramirez Chain
  {
    id: 'char_sofia_1',
    characterId: 'char_sofia',
    title: 'Political Alliance',
    description: 'Sofia Ramirez is running for office. She needs a high-profile endorsement and a campaign contribution.',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'sofia_endorse',
        label: 'Endorse Sofia',
        description: 'Publicly support her and donate 500k.',
        consequences: {
          bag: -500000,
          clout: 150,
          aura: 50
        },
        setFlags: { 'rel_sofia': 80, 'trust_sofia': 60, 'sofia_ally': true }
      },
      {
        id: 'sofia_ignore',
        label: 'Stay Neutral',
        description: 'Politics is a dirty game. Better to stay out of it.',
        consequences: {
          aura: 20
        },
        setFlags: { 'rel_sofia': 10, 'trust_sofia': 10, 'sofia_ally': false }
      }
    ]
  },

  // Ghost Chain
  {
    id: 'char_ghost_1',
    characterId: 'char_ghost',
    title: 'The Digital Handshake',
    description: 'A message appears on your screen: "I see what you\'re doing. I can make your digital footprint disappear, for a price. Or I can make it very, very loud."',
    trigger: {
      tier: ['STARTUP', 'CORPORATE'],
      probability: 0.12,
      once: true
    },
    choices: [
      {
        id: 'ghost_hire',
        label: 'Hire Ghost',
        description: 'Pay for digital security and anonymity.',
        consequences: {
          bag: -50000,
          heat: -50,
          clout: 20
        },
        setFlags: { 'rel_ghost': 40, 'trust_ghost': 70, 'ghost_hired': true }
      },
      {
        id: 'ghost_report',
        label: 'Try to Trace',
        description: 'Alert your security team to find the source. You don\'t negotiate with hackers.',
        consequences: {
          clout: 50,
          heat: 20,
          aura: -20
        },
        setFlags: { 'rel_ghost': -50, 'trust_ghost': 0, 'ghost_hostile': true }
      }
    ]
  },

  // Leo Thorne Chain
  {
    id: 'char_leo_1',
    characterId: 'char_leo',
    title: 'The Viral Partnership',
    description: 'Leo Thorne wants to do a collab video. "Your brand is elite, but it\'s a bit... stiff," he says. "Let\'s show the world you know how to live."',
    trigger: {
      tier: ['CORPORATE', 'ELITE'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'leo_collab',
        label: 'Do the Collab',
        description: 'Host a massive party and film the highlights.',
        consequences: {
          bag: -100000,
          clout: 250,
          aura: 100,
          heat: 20
        },
        setFlags: { 'rel_leo': 60, 'trust_leo': 40, 'leo_collab': true }
      },
      {
        id: 'leo_refuse',
        label: 'Decline the Offer',
        description: 'You\'re a serious business person, not a clown.',
        consequences: {
          aura: 30,
          clout: -50
        },
        setFlags: { 'rel_leo': -20, 'trust_leo': 10 }
      }
    ]
  },

  // Sarah Jenkins Chain
  {
    id: 'char_sarah_1',
    characterId: 'char_sarah',
    title: 'Union Demands',
    description: 'Sarah Jenkins and the United Workers Union are threatening a strike unless you improve working conditions and pay across your industries.',
    trigger: {
      tier: ['CORPORATE', 'ELITE'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'sarah_concede',
        label: 'Meet the Demands',
        description: 'Increase wages and benefits. It\'ll hurt your margins, but keep the peace.',
        consequences: {
          passiveCash: -10000,
          aura: 200,
          clout: 50
        },
        setFlags: { 'rel_sarah': 90, 'trust_sarah': 100, 'union_ally': true }
      },
      {
        id: 'sarah_fight',
        label: 'Break the Strike',
        description: 'Hire replacement workers and use legal maneuvers to stop the union.',
        consequences: {
          clout: 100,
          aura: -200,
          heat: 40
        },
        setFlags: { 'rel_sarah': -100, 'trust_sarah': 0, 'union_enemy': true }
      }
    ]
  },

  // President Volkov Chain
  {
    id: 'char_volkov_1',
    characterId: 'char_volkov',
    title: 'The Foreign Asset',
    description: 'President Mikhail Volkov offers a "strategic partnership" between your conglomerate and his state-owned industries. "The world is changing," he says. "Isolation is for the weak."',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'volkov_partner',
        label: 'Partner with Volkov',
        description: 'Access foreign markets and resources.',
        consequences: {
          bag: 5000000,
          clout: 300,
          heat: 50,
          aura: -100
        },
        setFlags: { 'rel_volkov': 70, 'trust_volkov': 50, 'volkov_partner': true }
      },
      {
        id: 'volkov_refuse',
        label: 'Keep it National',
        description: 'Refuse the offer. You won\'t be a pawn for a foreign power.',
        consequences: {
          aura: 100,
          clout: 100
        },
        setFlags: { 'rel_volkov': -30, 'trust_volkov': 20, 'volkov_partner': false }
      }
    ]
  },

  // Elena Vance Chain
  {
    id: 'char_elena_1',
    characterId: 'char_elena',
    title: 'The Fixer\'s Proposal',
    description: 'Elena Vance can make your legal problems "disappear" permanently. "I have connections the public doesn\'t even know exist," she whispers.',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.15,
      once: true
    },
    requirement: {
      stat: { type: 'heat', value: 60 }
    },
    choices: [
      {
        id: 'elena_retain',
        label: 'Retain Elena',
        description: 'Pay her a massive retainer for "discretionary services."',
        consequences: {
          bag: -1000000,
          heat: -80,
          aura: -50
        },
        setFlags: { 'rel_elena': 60, 'trust_elena': 80, 'elena_retained': true }
      },
      {
        id: 'elena_refuse',
        label: 'Handle it Yourself',
        description: 'You don\'t need her brand of "fixing."',
        consequences: {
          aura: 30,
          clout: 20
        },
        setFlags: { 'rel_elena': 0, 'trust_elena': 10 }
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
