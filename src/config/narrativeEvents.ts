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
          mentalHealth: -40,
          biographyEntry: 'Lost a massive corporate war against the shadowy Investor known as The Architect.'
        },
        setFlags: { 'architect_hostile': false, 'architect_debt': false, 'architect_victorious': true }
      }
    ]
  },
  {
    id: 'investor_chain_4',
    title: 'Kane\'s Intervention',
    description: 'Victor Kane reaches out. "I see you\'re having trouble with the Architect," he says. "I have no love for them. I can provide the leverage to bury them once and for all, but I want your loyalty in the coming trade wars."',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.25,
      once: true,
      flagReqs: { 'architect_hostile': true, 'architect_debt': true }
    },
    choices: [
      {
        id: 'kane_alliance',
        label: 'Align with Kane',
        description: 'Accept his help. The Architect will fall, but you\'ll be in Kane\'s debt.',
        consequences: {
          clout: 150,
          aura: -50,
          biographyEntry: 'Formed a strategic alliance with Victor Kane to dismantle The Architect\'s network.'
        },
        setFlags: { 'kane_ally': true, 'architect_hostile': false, 'architect_debt': false, 'architect_defeated': true }
      },
      {
        id: 'kane_refuse_alliance',
        label: 'Reject Kane',
        description: 'You won\'t trade one master for another. You\'ll fight the Architect on your own terms.',
        consequences: {
          aura: 100,
          clout: 50,
          biographyEntry: 'Defiantly rejected Victor Kane\'s offer of a predatory alliance.'
        },
        setFlags: { 'kane_hostile_arc': true }
      }
    ]
  },
  {
    id: 'investor_chain_5',
    title: 'Hostile Negotiations',
    description: 'The market is reeling from your recent moves. Victor Kane is aggressively moving against your holdings, attempting to force you into a merger.',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.2,
      once: true,
      flagReqs: { 'kane_hostile_arc': true }
    },
    choices: [
      {
        id: 'fight_kane',
        label: 'Counter-Offensive',
        description: 'Launch a aggressive media campaign and legal battle to block Kane\'s moves.',
        consequences: {
          bag: -5000000,
          clout: 300,
          aura: 100,
          biographyEntry: 'Successfully defended the empire against a hostile takeover attempt by Victor Kane.'
        },
        setFlags: { 'kane_defeated': true, 'kane_hostile_arc': false }
      },
      {
        id: 'merge_kane',
        label: 'Strategic Merger',
        description: 'Merge your operations with Kane\'s. You lose autonomy, but the combined power is undeniable.',
        consequences: {
          bag: 10000000,
          clout: 500,
          aura: -200,
          biographyEntry: 'Merged the business empire with Victor Kane\'s conglomerate, becoming a global powerhouse at the cost of independence.'
        },
        setFlags: { 'kane_merged': true, 'kane_hostile_arc': false }
      }
    ]
  },
  {
    id: 'investor_chain_6',
    title: 'The Titan\'s Ascent',
    description: 'Your empire is now at its peak. The world recognizes you as a true Titan of industry. How do you choose to solidify your legacy?',
    trigger: {
      tier: ['PRESIDENT', 'OPEN'],
      probability: 0.3,
      once: true,
      flagReqs: { 'architect_defeated': true }
    },
    choices: [
      {
        id: 'monopolize_market',
        label: 'Total Monopoly',
        description: 'Crush the remaining competition and establish absolute dominance.',
        requirement: { specialization: ['institutional'] },
        consequences: {
          clout: 1000,
          aura: -500,
          passiveCash: 500000,
          biographyEntry: 'Established a global monopoly, becoming the undisputed ruler of the markets.'
        },
        setFlags: { 'business_arc_complete': 'monopoly' }
      },
      {
        id: 'shadow_influence',
        label: 'Shadow Hand',
        description: 'Retreat from the public eye and control the world\'s finances through hidden networks.',
        requirement: { specialization: ['shadow'] },
        consequences: {
          clout: 500,
          aura: 500,
          heat: -100,
          biographyEntry: 'Vanished from the public eye to rule the global economy from the shadows.'
        },
        setFlags: { 'business_arc_complete': 'shadow' }
      },
      {
        id: 'philanthropic_legacy',
        label: 'Public Foundation',
        description: 'Pivot your entire empire towards philanthropy and global improvement.',
        consequences: {
          aura: 1000,
          clout: 200,
          bag: -20000000,
          biographyEntry: 'Transformed a business empire into a global force for humanitarian progress.'
        },
        setFlags: { 'business_arc_complete': 'philanthropy' }
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
          heat: -20,
          biographyEntry: 'Severed ties with the Whispering Hand syndicate after the risks became too great.'
        },
        setFlags: { 'syndicate_member': false, 'syndicate_threatened': true }
      }
    ]
  },
  {
    id: 'syndicate_chain_3',
    title: 'Cole\'s Pursuit',
    description: 'Detective Silas Cole has been tracking the syndicate\'s shipments, and the trail is leading straight to your warehouses. He offers you a chance to be a confidential informant.',
    trigger: {
      tier: ['CORPORATE', 'ELITE'],
      probability: 0.2,
      once: true,
      flagReqs: { 'syndicate_member': true }
    },
    choices: [
      {
        id: 'syndicate_informant',
        label: 'Become Informant',
        description: 'Feed Cole information on the syndicate\'s movements in exchange for immunity.',
        consequences: {
          heat: -50,
          aura: -100,
          clout: 50,
          biographyEntry: 'Began working as a confidential informant for Detective Silas Cole against the Whispering Hand.'
        },
        setFlags: { 'syndicate_informant': true, 'rel_cole': 50 }
      },
      {
        id: 'syndicate_loyal',
        label: 'Remain Loyal',
        description: 'Tell Cole nothing. You don\'t talk to the feds.',
        consequences: {
          heat: 30,
          clout: 100,
          biographyEntry: 'Chose loyalty to the syndicate over cooperation with Detective Cole\'s investigation.'
        },
        setFlags: { 'syndicate_loyalist': true, 'rel_cole': -50 }
      }
    ]
  },
  {
    id: 'syndicate_chain_4',
    title: 'The High-Stakes Heist',
    description: 'The Whispering Hand is planning a massive heist of a federal reserve transport. They need you to provide the specialized logistics and "clean" the take.',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.25,
      once: true,
      flagReqs: { 'syndicate_member': true, 'syndicate_loyalist': true }
    },
    choices: [
      {
        id: 'syndicate_heist_join',
        label: 'Join the Heist',
        description: 'Commit your full resources. This is the big one.',
        consequences: {
          bag: 5000000,
          heat: 80,
          aura: -300,
          biographyEntry: 'Masterminded the logistics for the Whispering Hand\'s legendary federal reserve heist.'
        },
        setFlags: { 'syndicate_heist_success': true }
      },
      {
        id: 'syndicate_heist_refuse',
        label: 'Refuse Participation',
        description: 'This is too big, even for the syndicate. You\'re out.',
        consequences: {
          clout: -200,
          aura: 50,
          biographyEntry: 'Refused to participate in a high-stakes heist, narrowly avoiding a massive federal crackdown.'
        },
        setFlags: { 'syndicate_member': false, 'syndicate_retired': true }
      }
    ]
  },
  {
    id: 'syndicate_chain_5',
    title: 'Internal Affairs',
    description: 'The syndicate is being torn apart by internal paranoia. They suspect a mole. As a high-ranking member, you are tasked with "handling" the suspicion.',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.2,
      once: true,
      flagReqs: { 'syndicate_member': true }
    },
    choices: [
      {
        id: 'syndicate_mole_frame',
        label: 'Frame a Rival',
        description: 'Point the finger at a business rival to clear your own name.',
        consequences: {
          clout: 100,
          aura: -100,
          heat: 10,
          biographyEntry: 'Ruthlessly framed a rival to protect their position within the Whispering Hand.'
        },
        setFlags: { 'syndicate_cleared': true }
      },
      {
        id: 'syndicate_mole_ghost',
        label: 'Ghost Protocol',
        description: 'Use your technical expertise to scrub all records and disappear from the syndicate\'s tracking.',
        requirement: { specialization: ['shadow'] },
        consequences: {
          heat: -40,
          clout: -50,
          biographyEntry: 'Used elite technical skills to ghost the syndicate and erase all traces of their involvement.'
        },
        setFlags: { 'syndicate_member': false, 'syndicate_ghosted': true }
      }
    ]
  },
  {
    id: 'syndicate_chain_6',
    title: 'Judgment Day',
    description: 'The final showdown. The feds are moving in for a total sweep. Do you stand with the syndicate, or do you make your final move for freedom?',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT', 'OPEN'],
      probability: 0.3,
      once: true,
      flagReqs: { 'syndicate_member': true }
    },
    choices: [
      {
        id: 'syndicate_kingpin',
        label: 'Take Control',
        description: 'Eliminate the current leadership and take over the remains of the syndicate as the new Kingpin.',
        consequences: {
          bag: 20000000,
          clout: 1000,
          aura: -500,
          heat: 100,
          biographyEntry: 'Seized control of the Whispering Hand, becoming the city\'s undisputed criminal Kingpin.'
        },
        setFlags: { 'crime_arc_complete': 'kingpin' }
      },
      {
        id: 'syndicate_states_witness',
        label: 'States Witness',
        description: 'Turn over the entire syndicate leadership to Detective Cole. Trade your life of crime for a new identity.',
        consequences: {
          bag: -10000000,
          clout: -500,
          aura: 500,
          heat: -100,
          biographyEntry: 'Dismantled the Whispering Hand as a star witness, choosing a life of redemption over power.'
        },
        setFlags: { 'crime_arc_complete': 'witness', 'rel_cole': 100 }
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
          clout: 30,
          biographyEntry: 'Prioritized business growth over family-led community projects, straining relations with Maya.'
        },
        setFlags: { 'rel_maya': 20, 'trust_maya': 40, 'community_hero': false }
      }
    ]
  },
  {
    id: 'char_maya_2',
    characterId: 'char_maya',
    title: 'Zoning Wars',
    description: 'Maya\'s community center project is being blocked by a local development firm, "Chadwick Holdings". They want to build a luxury high-rise on that lot. They\'ve offered you a "finder\'s fee" to convince Maya to drop the project.',
    trigger: {
      tier: ['STREET', 'STARTUP'],
      probability: 0.2,
      once: true,
      flagReqs: { 'community_hero': true }
    },
    choices: [
      {
        id: 'maya_defend_center',
        label: 'Defend the Center',
        description: 'Use your influence and legal resources to block Chadwick\'s permit.',
        consequences: {
          bag: -50000,
          aura: 100,
          clout: 50,
          biographyEntry: 'Successfully defended the community center against Chadwick Holdings\' predatory development plans.'
        },
        setFlags: { 'rel_maya': 120, 'chadwick_hostile': true }
      },
      {
        id: 'maya_betray_center',
        label: 'Accept the Fee',
        description: 'Take the money. Maya will understand... eventually.',
        consequences: {
          bag: 200000,
          aura: -200,
          clout: 100,
          biographyEntry: 'Betrayed Maya\'s trust by accepting a payoff to sabotage the community center project.'
        },
        setFlags: { 'rel_maya': 0, 'trust_maya': 0, 'community_hero': false, 'chadwick_ally': true }
      }
    ]
  },
  {
    id: 'char_maya_3',
    characterId: 'char_maya',
    title: 'Community Outreach',
    description: 'The community center is thriving, but it needs more funding to expand its programs. Maya suggests a high-profile fundraiser.',
    trigger: {
      tier: ['CORPORATE', 'ELITE'],
      probability: 0.2,
      once: true,
      flagReqs: { 'community_hero': true }
    },
    choices: [
      {
        id: 'maya_fundraiser_viral',
        label: 'Viral Campaign',
        description: 'Use your influencer connections to make the fundraiser a global event.',
        requirement: { specialization: ['influencer'] },
        consequences: {
          clout: 300,
          aura: 200,
          biographyEntry: 'Leveraged massive digital influence to turn a local community center into a national symbol of hope.'
        },
        setFlags: { 'maya_center_fame': 'global' }
      },
      {
        id: 'maya_fundraiser_personal',
        label: 'Personal Donation',
        description: 'Quietly write a check for the full expansion cost.',
        consequences: {
          bag: -1000000,
          aura: 500,
          biographyEntry: 'Quietly funded the total expansion of Maya\'s community foundation.'
        },
        setFlags: { 'maya_center_fame': 'local' }
      }
    ]
  },
  {
    id: 'char_maya_4',
    characterId: 'char_maya',
    title: 'Legacy Conflict',
    description: 'Maya visits you in your new office. She\'s concerned about the ruthless tactics you\'ve used to reach the top. "Is this really the legacy you want to leave?" she asks.',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.2,
      once: true,
      flagReqs: { 'rel_maya': 30 }
    },
    choices: [
      {
        id: 'maya_reform',
        label: 'Vow Reform',
        description: 'Commit to more ethical business practices. It will be harder to grow, but your conscience will be cleaner.',
        consequences: {
          aura: 500,
          clout: -200,
          biographyEntry: 'Pledged to reform the empire\'s ethics after a soul-searching confrontation with Maya.'
        },
        setFlags: { 'maya_reformed': true }
      },
      {
        id: 'maya_dismiss',
        label: 'Dismiss Concerns',
        description: 'Explain that the world is a hard place, and you did what was necessary.',
        consequences: {
          clout: 100,
          aura: -100,
          biographyEntry: 'Chose the path of the pragmatist, dismissing family concerns in favor of absolute power.'
        },
        setFlags: { 'maya_dismissed': true, 'rel_maya': 10 }
      }
    ]
  },
  {
    id: 'char_maya_5',
    characterId: 'char_maya',
    title: 'The Vane Foundation',
    description: 'Your final decision on the future of the Vane family legacy. Will you use your power to lift others, or to secure your own throne?',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT', 'OPEN'],
      probability: 0.3,
      once: true,
      flagReqs: { 'rel_maya': 10 }
    },
    choices: [
      {
        id: 'maya_true_hero',
        label: 'Community Foundation',
        description: 'Establish a massive, permanent foundation that will serve the city for generations.',
        requirement: { background: ['sk_scrap', 'sk_delivery'] },
        consequences: {
          bag: -50000000,
          aura: 1000,
          clout: 500,
          biographyEntry: 'Honored their Street Kid roots by creating the city\'s largest humanitarian foundation.'
        },
        setFlags: { 'family_arc_complete': 'hero' }
      },
      {
        id: 'maya_dynasty',
        label: 'Family Dynasty',
        description: 'Focus your wealth on securing the future of the Vane bloodline for centuries to come.',
        requirement: { background: ['bn_mining', 'bn_tech'] },
        consequences: {
          bag: -10000000,
          clout: 1000,
          aura: -300,
          biographyEntry: 'Solidified the Vane dynasty, ensuring the family\'s dominance for generations.'
        },
        setFlags: { 'family_arc_complete': 'dynasty' }
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
  },

  // --- NEW CHARACTER INTEGRATION EVENTS ---

  // MUD / STREET - Pops Mentorship
  {
    id: 'char_pops_garden',
    characterId: 'char_pops',
    title: 'Pops\' Wisdom',
    description: 'Arthur "Pops" Jenkins calls you over to the community garden. "You\'re moving fast, kid," he says, handing you a fresh tomato. "But remember, a plant that grows too fast without deep roots will fall in the first storm. What are you building for the future?"',
    trigger: {
      tier: ['MUD', 'STREET'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'pops_learn',
        label: 'Listen to Pops',
        description: 'Spend the afternoon learning about the neighborhood\'s history and the importance of community.',
        consequences: {
          aura: 40,
          mentalHealth: 10,
          biographyEntry: 'Learned the true history of the blocks from Arthur "Pops" Jenkins.'
        },
        setFlags: { 'rel_pops': 50, 'pops_mentor': true }
      },
      {
        id: 'pops_dismiss',
        label: 'Too Busy',
        description: 'Politely decline. You have deals to close.',
        consequences: {
          clout: 10
        }
      }
    ]
  },

  // MUD / STREET - Slick\'s Tip
  {
    id: 'char_slick_tip',
    characterId: 'char_slick',
    title: 'Slick\'s "Sure Thing"',
    description: 'Slick Reed leans against a lamp post as you pass. "Hey, hey! Just the person I wanted to see. I got a tip on a shipment of... let\'s call them \'premium electronics\'... arriving at the docks tonight. No security. Five large and we split the take. You in?"',
    trigger: {
      tier: ['MUD', 'STREET'],
      probability: 0.15,
      once: false
    },
    choices: [
      {
        id: 'slick_accept',
        label: 'Take the Tip',
        description: 'Invest $5,000 in Slick\'s scheme.',
        consequences: {
          bag: -5000
        },
        setFlags: { 'slick_deal_active': true }
      },
      {
        id: 'slick_refuse',
        label: 'Ignore Him',
        description: 'Slick\'s "sure things" usually lead to handcuffs.',
        consequences: {
          heat: -5
        }
      }
    ]
  },

  // MUD / STREET - Rosa\'s Request
  {
    id: 'char_rosa_request',
    characterId: 'char_rosa',
    title: 'Mama Rosa\'s Kitchen',
    description: 'Rosa Mendez finds you on the block. "The city is cutting funding for the youth program again," she says, her eyes flashing. "We need 2k for supplies, or these kids will be out on the street with nothing to do. You can help, right?"',
    trigger: {
      tier: ['MUD', 'STREET'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'rosa_help',
        label: 'Donate to Youth',
        description: 'Give Rosa the money for the kids.',
        consequences: {
          bag: -2000,
          aura: 60,
          biographyEntry: 'Became a local hero by funding Mama Rosa\'s youth program.'
        },
        setFlags: { 'rel_rosa': 60, 'neighborhood_hero': true }
      },
      {
        id: 'rosa_refuse',
        label: 'Can\'t Help Today',
        description: 'Explain that money is tight. Rosa doesn\'t look happy.',
        consequences: {
          aura: -20
        },
        setFlags: { 'rel_rosa': -10 }
      }
    ]
  },

  // STREET / STARTUP - Miller\'s Warning
  {
    id: 'char_miller_cop_warning',
    characterId: 'char_miller_cop',
    title: 'Officer Miller\'s Patrol',
    description: 'Officer Frank Miller pulls his cruiser alongside you. "I\'m seeing your name in places it shouldn\'t be," he says quietly. "The higher-ups are starting to notice your activities. Clean it up, or I won\'t be able to look the other way much longer."',
    trigger: {
      tier: ['STREET', 'STARTUP'],
      probability: 0.15,
      once: true
    },
    requirement: {
      stat: { type: 'heat', value: 30 }
    },
    choices: [
      {
        id: 'miller_clean_up',
        label: 'Lay Low',
        description: 'Reduce your more visible operations for a while.',
        consequences: {
          heat: -20,
          clout: -10
        },
        setFlags: { 'rel_miller': 40 }
      },
      {
        id: 'miller_ignore',
        label: 'Stay the Course',
        description: 'It\'s just business. Miller is just one cop.',
        consequences: {
          heat: 10
        },
        setFlags: { 'rel_miller': -20 }
      }
    ]
  },

  // STREET / STARTUP - J-Dog\'s Promotion
  {
    id: 'char_jdog_promo',
    characterId: 'char_jdog',
    title: 'The J-Dog Experience',
    description: 'J-Dog cornered you with a pair of headphones. "Yo, you gotta hear this new track! It\'s fire! I just need a little push to get it on the local radio. A few thousand for some... \'promotion\'... and we both go viral. What you think?"',
    trigger: {
      tier: ['STREET', 'STARTUP'],
      probability: 0.12,
      once: false
    },
    choices: [
      {
        id: 'jdog_invest',
        label: 'Invest in J-Dog',
        description: 'Give him $3,000 for "marketing".',
        consequences: {
          bag: -3000,
          clout: 20
        },
        setFlags: { 'jdog_promo_active': true }
      },
      {
        id: 'jdog_decline',
        label: 'Pass on the Track',
        description: 'You\'ve heard enough.',
        consequences: {
          mentalHealth: 5
        }
      }
    ]
  },

  // STARTUP / CORPORATE - Alistair Clark\'s Arrival
  {
    id: 'char_clark_intro',
    characterId: 'char_clark',
    title: 'Legal Scrutiny',
    description: 'Alistair Clark, "The Closer", has sent a formal inquiry regarding your recent business acquisitions. He represents a group of "concerned competitors" and is hinting at a massive antitrust lawsuit unless you "realign" your interests.',
    trigger: {
      tier: ['STARTUP', 'CORPORATE'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'clark_retain',
        label: 'Retain Clark',
        description: 'Pay him a massive retainer to switch sides and represent you instead.',
        consequences: {
          bag: -100000,
          clout: 50,
          heat: -20,
          biographyEntry: 'Turned a legal threat into a powerful asset by retaining Alistair "The Closer" Clark.'
        },
        setFlags: { 'rel_clark': 70, 'clark_ally': true }
      },
      {
        id: 'clark_fight',
        label: 'Fight the Lawsuit',
        description: 'Your own legal team says they can beat him, but it will be expensive.',
        consequences: {
          bag: -50000,
          clout: 20,
          aura: -10
        },
        setFlags: { 'rel_clark': -50, 'clark_rival': true }
      }
    ]
  },

  // STARTUP / CORPORATE - Brooke Summers\' Investment
  {
    id: 'char_summers_collab',
    characterId: 'char_summers',
    title: 'The Viral VC',
    description: 'Brooke Summers has noticed your growth and wants to feature your latest venture on her stream. "Your brand is so \'now\'," she says. "Let\'s do a collab. I invest, you get the clout, and we both win."',
    trigger: {
      tier: ['STARTUP', 'CORPORATE'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'summers_accept',
        label: 'Partner with Summers',
        description: 'Accept the investment and the public exposure.',
        consequences: {
          bag: 200000,
          clout: 150,
          aura: 50
        },
        setFlags: { 'rel_summers': 80, 'summers_partner': true }
      },
      {
        id: 'summers_decline',
        label: 'Stay Independent',
        description: 'You don\'t want your business model dictated by social media trends.',
        consequences: {
          clout: 20
        },
        setFlags: { 'rel_summers': 10 }
      }
    ]
  },

  // CORPORATE / ELITE - Julian Vane\'s Master Plan
  {
    id: 'char_julian_intro',
    characterId: 'char_julian',
    title: 'The Architect\'s Vision',
    description: 'Julian Vane, "The Architect", presents a plan for a new "Elite District" that would require clearing out parts of your old neighborhood. He wants your backing to secure the necessary zoning changes.',
    trigger: {
      tier: ['CORPORATE', 'ELITE'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'julian_back',
        label: 'Support the District',
        description: 'The profits from the new development would be astronomical.',
        consequences: {
          bag: 1000000,
          clout: 200,
          aura: -300
        },
        setFlags: { 'rel_julian': 80, 'architect_ally': true }
      },
      {
        id: 'julian_oppose',
        label: 'Oppose Development',
        description: 'Protect the neighborhood. Julian won\'t forget this.',
        consequences: {
          aura: 400,
          clout: -100
        },
        setFlags: { 'rel_julian': -100, 'architect_rival': true }
      }
    ]
  },

  // ELITE / MOGUL - Selena Rosso\'s Endorsement
  {
    id: 'char_selena_endorse',
    characterId: 'char_selena',
    title: 'The Pop Star\'s Plea',
    description: 'Selena Rosso reaches out. She\'s launching a global initiative for "Digital Freedom" and wants you to be the primary corporate sponsor. "You have the resources to make this real," she tells you.',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'selena_sponsor',
        label: 'Sponsor the Initiative',
        description: 'Commit $5M to the cause. Your Aura will be legendary.',
        consequences: {
          bag: -5000000,
          aura: 1000,
          clout: 300,
          biographyEntry: 'Partnered with pop star Selena Rosso to launch the Global Digital Freedom initiative.'
        },
        setFlags: { 'rel_selena': 100, 'digital_freedom_hero': true }
      },
      {
        id: 'selena_refuse',
        label: 'Decline Sponsorship',
        description: 'It\'s too expensive and too controversial.',
        consequences: {
          bag: 1000000,
          aura: -50
        }
      }
    ]
  },

  // MOGUL / PRESIDENT - General Whitaker\'s Briefing
  {
    id: 'char_whitaker_brief',
    characterId: 'char_whitaker',
    title: 'National Security Briefing',
    description: 'General Silas Whitaker requests a private meeting. "The situation in the East is deteriorating," he says. "We need your manufacturing base to pivot to defense production immediately. It\'s a matter of national survival."',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'whitaker_defense',
        label: 'Pivot to Defense',
        description: 'Convert your factories. The government contracts are lucrative, but the world gets more dangerous.',
        consequences: {
          bag: 10000000,
          clout: 500,
          aura: -200
        },
        setFlags: { 'rel_whitaker': 80, 'military_industrial_complex': true }
      },
      {
        id: 'whitaker_refuse',
        label: 'Maintain Civilian Focus',
        description: 'Refuse to become a war profiteer.',
        consequences: {
          aura: 500,
          clout: -200
        },
        setFlags: { 'rel_whitaker': -30 }
      }
    ]
  },

  // PRESIDENT - Judge Holloway\'s Ruling
  {
    id: 'char_holloway_ruling',
    characterId: 'char_holloway',
    title: 'The Supreme Challenge',
    description: 'Judge Margaret Holloway is presiding over a case that could dismantle your primary executive order. Her ruling depends on your ability to provide "unassailable legal justification".',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'holloway_legal_warfare',
        label: 'Intense Legal Defense',
        description: 'Spend $20M on the best legal scholars to sway the court.',
        consequences: {
          bag: -20000000,
          clout: 500
        },
        setFlags: { 'holloway_swayed': true }
      },
      {
        id: 'holloway_accept',
        label: 'Accept the Ruling',
        description: 'Let the court decide. If you lose, your power is significantly diminished.',
        consequences: {
          aura: 200,
          clout: -500
        }
      }
    ]
  },

  // PRESIDENT - Director Blackwood\'s Secrets
  {
    id: 'char_blackwood_secrets',
    characterId: 'char_blackwood',
    title: 'The Spymaster\'s Offer',
    description: 'Director Elias Blackwood places a folder on your desk. "Your political rival is... vulnerable," he says. "I can make this information go public, or I can bury it. Depending on your next budget allocation for my department."',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'blackwood_leak',
        label: 'Leak the Info',
        description: 'Destroy your rival. But now Blackwood owns you.',
        consequences: {
          clout: 1000,
          aura: -500,
          heat: 50
        },
        setFlags: { 'rel_blackwood': 100, 'blackwood_debt': true }
      },
      {
        id: 'blackwood_refuse',
        label: 'Bury the Folder',
        description: 'You won\'t play his games.',
        consequences: {
          aura: 500,
          mentalHealth: -20
        },
        setFlags: { 'rel_blackwood': -50 }
      }
    ]
  },

  // MOGUL / PRESIDENT - Marcus Stone\'s Strategy
  {
    id: 'char_stone_strategy',
    characterId: 'char_stone',
    title: 'The Kingmaker\'s Plan',
    description: 'Marcus Stone has a plan to guarantee your election. "We don\'t need to win hearts," he says, grinning. "We just need to make them hate the other guy more. I need $50M for a \'saturated media campaign\'."',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'stone_hire',
        label: 'Hire Stone',
        description: 'Launch the smear campaign.',
        consequences: {
          bag: -50000000,
          clout: 1500,
          aura: -800
        },
        setFlags: { 'rel_stone': 80, 'kingmaker_active': true }
      },
      {
        id: 'stone_refuse',
        label: 'Run a Clean Race',
        description: 'Stone is too dirty, even for you.',
        consequences: {
          aura: 500,
          clout: 200
        }
      }
    ]
  },

  // PRESIDENT - Secretary Valdez\'s Trade Deal
  {
    id: 'char_valdez_deal',
    characterId: 'char_valdez',
    title: 'The Grand Bargain',
    description: 'Secretary Elena Valdez has negotiated a historic trade deal with the Eastern Bloc. "It will stabilize the global economy for a decade," she says. "But it requires significant domestic concessions that will anger your base."',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'valdez_sign',
        label: 'Sign the Deal',
        description: 'Global stability at a domestic cost.',
        consequences: {
          aura: 1000,
          clout: 500,
          bag: 20000000
        },
        setFlags: { 'rel_valdez': 100, 'global_stabilizer': true }
      },
      {
        id: 'valdez_refuse',
        label: 'Protect Domestic Interests',
        description: 'Refuse the deal. Your base will love it, but the world gets more volatile.',
        consequences: {
          clout: 800,
          aura: -300
        },
        setFlags: { 'rel_valdez': -20 }
      }
    ]
  },

  // MOGUL / PRESIDENT - William Thornton\'s Narrative
  {
    id: 'char_thornton_narrative',
    characterId: 'char_thornton',
    title: 'Media Monopoly',
    description: 'William Thornton is offering to make his networks "extremely favorable" to your administration. "I can make you a saint or a sinner," he laughs. "All I want is the repeal of the new media ownership laws."',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'thornton_agree',
        label: 'Repeal the Laws',
        description: 'Give Thornton what he wants for total narrative control.',
        consequences: {
          clout: 1000,
          aura: 200,
          heat: 40
        },
        setFlags: { 'rel_thornton': 80, 'media_monopoly_active': true }
      },
      {
        id: 'thornton_refuse',
        label: 'Enforce the Laws',
        description: 'Thornton\'s networks will now be your greatest enemy.',
        consequences: {
          aura: 500,
          clout: -500
        },
        setFlags: { 'rel_thornton': -100, 'media_warfare': true }
      }
    ]
  },

  // MOGUL / PRESIDENT - Diana Ross\'s Audit
  {
    id: 'char_ross_audit',
    characterId: 'char_ross',
    title: 'The Hammer Falls',
    description: 'Diana Ross has arrived at your headquarters with a federal warrant. "There are... irregularities... in your offshore accounts," she says, her voice like ice. "I can spend the next year digging, or we can reach a settlement now."',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.15,
      once: true
    },
    requirement: {
      stat: { type: 'heat', value: 70 }
    },
    choices: [
      {
        id: 'ross_settle',
        label: 'Pay the Settlement',
        description: 'Pay a massive $100M fine to end the investigation.',
        consequences: {
          bag: -100000000,
          heat: -80,
          aura: -200
        }
      },
      {
        id: 'ross_fight',
        label: 'Fight the Audit',
        description: 'Use your political power to slow down the investigation. Extremely risky.',
        consequences: {
          heat: 30,
          clout: 200,
          aura: -500
        }
      }
    ]
  },

  // PRESIDENT - Dr. Adler\'s Model
  {
    id: 'char_adler_model',
    characterId: 'char_adler',
    title: 'Economic Equilibrium',
    description: 'Dr. Hans Adler has developed a new economic model that could eliminate inflation entirely. "It requires a complete overhaul of the tax system," he explains. "The wealthy will pay more, but the system will be unbreakable."',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'adler_implement',
        label: 'Implement the Model',
        description: 'A gamble for long-term stability.',
        consequences: {
          aura: 1500,
          bag: -50000000,
          clout: -500
        },
        setFlags: { 'adler_economics_active': true }
      },
      {
        id: 'adler_refuse',
        label: 'Too Radical',
        description: 'Stick to traditional economic policies.',
        consequences: {
          clout: 300,
          aura: -100
        }
      }
    ]
  },

  // MOGUL / PRESIDENT - Anya Singh\'s Space Race
  {
    id: 'char_singh_space',
    characterId: 'char_singh',
    title: 'The Final Frontier',
    description: 'Anya Singh wants to partner with your administration to establish the first permanent lunar colony. "History won\'t remember your trade deals," she says. "It will remember this."',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'singh_partner',
        label: 'Fund the Colony',
        description: 'Commit $500M to the lunar project.',
        consequences: {
          bag: -500000000,
          aura: 2000,
          clout: 1000,
          biographyEntry: 'Solidified a place in history by funding the first permanent lunar colony with Anya Singh.'
        },
        setFlags: { 'lunar_colony_active': true, 'rel_singh': 100 }
      },
      {
        id: 'singh_refuse',
        label: 'Focus on Earth',
        description: 'We have enough problems down here.',
        consequences: {
          bag: 100000000,
          aura: -200
        }
      }
    ]
  },

  // MOGUL / PRESIDENT - Ivan Morozov\'s Threat
  {
    id: 'char_morozov_threat',
    characterId: 'char_morozov',
    title: 'Oligarch\'s Gambit',
    description: 'Ivan Morozov has started aggressively shorting your companies while launching cyberattacks on your infrastructure. "The world isn\'t big enough for two titans," he sends in a simple, encrypted text.',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'morozov_counter',
        label: 'Launch Counter-Offensive',
        description: 'Use your intelligence assets to seize his foreign holdings.',
        consequences: {
          bag: -50000000,
          clout: 800,
          heat: 40
        },
        setFlags: { 'morozov_war_active': true, 'rel_morozov': -100 }
      },
      {
        id: 'morozov_negotiate',
        label: 'Negotiate a Truce',
        description: 'Pay him off to leave you alone.',
        consequences: {
          bag: -200000000,
          clout: -500,
          aura: -200
        }
      }
    ]
  },

  // MOGUL / PRESIDENT - Sarah Lane\'s Protest
  {
    id: 'char_lane_protest',
    characterId: 'char_lane',
    title: 'Voice of the People',
    description: 'Sarah Lane has organized a massive, peaceful protest outside your gates. "You forgot where you came from!" she shouts to the crowd. She is demanding an audience to discuss your impact on the working class.',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'lane_meet',
        label: 'Meet with Lane',
        description: 'Listen to her demands. It will show empathy but might look weak to your donors.',
        consequences: {
          aura: 800,
          clout: -300
        },
        setFlags: { 'rel_lane': 80, 'lane_ally': true }
      },
      {
        id: 'lane_disperse',
        label: 'Disperse the Crowd',
        description: 'Order the security teams to clear the area. Order must be maintained.',
        consequences: {
          clout: 500,
          aura: -1000,
          heat: 60
        },
        setFlags: { 'rel_lane': -100, 'lane_enemy': true }
      }
    ]
  },

  // STARTUP / CORPORATE - Cassie\'s Intel
  {
    id: 'char_cassie_intel',
    characterId: 'char_cassie',
    title: 'Cassie\'s Information Exchange',
    description: 'Cassie Thorne reaches out. "I\'ve heard some interesting rumors about your newest competitor," she says, leaning over the counter. "For a small fee, I can tell you exactly where they\'re vulnerable."',
    trigger: {
      tier: ['STARTUP', 'CORPORATE'],
      probability: 0.15,
      once: false
    },
    choices: [
      {
        id: 'cassie_buy',
        label: 'Buy the Intel',
        description: 'Pay $10,000 for the information.',
        consequences: {
          bag: -10000,
          clout: 50
        },
        setFlags: { 'rel_cassie': 40 }
      },
      {
        id: 'cassie_ignore',
        label: 'Don\'t Need It',
        description: 'You prefer to do your own research.',
        consequences: {
          aura: 10
        }
      }
    ]
  },

  // MUD / STREET - Vinnie\'s Collection
  {
    id: 'char_vinnie_collection',
    characterId: 'char_vinnie',
    title: 'Vinnie\'s Visit',
    description: 'Vincent "Vinnie" Moretti finds you. "My boss says your recent... activities... are cutting into our business," he says, sounding almost apologetic. "He wants a 10% \'neighborhood tax\' on your next haul. Just to keep things friendly."',
    trigger: {
      tier: ['MUD', 'STREET'],
      probability: 0.15,
      once: false
    },
    choices: [
      {
        id: 'vinnie_pay',
        label: 'Pay the Tax',
        description: 'Better to keep Vinnie friendly.',
        consequences: {
          bag: -1000,
          aura: -10
        },
        setFlags: { 'rel_vinnie': 30 }
      },
      {
        id: 'vinnie_refuse',
        label: 'Refuse to Pay',
        description: 'You don\'t pay taxes to thugs. Vinnie looks disappointed.',
        consequences: {
          clout: 30,
          heat: 5
        },
        setFlags: { 'rel_vinnie': -40 }
      }
    ]
  },

  // MUD / STREET - Beatrice\'s Clinic
  {
    id: 'char_beatrice_clinic',
    characterId: 'char_beatrice',
    title: 'Clinic Crisis',
    description: 'Beatrice Vance meets you outside the clinic. "We\'re out of basic antibiotics," she says, her voice trembling with exhaustion. "The distributor won\'t ship until we pay the back-bill. It\'s 5k. Please."',
    trigger: {
      tier: ['MUD', 'STREET'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'beatrice_fund',
        label: 'Fund the Clinic',
        description: 'Pay the clinic\'s debt. Save lives.',
        consequences: {
          bag: -5000,
          aura: 150
        },
        setFlags: { 'rel_beatrice': 80, 'clinic_savior': true }
      },
      {
        id: 'beatrice_refuse',
        label: 'Can\'t Help',
        description: 'It\'s not your responsibility. Beatrice just nods and walks away.',
        consequences: {
          aura: -50
        }
      }
    ]
  },

  // STREET / STARTUP - Ray\'s Security
  {
    id: 'char_ray_security',
    characterId: 'char_ray',
    title: 'Sarge\'s Solution',
    description: 'Raymond "Sarge" Strode offers to upgrade your physical security. "Your current setup is amateur hour," he grunts. "One professional team could wipe you out in five minutes. Let me handle it. I need 20k for equipment and training."',
    trigger: {
      tier: ['STREET', 'STARTUP'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'ray_hire',
        label: 'Hire Sarge',
        description: 'Upgrade your security protocols.',
        consequences: {
          bag: -20000,
          heat: -30,
          clout: 30
        },
        setFlags: { 'rel_ray': 60, 'sarge_security_active': true }
      },
      {
        id: 'ray_refuse',
        label: 'Stay Low-Tech',
        description: 'You\'ve been fine so far.',
        consequences: {
          bag: 5000
        }
      }
    ]
  },

  // STREET / STARTUP - Lexi\'s Mural
  {
    id: 'char_lexi_mural',
    characterId: 'char_lexi',
    title: 'The Muralist\'s Mark',
    description: 'Lexi Chen wants to paint a massive mural on the side of your main building. "It will tell the story of the block," she says. "But I need you to promise you won\'t let the city paint over it."',
    trigger: {
      tier: ['STREET', 'STARTUP'],
      probability: 0.15,
      once: true
    },
    choices: [
      {
        id: 'lexi_permit',
        label: 'Authorize the Mural',
        description: 'Give Lexi the space and the protection.',
        consequences: {
          aura: 100,
          clout: 40
        },
        setFlags: { 'rel_lexi': 70, 'lexi_mural_active': true }
      },
      {
        id: 'lexi_refuse',
        label: 'No Murals',
        description: 'You need to maintain a professional corporate image.',
        consequences: {
          clout: 20,
          aura: -20
        }
      }
    ]
  }
];
