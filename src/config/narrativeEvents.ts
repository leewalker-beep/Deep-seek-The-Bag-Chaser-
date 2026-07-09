import type { NarrativeEvent } from '../types/game';

const BASE_EVENTS: NarrativeEvent[] = [
  // STREET KID / SCAVENGER - MUD/STREET
  {
    id: 'scavenger_prototype',
    title: 'The Prototype',
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    arcId: 'arc_investor',
    title: 'A Risky Proposal',
    pacingCategory: 'MAJOR',
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
    arcId: 'arc_investor',
    title: 'The Architect Returns',
    pacingCategory: 'MAJOR',
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
    arcId: 'arc_investor',
    title: 'Architect\'s Retribution',
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    arcId: 'arc_syndicate',
    title: 'The Whispering Hand',
    pacingCategory: 'MAJOR',
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
    arcId: 'arc_syndicate',
    title: 'Syndicate Escalation',
    pacingCategory: 'MAJOR',
    description: 'The Whispering Hand is being squeezed by a federal crackdown. "The logistics you provided for the \'special cargo\' were perfect," your contact says. "Now we need something bigger. We need you to wash a massive amount of capital through your ventures immediately. The feds are watching every other door."',
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
    arcId: 'arc_syndicate',
    title: 'Cole\'s Pursuit',
    pacingCategory: 'MAJOR',
    description: 'Detective Silas Cole corners you in a parking garage. "I\'ve been watching those \'special shipments\' through your warehouses," he says, lighting a cigarette. "The Whispering Hand is a sinking ship. You can go down with them, or you can tell me everything I want to know about their logistics. Your choice."',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'MAJOR',
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
    pacingCategory: 'RIVAL',
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
    pacingCategory: 'RIVAL',
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
    pacingCategory: 'PRESIDENCY',
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
    pacingCategory: 'PRESIDENCY',
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
    pacingCategory: 'PRESIDENCY',
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
    arcId: 'arc_marcus',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_marcus',
    pacingCategory: 'CHARACTER',
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
        setFlags: { 'rel_marcus': 70, 'trust_marcus': 120, 'marcus_2_done': true }
      },
      {
        id: 'marcus_decline_crime',
        label: 'Refuse Crime',
        description: 'You\'re going legit. You can\'t risk the heat.',
        consequences: {
          aura: 30,
          heat: -10
        },
        setFlags: { 'rel_marcus': 40, 'trust_marcus': 80, 'marcus_2_done': true }
      }
    ]
  },

  // Ashley Weaver Chain
  {
    id: 'char_ashley_1',
    characterId: 'char_ashley',
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
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
        setFlags: { 'rel_ashley': 80, 'trust_ashley': 100, 'kane_weakened': true, 'ashley_2_done': true }
      },
      {
        id: 'ashley_leak_refuse',
        label: 'Protect Yourself',
        description: 'Kane is dangerous. You can\'t be seen helping the press.',
        consequences: {
          aura: 20,
          clout: -20
        },
        setFlags: { 'rel_ashley': 10, 'trust_ashley': 30, 'ashley_2_done': true }
      }
    ]
  },

  {
    id: 'char_marcus_3',
    characterId: 'char_marcus',
    arcId: 'arc_marcus',
    pacingCategory: 'CHARACTER',
    title: 'Mook\'s Moment',
    description: 'Marcus finds you at your new office, whistling as he looks at the high-end decor. "Remember when we were just dodging Officer Miller for a few scraps?" he asks, his eyes sweeping the room. "You made it. Question is — you still you, or did you leave that kid in the Mud?"',
    trigger: {
      tier: ['CORPORATE'],
      probability: 0.2,
      once: true,
      flagReqs: { 'marcus_2_done': true }
    },
    choices: [
      {
        id: 'keep_him_close',
        label: 'Give him a role',
        description: 'Marcus joins your operation. Loyalty costs nothing. Disloyalty costs everything.',
        consequences: {
          clout: -20,
          aura: 40,
          mentalHealth: 10
        },
        setFlags: { 'marcus_3_done': true }
      },
      {
        id: 'cut_ties_marcus',
        label: 'This world isn\'t for him',
        description: 'You let him go with $5K and an excuse. He nods like he expected it.',
        consequences: {
          bag: -5000,
          mentalHealth: -15
        },
        setFlags: { 'marcus_3_done': true }
      }
    ]
  },
  {
    id: 'char_ashley_3',
    characterId: 'char_ashley',
    pacingCategory: 'MAJOR',
    title: 'The Expose',
    description: 'Ashley Weaver has been watching your rise. Now she\'s at your door with a recorder. "Off the record," she says. "How much of this was legal?"',
    trigger: {
      tier: ['ELITE'],
      probability: 0.2,
      once: true,
      flagReqs: { 'ashley_2_done': true }
    },
    choices: [
      {
        id: 'go_on_record',
        label: 'Give her the interview',
        description: 'The story runs. The spin is yours. Aura skyrockets but heat follows.',
        consequences: {
          aura: 100,
          heat: 15,
          clout: 50
        },
        setFlags: { 'ashley_3_done': true }
      },
      {
        id: 'shut_it_down',
        label: 'Buy the story',
        description: 'It costs you $500K but the article never runs. Ashley looks at you differently now.',
        consequences: {
          bag: -500000,
          heat: -10,
          aura: -30
        },
        setFlags: { 'ashley_3_done': true }
      }
    ]
  },
  {
    id: 'char_marcus_4',
    characterId: 'char_marcus',
    arcId: 'arc_marcus',
    pacingCategory: 'MAJOR',
    title: 'Old Debt',
    description: 'A courier leaves a handwritten note on your desk. It\'s from Mook. "I never liked asking for help, and I\'m not asking now," it reads. Word on the street is he\'s in deep with the Southern Cartel. After everything you\'ve been through since the early days, you know he won\'t survive without a massive bailout.',
    trigger: {
      tier: ['MOGUL'],
      probability: 0.2,
      once: true,
      flagReqs: { 'marcus_3_done': true }
    },
    choices: [
      {
        id: 'pay_the_debt',
        label: 'Handle it — no questions',
        description: 'You wire $2M and don\'t ask where it goes. Some debts you just pay.',
        consequences: {
          bag: -2000000,
          aura: 80,
          mentalHealth: 15
        },
        setFlags: { 'marcus_4_done': true }
      },
      {
        id: 'look_away',
        label: 'You can\'t get involved',
        description: 'You tell yourself it\'s business. The nightmares disagree.',
        consequences: {
          mentalHealth: -30,
          aura: -50
        },
        setFlags: { 'marcus_4_done': true }
      }
    ]
  },
  {
    id: 'char_ashley_4',
    characterId: 'char_ashley',
    pacingCategory: 'CHARACTER',
    title: 'Legacy on Record',
    description: 'Ashley is writing a book. She wants a foreword from you. The working title is "How They Really Did It." Your name is chapter one.',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.2,
      once: true,
      flagReqs: { 'ashley_3_done': true }
    },
    choices: [
      {
        id: 'write_the_foreword',
        label: 'Let history remember you',
        description: 'The book becomes a bestseller. You\'re quoted in every business school.',
        consequences: {
          clout: 500,
          aura: 200
        },
        setFlags: { 'ashley_4_done': true }
      },
      {
        id: 'decline',
        label: 'Stay in the shadows',
        description: 'Power you can\'t see is the only power worth having.',
        consequences: {
          heat: -20,
          aura: 100
        },
        setFlags: { 'ashley_4_done': true }
      }
    ]
  },

  // Detective Cole Chain
  {
    id: 'char_cole_1',
    characterId: 'char_cole',
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
    title: 'Chen\'s Entrance',
    description: 'Lawrence Chen has noticed your growth. "You have potential," he says, leaning back in his leather chair. "But potential is just another word for someone who hasn\'t made it yet. I can provide 500k, but I want a seat on your board."',
    trigger: {
      tier: ['STARTUP', 'CORPORATE'],
      probability: 0.2,
      once: true
    },
    choices: [
      {
        id: 'chen_accept_sk',
        label: 'Accept Chen (Origins)',
        description: 'Acknowledge your street roots and take the deal.',
        requirement: { background: ['sk_scrap', 'sk_delivery'] },
        consequences: {
          bag: 500000,
          clout: 120,
          aura: -10,
          biographyEntry: 'Lawrence Chen took a chance on a kid from the Mud, seeing the raw hunger beneath the suit.'
        },
        setFlags: { 'rel_chen': 60, 'trust_chen': 40, 'chen_on_board': true }
      },
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
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
    title: 'Legacy Conflict',
    description: 'Maya visits you in your new office, looking at the city view. "I remember when we just wanted enough for Mama Rosa\'s groceries," she says quietly. "Now you own the block, and the people on it. Is this really the legacy you want to leave?"',
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
        setFlags: { 'maya_dismissed': true, 'rel_maya': 10, 'maya_betrayed': true }
      }
    ]
  },
  {
    id: 'char_maya_5',
    characterId: 'char_maya',
    pacingCategory: 'CHARACTER',
    title: 'The Vane Foundation',
    description: 'Your final decision on the future of the Vane family legacy. Will you use your power to lift others, or to secure your own throne?',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT', 'OPEN'],
      probability: 0.3,
      once: true,
      flagReqs: { 'rel_maya': 10, 'maya_betrayed': false }
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
    id: 'char_maya_opposition',
    characterId: 'char_maya',
    pacingCategory: 'CHARACTER',
    title: 'The Senator\'s Wrath',
    description: 'Senator Maya Vane has launched a public investigation into your conglomerate\'s labor practices. "I told you I wouldn\'t let you destroy this city," she tells the cameras, her eyes cold. She isn\'t your little sister anymore; she\'s your most dangerous political enemy.',
    trigger: {
      tier: ['ELITE', 'MOGUL'],
      probability: 0.25,
      once: true,
      flagReqs: { 'maya_betrayed': true }
    },
    choices: [
      {
        id: 'maya_bribe_senate',
        label: 'Lobby the Senate',
        description: 'Spend $5M to bury the investigation through her colleagues.',
        consequences: {
          bag: -5000000,
          clout: 100,
          aura: -500,
          heat: 50,
          biographyEntry: 'Ruthlessly suppressed a Senate investigation led by their own sister.'
        },
        setFlags: { 'maya_silenced': true }
      },
      {
        id: 'maya_public_concession',
        label: 'Public Concession',
        description: 'Accept her terms and reform your labor practices.',
        consequences: {
          passiveCash: -50000,
          aura: 1000,
          clout: -200,
          biographyEntry: 'Was forced into a humiliating public retreat by Senator Maya Vane.'
        },
        setFlags: { 'maya_victory': true }
      }
    ]
  },
  {
    id: 'char_victor_1',
    characterId: 'char_victor',
    pacingCategory: 'RIVAL',
    title: 'Kane\'s Ultimatum',
    description: 'Victor Kane invites you to his penthouse. "You\'re becoming a nuisance," he says, pouring a drink without looking at you. "I remember when you were just another body in the Mud. Now you\'re a distraction. Sell me your core business now for 2M, or I will dismantle everything you\'ve built."',
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
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'CHARACTER',
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
    pacingCategory: 'MAJOR',
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
    arcId: 'arc_pops',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_slick',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_rosa',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_miller',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_jdog',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_clark',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_summers',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_vane',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_selena_freedom',
    pacingCategory: 'CHARACTER',
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
    arcId: 'arc_whitaker',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_holloway_ruling',
    characterId: 'char_holloway',
    arcId: 'arc_holloway',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_blackwood_secrets',
    characterId: 'char_blackwood',
    arcId: 'arc_blackwood',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_stone_strategy',
    characterId: 'char_stone',
    arcId: 'arc_stone',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_valdez_deal',
    characterId: 'char_valdez',
    arcId: 'arc_valdez',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_thornton_narrative',
    characterId: 'char_thornton',
    arcId: 'arc_thornton',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_ross_audit',
    characterId: 'char_ross',
    arcId: 'arc_ross_audit',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_adler_model',
    characterId: 'char_adler',
    arcId: 'arc_adler',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_singh_space',
    characterId: 'char_singh',
    arcId: 'arc_singh',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_morozov_threat',
    characterId: 'char_morozov',
    arcId: 'arc_morozov',
    pacingCategory: 'RIVAL',
    title: 'Oligarch\'s Gambit',
    description: 'Ivan Morozov has started aggressively shorting your companies while launching cyberattacks on your infrastructure. "I watched you break Victor Kane," he sends in a simple, encrypted text. "But Kane was a pet. The world isn\'t big enough for two real titans."',
    trigger: {
      tier: ['MOGUL', 'PRESIDENT'],
      probability: 0.15,
      once: true,
      flagReqs: { 'kane_defeated': true }
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

  {
    id: 'char_lane_protest',
    characterId: 'char_lane',
    arcId: 'arc_lane',
    pacingCategory: 'PRESIDENCY',
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

  {
    id: 'char_cassie_intel',
    characterId: 'char_cassie',
    arcId: 'arc_cassie',
    pacingCategory: 'CHARACTER',
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

  {
    id: 'char_vinnie_collection',
    characterId: 'char_vinnie',
    arcId: 'arc_vinnie',
    pacingCategory: 'CHARACTER',
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

  {
    id: 'char_beatrice_clinic',
    characterId: 'char_beatrice',
    arcId: 'arc_beatrice',
    pacingCategory: 'CHARACTER',
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

  {
    id: 'char_ray_security',
    characterId: 'char_ray',
    arcId: 'arc_ray',
    pacingCategory: 'CHARACTER',
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

  {
    id: 'char_lexi_mural',
    characterId: 'char_lexi',
    arcId: 'arc_lexi',
    pacingCategory: 'CHARACTER',
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


const POPS_ARC: NarrativeEvent[] = [
  {
    id: "char_pops_1_the_reunion",
    characterId: "char_pops",
    arcId: "arc_pops",
    title: "The Reunion",
    description: "Arthur 'Pops' Jenkins is waiting for you in the old community garden. \"I knew you'd come back to the block,\" he says. \"The question is, are you here to take, or to give back?\"",
    trigger: { tier: ["STREET", "STARTUP"], probability: 0.2, once: true },
    choices: [
      {
        id: "pops_give_back",
        label: "Invest in the Garden",
        description: "Donate $10k to save the community garden.",
        consequences: { bag: -10000, aura: 100 },
        setFlags: { "pops_mentor": true, "rel_pops": 100 }
      },
      {
        id: "pops_take",
        label: "Eyes on the Prize",
        description: "Tell Pops you're here to build a legacy, not grow tomatoes.",
        consequences: { clout: 50, aura: -20 },
        setFlags: { "pops_mentor": false, "rel_pops": 40 }
      }
    ]
  },
  {
    id: "char_pops_2_threat",
    characterId: "char_pops",
    arcId: "arc_pops",
    title: "The Developers",
    description: "\"Remember when you invested in this dirt?\" Pops says, gesturing to the thriving garden. \"Well, the suits noticed too. Corporate developers want the land. They offered me a payout to leave, but this land is our history.\"",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.2, once: true, flagReqs: { "pops_mentor": true } },
    choices: [
      {
        id: "pops_legal_aid",
        label: "Hire Legal Defense",
        description: "Spend $50k on the best lawyers to block the development.",
        consequences: { bag: -50000, aura: 200, clout: 50 },
        setFlags: { "pops_garden_status": "protected" }
      },
      {
        id: "pops_intimidate",
        label: "Street Justice",
        description: "Use your clout to 'persuade' the developers to look elsewhere.",
        consequences: { clout: 100, heat: 30, aura: -50 },
        setFlags: { "pops_garden_status": "street_protected" }
      }
    ]
  },
  {
    id: "char_pops_3_expansion",
    characterId: "char_pops",
    arcId: "arc_pops",
    title: "Pops' Legacy Hub",
    description: "The garden is safe, but Pops isn't done. \"We protected the roots,\" he says, leaning on his shovel. \"Now let's build the branches. I want to turn this place into a youth training center. Teach them how to hustle the right way.\"",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "pops_garden_status": "protected" } },
    choices: [
      {
        id: "pops_fund_hub",
        label: "Fund the Hub",
        description: "Donate $250k for a state-of-the-art center.",
        consequences: { bag: -250000, aura: 500, biographyEntry: "Funded Pops' Youth Legacy Hub, changing the future of the district." },
        setFlags: { "pops_hub_active": true }
      }
    ]
  },
  {
    id: "char_pops_mogul_reflection",
    characterId: "char_pops",
    arcId: "arc_pops",
    title: "The Old Man's Visit",
    description: "Pops arrives at your skyscraper, looking out of place in his gardening overalls. He looks at your view of the city. \"I remember when you were just a kid with a bike and a dream, chasing bags in the Mud. You've built a mountain of gold, kid. I just hope you can still see the ground from up here.\"",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "pops_mentor": true } },
    choices: [
      {
        id: "pops_reflect_roots",
        label: "Remember the Roots",
        description: "Spend the evening talking about the old block.",
        consequences: { aura: 100, mentalHealth: 30, biographyEntry: "Pops visited the peak of the empire, reminding you that no matter how high you rise, you are still a kid from the blocks." },
        setFlags: { "pops_legacy_sealed": true }
      },
      {
        id: "pops_reflect_power",
        label: "The View is Better Here",
        description: "Explain that the Mud is the past. Power is the future.",
        consequences: { clout: 100, aura: -50, biographyEntry: "Pops left the corporate office with a heavy heart, seeing that the kid he knew had been replaced by a titan." },
        setFlags: { "pops_alienated": true }
      }
    ]
  }
];

const TWITCH_ARC: NarrativeEvent[] = [
  {
    id: "char_twitch_1_data_leak",
    characterId: "char_twitch",
    arcId: "arc_twitch",
    title: "The Twitch Signal",
    description: "Twitch slides a drive across the counter. \"Found a hole in the city's traffic grid.\"",
    trigger: { tier: ["STREET", "STARTUP"], probability: 0.2, once: true },
    choices: [
      {
        id: "twitch_sync_grid",
        label: "Sync the Grid",
        description: "Pay $5k for the exploit.",
        consequences: { bag: -5000, passiveCash: 200, heat: 10 },
        setFlags: { "twitch_partner": true, "rel_twitch": 80 }
      }
    ]
  },
  {
    id: "char_twitch_2_surveillance",
    characterId: "char_twitch",
    arcId: "arc_twitch",
    title: "Eye in the Sky",
    description: "Twitch has tapped into the regional surveillance network.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.2, once: true, flagReqs: { "twitch_partner": true } },
    choices: [
      {
        id: "twitch_buy_eye",
        label: "Buy the System",
        description: "Install the early-warning system.",
        consequences: { bag: -50000, heat: -50 },
        setFlags: { "twitch_eye_active": true }
      }
    ]
  },
  {
    id: "char_twitch_3_mainframe_exploit",
    characterId: "char_twitch",
    arcId: "arc_twitch",
    title: "The Central Mainframe",
    description: "Twitch is shaking. \"I found it. The back-door to the city's financial mainframe.\"",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "twitch_eye_active": true } },
    choices: [
      {
        id: "twitch_hack_mainframe",
        label: "Execute the Siphon",
        description: "Start the diversion.",
        consequences: { passiveCash: 50000, heat: 80, biographyEntry: "Masterminded a global financial siphon with the hacker known as Twitch." },
        setFlags: { "twitch_arc_complete": "hacked" }
      }
    ]
  }
];

const SLICK_ARC: NarrativeEvent[] = [
  {
    id: "char_slick_1_consignment",
    characterId: "char_slick",
    arcId: "arc_slick",
    title: "Slick's Side Hustle",
    description: "Slick Reed has a shipment of 'liberated' tech parts.",
    trigger: { tier: ["STREET", "STARTUP"], probability: 0.2, once: true },
    choices: [
      {
        id: "slick_consignment_accept",
        label: "Accept Consignment",
        description: "Move the hot goods.",
        consequences: { bag: 20000, heat: 25 },
        setFlags: { "slick_partner": true, "rel_slick": 70 }
      }
    ]
  },
  {
    id: "char_slick_2_warehouse",
    characterId: "char_slick",
    arcId: "arc_slick",
    title: "Slick's Secret Warehouse",
    description: "Slick found a federal seized-property warehouse.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.15, once: true, flagReqs: { "slick_partner": true } },
    choices: [
      {
        id: "slick_heist",
        label: "Authorize the Heist",
        description: "Hit the warehouse.",
        consequences: { bag: 250000, heat: 40 },
        setFlags: { "slick_heist_done": true }
      }
    ]
  },
  {
    id: "char_slick_3_retirement",
    characterId: "char_slick",
    arcId: "arc_slick",
    title: "Slick's Last Score",
    description: "Slick wants to go legitimate.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "slick_heist_done": true } },
    choices: [
      {
        id: "slick_go_legit",
        label: "Clean the Operation",
        description: "Invest $500k to legalize the logistics network.",
        consequences: { bag: -500000, heat: -100, passiveCash: 5000, biographyEntry: "Helped the notorious Slick go legitimate." },
        setFlags: { "slick_arc_complete": "legit" }
      }
    ]
  }
];

const ROSA_ARC: NarrativeEvent[] = [
  {
    id: "char_rosa_1_strike",
    characterId: "char_rosa",
    arcId: "arc_rosa",
    title: "The Union Call",
    description: "Rosa is organizing your warehouse workers.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.15, once: true },
    choices: [
      {
        id: "rosa_concede",
        label: "Concede to Demands",
        description: "Improve conditions.",
        consequences: { passiveCash: -2000, aura: 200 },
        setFlags: { "rosa_union_active": true, "rel_rosa": 100 }
      },
      {
        id: "rosa_break",
        label: "Break the Union",
        description: "Hire private security.",
        consequences: { bag: -10000, aura: -300, clout: 100, heat: 20 },
        setFlags: { "rosa_union_broken": true, "rel_rosa": -200 }
      }
    ]
  },
  {
    id: "char_rosa_2_political",
    characterId: "char_rosa",
    arcId: "arc_rosa",
    title: "Rosa's Run",
    description: "Rosa is running for City Council.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "rosa_union_active": true } },
    choices: [
      {
        id: "rosa_fund_campaign",
        label: "Fund Her Campaign",
        description: "Donate $100k.",
        consequences: { bag: -100000, clout: 200, aura: 300 },
        setFlags: { "rosa_campaign_funded": true }
      }
    ]
  },
  {
    id: "char_rosa_3_victory",
    characterId: "char_rosa",
    arcId: "arc_rosa",
    title: "The Council Member",
    description: "Rosa won her seat.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "rosa_campaign_funded": true } },
    choices: [
      {
        id: "rosa_policy_push",
        label: "Push Pro-Labor Policy",
        description: "Work with her.",
        consequences: { aura: 500, clout: 300, biographyEntry: "Partnered with Councilwoman Rosa to enact historic labor reforms." },
        setFlags: { "rosa_arc_complete": "reformed" }
      }
    ]
  }
];

const MILLER_COP_ARC: NarrativeEvent[] = [
  {
    id: "char_miller_1_payoff",
    characterId: "char_miller",
    arcId: "arc_miller",
    title: "The Blue Toll",
    description: "Officer Miller pulls you over.",
    trigger: { tier: ["STREET", "STARTUP"], probability: 0.2, once: true },
    choices: [
      {
        id: "miller_pay",
        label: "Pay the Toll",
        description: "Monthly protection money.",
        consequences: { passiveCash: -2000, heat: -10 },
        setFlags: { "miller_paid": true, "rel_miller": 60 }
      }
    ]
  },
  {
    id: "char_miller_2_promotion",
    characterId: "char_miller",
    arcId: "arc_miller",
    title: "Lieutenant Miller",
    description: "Miller got promoted.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.2, once: true, flagReqs: { "miller_paid": true } },
    choices: [
      {
        id: "miller_pay_more",
        label: "Upgrade Protection",
        description: "Increase the monthly payment.",
        consequences: { passiveCash: -10000, heat: -30, clout: 50 },
        setFlags: { "miller_status": "high_level_protection" }
      }
    ]
  },
  {
    id: "char_miller_3_commissioner",
    characterId: "char_miller",
    arcId: "arc_miller",
    title: "The Commissioner",
    description: "Miller is now the Police Commissioner.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "miller_status": "high_level_protection" } },
    choices: [
      {
        id: "miller_clean_slate",
        label: "Clean the Slate",
        description: "Pay the $5M to wipe all heat.",
        consequences: { bag: -5000000, heat: -1000, clout: 200, biographyEntry: "Erased their criminal record with the help of the Police Commissioner." },
        setFlags: { "miller_arc_complete": "clean_slate" }
      }
    ]
  }
];

const JDOG_ARC: NarrativeEvent[] = [
  {
    id: "char_jdog_1_studio",
    characterId: "char_jdog",
    arcId: "arc_jdog",
    title: "The Next Sound",
    description: "J-Dog wants to build a studio.",
    trigger: { tier: ["STREET", "STARTUP"], probability: 0.15, once: true },
    choices: [
      {
        id: "jdog_fund",
        label: "Fund the Studio",
        description: "Build the creative space.",
        consequences: { bag: -20000, aura: 100, clout: 50 },
        setFlags: { "jdog_studio_active": true, "rel_jdog": 90 }
      }
    ]
  },
  {
    id: "char_jdog_2_label",
    characterId: "char_jdog",
    arcId: "arc_jdog",
    title: "Mud Records",
    description: "J-Dog wants to start a real label.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.2, once: true, flagReqs: { "jdog_studio_active": true } },
    choices: [
      {
        id: "jdog_start_label",
        label: "Launch the Label",
        description: "Establish Mud Records.",
        consequences: { bag: -200000, clout: 200, aura: 200 },
        setFlags: { "jdog_label_active": true }
      }
    ]
  },
  {
    id: "char_jdog_3_grammy",
    characterId: "char_jdog",
    arcId: "arc_jdog",
    title: "The Global Icon",
    description: "J-Dog is nominated for a global music award.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.15, once: true, flagReqs: { "jdog_label_active": true } },
    choices: [
      {
        id: "jdog_accept_honor",
        label: "Accept the Honor",
        description: "Share the spotlight.",
        consequences: { aura: 1000, clout: 500, biographyEntry: "Founded Mud Records and mentored a global music icon." },
        setFlags: { "jdog_arc_complete": "legendary" }
      }
    ]
  }
];

const CASSIE_ARC: NarrativeEvent[] = [
  {
    id: "char_cassie_1_network",
    characterId: "char_cassie",
    arcId: "arc_cassie",
    title: "The High Table",
    description: "Cassie can introduce you to the regional moguls.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.15, once: true },
    choices: [
      {
        id: "cassie_buy_invite",
        label: "Buy the Invite",
        description: "Enter the elite social circle.",
        consequences: { bag: -50000, clout: 150 },
        setFlags: { "cassie_intro": true, "rel_cassie": 80 }
      }
    ]
  },
  {
    id: "char_cassie_2_insider",
    characterId: "char_cassie",
    arcId: "arc_cassie",
    title: "The Insider Tip",
    description: "At the gala, Cassie whispers about a pending merger.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "cassie_intro": true } },
    choices: [
      {
        id: "cassie_buy_shares",
        label: "Buy the Shares",
        description: "Invest $1M in the shipping merger.",
        consequences: { bag: -1000000, passiveCash: 25000, heat: 20 },
        setFlags: { "cassie_shares_bought": true }
      }
    ]
  },
  {
    id: "char_cassie_3_acquisition",
    characterId: "char_cassie",
    arcId: "arc_cassie",
    title: "The Final Acquisition",
    description: "Cassie has secured the majority stake.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "cassie_shares_bought": true } },
    choices: [
      {
        id: "cassie_take_control",
        label: "Take Full Control",
        description: "Secure the logistics monopoly.",
        consequences: { clout: 1000, passiveCash: 50000, biographyEntry: "Masterminded the acquisition of the city's shipping lanes." },
        setFlags: { "cassie_arc_complete": "monopoly" }
      }
    ]
  }
];

const RAY_ARC: NarrativeEvent[] = [
  {
    id: "char_ray_1_defense",
    characterId: "char_ray",
    arcId: "arc_ray",
    title: "Tactical Edge",
    description: "Ray offers a private security detail.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.15, once: true },
    choices: [
      {
        id: "ray_hire_detail",
        label: "Hire Ray's Team",
        description: "Personal security for $5k/month.",
        consequences: { passiveCash: -5000, heat: -40, clout: 50 },
        setFlags: { "ray_security_active": true, "rel_ray": 100 }
      }
    ]
  },
  {
    id: "char_ray_2_intelligence",
    characterId: "char_ray",
    arcId: "arc_ray",
    title: "The Sarge's Intel",
    description: "Ray has been monitoring rivals.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "ray_security_active": true } },
    choices: [
      {
        id: "ray_ambush",
        label: "Set the Ambush",
        description: "Crush Kane's forces.",
        consequences: { bag: -100000, clout: 300, heat: 50 },
        setFlags: { "ray_kane_crushed": true }
      }
    ]
  },
  {
    id: "char_ray_3_pmc",
    characterId: "char_ray",
    arcId: "arc_ray",
    title: "The Private Army",
    description: "Ray wants to scale into a full PMC.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "ray_kane_crushed": true } },
    choices: [
      {
        id: "ray_launch_pmc",
        label: "Launch the PMC",
        description: "Establish Vane Defense Services.",
        consequences: { bag: -5000000, clout: 2000, heat: -100, biographyEntry: "Built a private military empire with Raymond 'Sarge' Strode." },
        setFlags: { "ray_arc_complete": "pmc" }
      }
    ]
  }
];

const LEXI_ARC: NarrativeEvent[] = [
  {
    id: "char_lexi_1_mural",
    characterId: "char_lexi",
    arcId: "arc_lexi",
    title: "Colors of the Block",
    description: "Lexi wants to paint your main office.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.15, once: true },
    choices: [
      {
        id: "lexi_paint",
        label: "Let Her Paint",
        description: "Commission the mural for $5k.",
        consequences: { bag: -5000, aura: 150 },
        setFlags: { "lexi_mural_done": true, "rel_lexi": 100 }
      }
    ]
  },
  {
    id: "char_lexi_2_exhibition",
    characterId: "char_lexi",
    arcId: "arc_lexi",
    title: "The Underground Gallery",
    description: "Lexi is opening a secret gallery.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "lexi_mural_done": true } },
    choices: [
      {
        id: "lexi_fund_gallery",
        label: "Fund the Gallery",
        description: "Donate $100k to the exhibition.",
        consequences: { bag: -100000, aura: 400, heat: 20 },
        setFlags: { "lexi_gallery_funded": true }
      }
    ]
  },
  {
    id: "char_lexi_3_renaissance",
    characterId: "char_lexi",
    arcId: "arc_lexi",
    title: "The Urban Renaissance",
    description: "Lexi wants to lead a city-wide cultural initiative.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "lexi_gallery_funded": true } },
    choices: [
      {
        id: "lexi_cultural_lead",
        label: "Sponsor the Initiative",
        description: "Commit $1M to the cultural program.",
        consequences: { bag: -1000000, aura: 1500, clout: 500, biographyEntry: "Spearheaded a city-wide cultural renaissance alongside the artist Lexi Chen." },
        setFlags: { "lexi_arc_complete": "visionary" }
      }
    ]
  }
];

const DANTE_ARC: NarrativeEvent[] = [
  {
    id: "char_dante_1_fixer",
    characterId: "char_dante",
    arcId: "arc_dante_legal",
    title: "The Fixer's Fee",
    description: "Dante can make legal 'misunderstandings' go away.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.1, once: true },
    choices: [
      {
        id: "dante_fix",
        label: "Clean the Record",
        description: "Pay $30k to drop the heat.",
        consequences: { bag: -30000, heat: -50 },
        setFlags: { "dante_hired": true, "rel_dante": 70 }
      }
    ]
  },
  {
    id: "char_dante_2_lobby",
    characterId: "char_dante",
    arcId: "arc_dante_legal",
    title: "The Legislative Fix",
    description: "Dante has a plan to change the laws themselves.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "dante_hired": true } },
    choices: [
      {
        id: "dante_fund_lobby",
        label: "Fund the Lobby",
        description: "Commit $1M to legislative influence.",
        consequences: { bag: -1000000, clout: 500, aura: -200 },
        setFlags: { "dante_lobby_active": true }
      }
    ]
  },
  {
    id: "char_dante_3_justice",
    characterId: "char_dante",
    arcId: "arc_dante_legal",
    title: "The Hand of Justice",
    description: "Dante is now a Supreme Court Justice.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "dante_lobby_active": true } },
    choices: [
      {
        id: "dante_assume_immunity",
        label: "Assume Legal Immunity",
        description: "Finalize the legal shield.",
        consequences: { clout: 2000, heat: -1000, biographyEntry: "Secured absolute legal immunity through Justice Dante." },
        setFlags: { "dante_arc_complete": "untouchable" }
      }
    ]
  }
];


const LILA_ARC: NarrativeEvent[] = [
  {
    id: "char_lila_1_invest",
    characterId: "char_lila",
    arcId: "arc_lila_vance",
    title: "The Elite Opportunity",
    description: "Lila Vance invites you to a private equity round. \"Minimal buy-in is $1M. The returns are... exponential.\"",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.15, once: true },
    choices: [
      {
        id: "lila_invest",
        label: "Invest $1M",
        description: "Join the inner circle.",
        consequences: { bag: -1000000, clout: 300 },
        setFlags: { "lila_investor": true, "rel_lila": 80 }
      }
    ]
  },
  {
    id: "char_lila_2_takeover",
    characterId: "char_lila",
    arcId: "arc_lila_vance",
    title: "The Vance Boardroom",
    description: "Lila wants you to back her move to oust Julian. \"He's old world. We are the new world.\"",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "lila_investor": true } },
    choices: [
      {
        id: "lila_back_coup",
        label: "Back Lila",
        description: "Commit your voting shares to her coup.",
        consequences: { clout: 1000, aura: -500 },
        setFlags: { "lila_arc_complete": "partner" }
      }
    ]
  },
  {
    id: "char_lila_3_legacy",
    characterId: "char_lila",
    arcId: "arc_lila_vance",
    title: "The New Vance",
    description: "With Julian out, Lila has taken control of the family estate. She offers you a seat on the supreme board.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "lila_arc_complete": "partner" } },
    choices: [
      {
        id: "lila_join_board",
        label: "Join the Board",
        description: "Co-rule the Vance empire.",
        consequences: { passiveCash: 100000, aura: 1000, biographyEntry: "Co-ruled the global Vance empire alongside Lila Vance." },
        setFlags: { "lila_board_member": true }
      }
    ]
  }
];

const BIG_G_ARC: NarrativeEvent[] = [
  {
    id: "char_big_g_1_territory",
    characterId: "char_big_g",
    arcId: "arc_big_g_turf",
    title: "Territory Tax",
    description: "Big G wants a cut of your local distribution. \"Everyone pays the tax, one way or another.\"",
    trigger: { tier: ["STREET", "STARTUP"], probability: 0.2, once: true },
    choices: [
      {
        id: "big_g_pay",
        label: "Pay the Tax",
        description: "$1k/month for peace.",
        consequences: { passiveCash: -1000, heat: -10 },
        setFlags: { "big_g_paid": true, "rel_big_g": 50 }
      }
    ]
  },
  {
    id: "char_big_g_2_truce",
    characterId: "char_big_g",
    arcId: "arc_big_g_turf",
    title: "The Neighborhood Truce",
    description: "Big G's crew is at war. \"It's bad for business. Use your influence to call a sit-down.\"",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.2, once: true, flagReqs: { "big_g_paid": true } },
    choices: [
      {
        id: "big_g_mediate",
        label: "Mediate the Peace",
        description: "Host the sit-down at your headquarters.",
        consequences: { clout: 200, aura: 300, heat: 10 },
        setFlags: { "big_g_peace_broker": true }
      }
    ]
  },
  {
    id: "char_big_g_3_retirement",
    characterId: "char_big_g",
    arcId: "arc_big_g_turf",
    title: "The Neighborhood Elder",
    description: "Big G wants out. \"I want to run a legitimate security firm. I need a contract.\"",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.15, once: true, flagReqs: { "big_g_peace_broker": true } },
    choices: [
      {
        id: "big_g_hire_security",
        label: "Hire G's Firm",
        description: "Give them the contract.",
        consequences: { passiveCash: -5000, heat: -50, aura: 200, biographyEntry: "Helped transition Big G's organization into a legitimate security empire." },
        setFlags: { "big_g_arc_complete": "legit" }
      }
    ]
  }
];

const TESSA_ARC: NarrativeEvent[] = [
  {
    id: "char_tessa_1_audit",
    characterId: "char_tessa",
    arcId: "arc_tessa",
    title: "The IRS Audit",
    description: "Tessa is assigned to your latest tax filing. \"Some of these numbers don't quite add up.\"",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.15, once: true },
    choices: [
      {
        id: "tessa_bribe",
        label: "Offer a 'Consultancy' Role",
        description: "Pay $25k to settle the audit.",
        consequences: { bag: -25000, heat: -20 },
        setFlags: { "tessa_consultant": true, "rel_tessa": 70 }
      }
    ]
  },
  {
    id: "char_tessa_2_leak",
    characterId: "char_tessa",
    arcId: "arc_tessa",
    title: "The Panama Papers v2",
    description: "Tessa found a web of offshore accounts belonging to Julian Vane. \"I can leak this, but I'll lose my job.\"",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "tessa_consultant": true } },
    choices: [
      {
        id: "tessa_fund_leak",
        label: "Fund the Leak",
        description: "Expose Vane's global tax evasion.",
        consequences: { bag: -500000, aura: 500, clout: 200, heat: 40 },
        setFlags: { "tessa_vane_exposed": true }
      }
    ]
  },
  {
    id: "char_tessa_3_chief_auditor",
    characterId: "char_tessa",
    arcId: "arc_tessa",
    title: "The Chief Auditor",
    description: "Years later, you've helped Tessa get appointed as Chief Auditor. \"Now, we really start cleaning the system.\"",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "tessa_vane_exposed": true } },
    choices: [
      {
        id: "tessa_systemic_change",
        label: "Enact Financial Reform",
        description: "Work with her to close the offshore loopholes.",
        consequences: { aura: 2000, clout: 1000, biographyEntry: "Partnered with the National Treasury to implement historic global financial reforms." },
        setFlags: { "tessa_arc_complete": "reformer" }
      }
    ]
  }
];

const CLARK_ARC: NarrativeEvent[] = [
  {
    id: "char_clark_1_exclusive",
    characterId: "char_clark",
    arcId: "arc_clark",
    title: "The Front Page",
    description: "Clark wants an exclusive on your rise. \"Tell me the real story, and I'll make you a legend.\"",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.2, once: true },
    choices: [
      {
        id: "clark_tell_all",
        label: "Tell the Truth",
        description: "A candid interview about the early days.",
        consequences: { aura: 200, clout: 100 },
        setFlags: { "clark_story": "truth", "rel_clark": 90 }
      }
    ]
  },
  {
    id: "char_clark_2_investigation",
    characterId: "char_clark",
    arcId: "arc_clark",
    title: "The Vane Connection",
    description: "Clark found evidence that Vane is funding the city's gangs. \"If we publish this, it'll start a war.\"",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "clark_story": "truth" } },
    choices: [
      {
        id: "clark_publish",
        label: "Publish the Truth",
        description: "Expose Vane's corruption.",
        consequences: { aura: 500, heat: 50, clout: -200 },
        setFlags: { "clark_vane_exposed": true }
      }
    ]
  },
  {
    id: "char_clark_3_pulitzer",
    characterId: "char_clark",
    arcId: "arc_clark",
    title: "The Pulitzer",
    description: "Clark won a major award. \"We changed the city,\" he tells you. \"Thank you for having the courage.\"",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "clark_vane_exposed": true } },
    choices: [
      {
        id: "clark_legacy",
        label: "Accept the Legacy",
        description: "Be remembered as the one who broke the corruption.",
        consequences: { aura: 2000, clout: 1000, biographyEntry: "Partnered with investigative journalist Clark Reed to dismantle a multi-generational web of corruption." },
        setFlags: { "clark_arc_complete": "hero" }
      }
    ]
  }
];

const SUMMERS_ARC: NarrativeEvent[] = [
  {
    id: "char_summers_1_bill",
    characterId: "char_summers",
    arcId: "arc_summers_politics",
    title: "The Zoning Bill",
    description: "Summers needs your help to push through a new zoning bill. \"It will favor your industrial expansion.\"",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.15, once: true },
    choices: [
      {
        id: "summers_support",
        label: "Support the Bill",
        description: "Use your clout to lobby for the bill.",
        consequences: { clout: 200, aura: -150 },
        setFlags: { "summers_bill_passed": true, "rel_summers": 80 }
      }
    ]
  },
  {
    id: "char_summers_2_redevelopment",
    characterId: "char_summers",
    arcId: "arc_summers_politics",
    title: "The Waterfront Project",
    description: "Summers has a new plan. \"We're redeveloping the waterfront. I can give you exclusive rights for $5M.\"",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "summers_bill_passed": true } },
    choices: [
      {
        id: "summers_buy_rights",
        label: "Buy the Rights",
        description: "Secure the waterfront for $5M.",
        consequences: { bag: -5000000, passiveCash: 100000, clout: 500 },
        setFlags: { "summers_waterfront_active": true }
      }
    ]
  },
  {
    id: "char_summers_3_governor",
    characterId: "char_summers",
    arcId: "arc_summers_politics",
    title: "Governor Summers",
    description: "Summers is running for Governor. \"I'll make this state your playground if you fund the campaign.\"",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "summers_waterfront_active": true } },
    choices: [
      {
        id: "summers_fund_campaign",
        label: "Fund the Campaign",
        description: "Donate $10M to the run.",
        consequences: { bag: -10000000, clout: 2000, aura: -1000, biographyEntry: "Bankrolled the rise of Governor Summers, securing a personal connection to state power." },
        setFlags: { "summers_arc_complete": "kingmaker" }
      }
    ]
  }
];

const KHALID_ARC: NarrativeEvent[] = [
  {
    id: "char_khalid_1_export",
    characterId: "char_khalid",
    arcId: "arc_khalid_shipping",
    title: "The Global Pipeline",
    description: "Khalid offers to handle your international exports. \"My fleet reaches every port.\"",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true },
    choices: [
      {
        id: "khalid_partner",
        label: "Partner with Khalid",
        description: "Expand your reach globally.",
        consequences: { passiveCash: 5000, bag: -100000 },
        setFlags: { "khalid_partner": true, "rel_khalid": 100 }
      }
    ]
  },
  {
    id: "char_khalid_2_embargo",
    characterId: "char_khalid",
    arcId: "arc_khalid_shipping",
    title: "The Trade Embargo",
    description: "The government has placed an embargo. Khalid has a way around it. \"We can keep the supply open.\"",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "khalid_partner": true } },
    choices: [
      {
        id: "khalid_smuggle",
        label: "Bypass the Embargo",
        description: "Pay Khalid $1M to keep the goods flowing.",
        consequences: { bag: -1000000, heat: 60, passiveCash: 20000 },
        setFlags: { "khalid_smuggling_active": true }
      }
    ]
  },
  {
    id: "char_khalid_3_monopoly",
    characterId: "char_khalid",
    arcId: "arc_khalid_shipping",
    title: "The Global Logistics King",
    description: "Khalid offers to merge his fleet. \"We will control every port from here to Singapore.\"",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "khalid_smuggling_active": true } },
    choices: [
      {
        id: "khalid_merge",
        label: "Form the Global Monopoly",
        description: "Commit $20M to the merger.",
        consequences: { bag: -20000000, passiveCash: 200000, clout: 3000, biographyEntry: "Formed a global logistics monopoly with Khalid, controlling trade across six continents." },
        setFlags: { "khalid_arc_complete": "king" }
      }
    ]
  }
];

const JULIAN_VANE_ARC: NarrativeEvent[] = [
  {
    id: "char_vane_1_summons",
    characterId: "char_julian_vane",
    title: "The Vane Summit",
    description: "Julian Vane wants to meet. \"You're making waves. Let's see if you're a partner or a problem.\"",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.3, once: true },
    choices: [
      {
        id: "vane_kiss_ring",
        label: "Show Respect",
        description: "Acknowledge his dominance.",
        consequences: { clout: 500, aura: -200 },
        setFlags: { "vane_ally": true, "rel_vane": 100 }
      }
    ]
  },
  {
    id: "char_vane_2_heir_crisis",
    characterId: "char_julian_vane",
    title: "The Vane Succession",
    description: "Julian is dying. He wants you to manage his trust. \"My bloodline must endure. Protect the legacy.\"",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.25, once: true, flagReqs: { "vane_ally": true } },
    choices: [
      {
        id: "vane_protect_legacy",
        label: "Protect the Dynasty",
        description: "Ensure the family takes the throne.",
        consequences: { clout: 1000, aura: 500 },
        setFlags: { "vane_legacy_protected": true }
      }
    ]
  },
  {
    id: "char_vane_3_new_era",
    characterId: "char_julian_vane",
    title: "The Passing of the Torch",
    description: "Julian Vane has passed away. You have been named the executor of his estate.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.3, once: true, flagReqs: { "vane_legacy_protected": true } },
    choices: [
      {
        id: "vane_ascend",
        label: "Ascend the Throne",
        description: "Become the undisputed master of the city.",
        consequences: { clout: 5000, passiveCash: 500000, biographyEntry: "Succeeded Julian Vane as the master of the city, inheriting a multi-billion dollar empire." },
        setFlags: { "vane_arc_complete": "successor" }
      }
    ]
  }
];

const ELARA_ARC: NarrativeEvent[] = [
  {
    id: "char_elara_1_sabotage",
    characterId: "char_elara",
    arcId: "arc_elara_sabotage",
    title: "Digital Warfare",
    description: "Elara can take down a competitor's network. \"They won't know what hit them.\"",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.15, once: true },
    choices: [
      {
        id: "elara_hire",
        label: "Hire Elara",
        description: "Digital sabotage for $100k.",
        consequences: { bag: -100000, heat: 40, clout: 200 },
        setFlags: { "elara_active": true, "rel_elara": 80 }
      }
    ]
  },
  {
    id: "char_elara_2_counter_hack",
    characterId: "char_elara",
    arcId: "arc_elara_sabotage",
    title: "The Digital Counter-Strike",
    description: "A rival tech firm is attempting to brick your servers. Elara is ready to trace them back.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "elara_active": true } },
    choices: [
      {
        id: "elara_grant_access",
        label: "Grant Access",
        description: "Let Elara defend the system.",
        consequences: { heat: 30, clout: 500 },
        setFlags: { "elara_defended": true }
      }
    ]
  },
  {
    id: "char_elara_3_sentience",
    characterId: "char_elara",
    arcId: "arc_elara_sabotage",
    title: "The Ghost in the Machine",
    description: "Elara has created a sentient AI sub-routine. \"It can predict the future of the markets.\"",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "elara_defended": true } },
    choices: [
      {
        id: "elara_release_ai",
        label: "Release the AI",
        description: "Dominate the global economy.",
        consequences: { passiveCash: 500000, aura: -1000, biographyEntry: "Released a sentient AI developed by Elara, fundamentally altering global commerce." },
        setFlags: { "elara_arc_complete": "transcendent" }
      }
    ]
  }
];

const GARRETT_ARC: NarrativeEvent[] = [
  {
    id: "char_garrett_1_hostile",
    characterId: "char_garrett",
    arcId: "arc_garrett_takeover",
    title: "The Hostile Takeover",
    description: "Garrett is launching a bid for a rival firm. \"Join me.\"",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "garrett_join",
        label: "Join the Bid",
        description: "Commit $2M to the takeover.",
        consequences: { bag: -2000000, clout: 500 },
        setFlags: { "garrett_ally": true, "rel_garrett": 90 }
      }
    ]
  },
  {
    id: "char_garrett_2_merger",
    characterId: "char_garrett",
    arcId: "arc_garrett_takeover",
    title: "The Grand Merger",
    description: "Garrett wants to merge your firms. \"Together, we'll be too big to fail.\"",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "garrett_ally": true } },
    choices: [
      {
        id: "garrett_merge_firms",
        label: "Merge the Empires",
        description: "Form a global conglomerate.",
        consequences: { clout: 2000, passiveCash: 100000 },
        setFlags: { "garrett_merged": true }
      }
    ]
  },
  {
    id: "char_garrett_3_world_order",
    characterId: "char_garrett",
    arcId: "arc_garrett_takeover",
    title: "The New World Order",
    description: "The merger is complete. \"Why lobby governments when we can become one?\"",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "garrett_merged": true } },
    choices: [
      {
        id: "garrett_corporate_state",
        label: "Establish the Corporate State",
        description: "Declare economic sovereignty.",
        consequences: { clout: 10000, aura: -5000, biographyEntry: "Transformed a global conglomerate into a sovereign corporate state alongside Garrett." },
        setFlags: { "garrett_arc_complete": "sovereign" }
      }
    ]
  }
];

const SELENA_ROSSO_ARC: NarrativeEvent[] = [
  {
    id: "char_rosso_1_shipping",
    characterId: "char_selena_rosso",
    arcId: "arc_rosso_shipping",
    title: "The Rosso Route",
    description: "Selena offers access to her private shipping lanes. \"Faster, safer, and off the grid.\"",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "rosso_hire",
        label: "Secure the Route",
        description: "Pay $500k for exclusive access.",
        consequences: { bag: -500000, heat: -100, passiveCash: 10000 },
        setFlags: { "rosso_partner": true, "rel_rosso": 100 }
      }
    ]
  },
  {
    id: "char_rosso_2_piracy",
    characterId: "char_selena_rosso",
    arcId: "arc_rosso_shipping",
    title: "The High Seas Crisis",
    description: "Selena's ships are being targeted by pirates. \"I need a fleet of drones for $2M.\"",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "rosso_partner": true } },
    choices: [
      {
        id: "rosso_fund_drones",
        label: "Fund the Defense",
        description: "Deploy the drone fleet.",
        consequences: { bag: -2000000, clout: 500, heat: 30 },
        setFlags: { "rosso_defended": true }
      }
    ]
  },
  {
    id: "char_rosso_3_admiral",
    characterId: "char_selena_rosso",
    arcId: "arc_rosso_shipping",
    title: "The Admiral of the Oceans",
    description: "Selena now controls the three most important shipping straits. \"The world's trade belongs to us.\"",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "rosso_defended": true } },
    choices: [
      {
        id: "rosso_global_trade",
        label: "Dominate Global Trade",
        description: "Secure the maritime monopoly.",
        consequences: { passiveCash: 1000000, clout: 5000, biographyEntry: "Established absolute dominance over the world's shipping straits with Selena Rosso." },
        setFlags: { "rosso_arc_complete": "admiral" }
      }
    ]
  }
];

const HUDSON_REED_ARC: NarrativeEvent[] = [
  {
    id: "char_reed_1_campaign",
    characterId: "char_hudson_reed",
    arcId: "arc_reed_politics",
    title: "The Political Engine",
    description: "Hudson needs a major donor for the mayoral race.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true },
    choices: [
      {
        id: "reed_donate",
        label: "Donate $250k",
        description: "Fund the campaign.",
        consequences: { bag: -250000, clout: 300 },
        setFlags: { "reed_ally": true, "rel_reed": 100 }
      }
    ]
  },
  {
    id: "char_reed_2_scandal",
    characterId: "char_hudson_reed",
    arcId: "arc_reed_politics",
    title: "The Mayor's Secret",
    description: "Mayor Reed is being blackmailed.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "reed_ally": true } },
    choices: [
      {
        id: "reed_handle_scandal",
        label: "Neutralize the Threat",
        description: "Silence the blackmailer.",
        consequences: { bag: -500000, clout: 300, aura: -300, heat: 40 },
        setFlags: { "reed_scandal_managed": true }
      }
    ]
  },
  {
    id: "char_reed_3_senator",
    characterId: "char_hudson_reed",
    arcId: "arc_reed_politics",
    title: "Senator Reed",
    description: "Reed is heading to the Senate.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "reed_scandal_managed": true } },
    choices: [
      {
        id: "reed_senate_backing",
        label: "Secure the Senate Seat",
        description: "Provide the final push.",
        consequences: { bag: -5000000, clout: 2000, biographyEntry: "Orchestrated the rise of Senator Hudson Reed." },
        setFlags: { "reed_arc_complete": "senator" }
      }
    ]
  }
];

const NAOMI_WEST_ARC: NarrativeEvent[] = [
  {
    id: "char_naomi_1_pr",
    characterId: "char_naomi_west",
    arcId: "arc_naomi_pr",
    title: "The Image Maker",
    description: "Naomi wants to rebrand your entire operation.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true },
    choices: [
      {
        id: "naomi_rebrand",
        label: "Rebrand",
        description: "The full PR package for $100k.",
        consequences: { bag: -100000, aura: 500, clout: 200 },
        setFlags: { "naomi_active": true, "rel_naomi": 90 }
      }
    ]
  },
  {
    id: "char_naomi_2_scandal",
    characterId: "char_naomi_west",
    arcId: "arc_naomi_pr",
    title: "Scandal Management",
    description: "An old video has leaked.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "naomi_active": true } },
    choices: [
      {
        id: "naomi_spin_story",
        label: "Spin the Story",
        description: "Embrace the past.",
        consequences: { aura: 500, clout: 200 },
        setFlags: { "naomi_brand_status": "authentic" }
      }
    ]
  },
  {
    id: "char_naomi_3_myth",
    characterId: "char_naomi_west",
    arcId: "arc_naomi_pr",
    title: "The Living Myth",
    description: "Naomi has succeeded. You are a cultural phenomenon.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "naomi_brand_status": "authentic" } },
    choices: [
      {
        id: "naomi_become_icon",
        label: "Become the Icon",
        description: "Accept the global adulation.",
        consequences: { aura: 5000, clout: 2000, biographyEntry: "Worked with Naomi West to become a global cultural icon." },
        setFlags: { "naomi_arc_complete": "iconic" }
      }
    ]
  }
];

const ARTHUR_BENNETT_ARC: NarrativeEvent[] = [
  {
    id: "char_bennett_1_trust",
    characterId: "char_arthur_bennett",
    arcId: "arc_bennett_trust",
    title: "The Bennett Trust",
    description: "Bennett offers to manage your personal wealth.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "bennett_join",
        label: "Open a Trust",
        description: "Move assets to Bennett Management.",
        consequences: { passiveCash: 20000, bag: -1000000 },
        setFlags: { "bennett_managed": true, "rel_bennett": 100 }
      }
    ]
  },
  {
    id: "char_bennett_2_foundation",
    characterId: "char_arthur_bennett",
    arcId: "arc_bennett_trust",
    title: "The Bennett Foundation",
    description: "Bennett wants to establish a charitable foundation.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "bennett_managed": true } },
    choices: [
      {
        id: "bennett_start_foundation",
        label: "Establish the Foundation",
        description: "Commit $20M to the endowment.",
        consequences: { bag: -20000000, aura: 5000, clout: 1000 },
        setFlags: { "bennett_foundation_active": true }
      }
    ]
  },
  {
    id: "char_bennett_3_global_philanthropist",
    characterId: "char_arthur_bennett",
    arcId: "arc_bennett_trust",
    title: "The Global Philanthropist",
    description: "The foundation is now the largest on Earth.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "bennett_foundation_active": true } },
    choices: [
      {
        id: "bennett_cement_legacy",
        label: "Cement the Legacy",
        description: "Accept the title of World Benefactor.",
        consequences: { aura: 10000, clout: 5000, biographyEntry: "Became a global benefactor through the Bennett Foundation." },
        setFlags: { "bennett_arc_complete": "philanthropist" }
      }
    ]
  }
];

const FIONA_GLASS_ARC: NarrativeEvent[] = [
  {
    id: "char_fiona_1_propaganda",
    characterId: "char_fiona_glass",
    arcId: "arc_fiona_media",
    title: "The Glass Ceiling",
    description: "Fiona can run a negative ad campaign against any rival.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "fiona_hire",
        label: "Hire Fiona",
        description: "Destroy a rival for $200k.",
        consequences: { bag: -200000, clout: 400, aura: -200 },
        setFlags: { "fiona_active": true, "rel_fiona": 80 }
      }
    ]
  },
  {
    id: "char_fiona_2_network",
    characterId: "char_fiona_glass",
    arcId: "arc_fiona_media",
    title: "The Glass Network",
    description: "Fiona wants to launch a global news network.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "fiona_active": true } },
    choices: [
      {
        id: "fiona_buy_network",
        label: "Buy the Network",
        description: "Acquire Global News One.",
        consequences: { bag: -50000000, clout: 3000, aura: -1000 },
        setFlags: { "fiona_network_active": true }
      }
    ]
  },
  {
    id: "char_fiona_3_truth",
    characterId: "char_fiona_glass",
    arcId: "arc_fiona_media",
    title: "The Architect of Truth",
    description: "Fiona leans into the microphone. \"Whatever we say is the truth.\"",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "fiona_network_active": true } },
    choices: [
      {
        id: "fiona_control_narrative",
        label: "Control the World Narrative",
        description: "Absolute media dominance.",
        consequences: { clout: 10000, aura: -2000, biographyEntry: "Achieved control over global media alongside Fiona Glass." },
        setFlags: { "fiona_arc_complete": "propagandist" }
      }
    ]
  }
];

const STERLING_VANE_ARC: NarrativeEvent[] = [
  {
    id: "char_sterling_1_legacy",
    characterId: "char_sterling_vane",
    arcId: "arc_sterling_vane",
    title: "The Vane Dynasty",
    description: "Sterling is looking for allies who understand the future.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "sterling_align",
        label: "Align with Sterling",
        description: "Back the next generation.",
        consequences: { clout: 1000, aura: -300 },
        setFlags: { "sterling_ally": true, "rel_sterling": 100 }
      }
    ]
  },
  {
    id: "char_sterling_2_innovation",
    characterId: "char_sterling_vane",
    arcId: "arc_sterling_vane",
    title: "Vane X",
    description: "Sterling wants to launch a radical new tech division.",
    trigger: { tier: ["PRESIDENT"], probability: 0.2, once: true, flagReqs: { "sterling_ally": true } },
    choices: [
      {
        id: "sterling_fund_x",
        label: "Fund Vane X",
        description: "Commit $100M to the future.",
        consequences: { bag: -100000000, clout: 5000 },
        setFlags: { "sterling_x_active": true }
      }
    ]
  },
  {
    id: "char_sterling_3_new_world",
    characterId: "char_sterling_vane",
    arcId: "arc_sterling_vane",
    title: "The New World Order",
    description: "Vane X has redefined the global economy.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "sterling_x_active": true } },
    choices: [
      {
        id: "sterling_rule",
        label: "Rule with Sterling",
        description: "Establish the new world order.",
        consequences: { clout: 50000, aura: 10000, biographyEntry: "Redefined the global economy alongside Sterling Vane." },
        setFlags: { "sterling_arc_complete": "overlord" }
      }
    ]
  }
];

const IVY_CHEN_ARC: NarrativeEvent[] = [
  {
    id: "char_ivy_1_quantum",
    characterId: "char_ivy_chen",
    arcId: "arc_ivy_tech",
    title: "The Quantum Leap",
    description: "Ivy is developing quantum encryption. She needs a $5M grant.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "ivy_grant",
        label: "Fund the Research",
        description: "Provide the $5M grant.",
        consequences: { bag: -5000000, clout: 800, aura: 400 },
        setFlags: { "ivy_research_active": true, "rel_ivy": 100 }
      }
    ]
  },
  {
    id: "char_ivy_2_breakthrough",
    characterId: "char_ivy_chen",
    arcId: "arc_ivy_tech",
    title: "The Quantum Breakthrough",
    description: "Ivy's research was successful.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.2, once: true, flagReqs: { "ivy_research_active": true } },
    choices: [
      {
        id: "ivy_use_processor",
        label: "Unlock the World",
        description: "Use the tech for leverage.",
        consequences: { bag: 100000000, heat: 100, clout: 2000 },
        setFlags: { "ivy_quantum_status": "active" }
      }
    ]
  },
  {
    id: "char_ivy_3_singularity",
    characterId: "char_ivy_chen",
    arcId: "arc_ivy_tech",
    title: "The Technological Singularity",
    description: "Ivy is working on total integration.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "ivy_quantum_status": "active" } },
    choices: [
      {
        id: "ivy_initiate_singularity",
        label: "Initiate the Singularity",
        description: "Transcend the mud.",
        consequences: { aura: 100000, clout: 100000, biographyEntry: "Initiated the technological singularity alongside Ivy Chen." },
        setFlags: { "ivy_arc_complete": "godhead" }
      }
    ]
  }
];

const DOMINIC_RUSSO_ARC: NarrativeEvent[] = [
  {
    id: "char_dominic_1_muscle",
    characterId: "char_dominic_russo",
    arcId: "arc_russo_crime",
    title: "The Russo Reach",
    description: "Dominic offers the services of the Russo family.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "dominic_partner",
        label: "Partner with Russo",
        description: "The ultimate protection.",
        consequences: { bag: -200000, heat: 50, clout: 500 },
        setFlags: { "russo_partner": true, "rel_dominic": 100 }
      }
    ]
  },
  {
    id: "char_dominic_2_war",
    characterId: "char_dominic_russo",
    arcId: "arc_russo_crime",
    title: "The Family War",
    description: "Dominic wants a war. He needs $5M for heavy hitters.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "russo_partner": true } },
    choices: [
      {
        id: "dominic_fund_war",
        label: "Fund the War",
        description: "Sponsor the campaign.",
        consequences: { bag: -5000000, heat: 80, clout: 1000 },
        setFlags: { "dominic_war_won": true }
      }
    ]
  },
  {
    id: "char_dominic_3_consigliere",
    characterId: "char_dominic_russo",
    arcId: "arc_russo_crime",
    title: "The Consigliere",
    description: "Dominic is now the Boss of Bosses.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "dominic_war_won": true } },
    choices: [
      {
        id: "dominic_take_command",
        label: "Assume Command",
        description: "Become the shadow master.",
        consequences: { clout: 5000, heat: -100, biographyEntry: "Unified the city's underworld under the Russo banner." },
        setFlags: { "dominic_arc_complete": "godfather" }
      }
    ]
  }
];

const CAMILLE_DUBOIS_ARC: NarrativeEvent[] = [
  {
    id: "char_dubois_1_culture",
    characterId: "char_camille_dubois",
    arcId: "arc_dubois_culture",
    title: "The Dubois Circle",
    description: "Camille wants to feature you in her magazine.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "dubois_feature",
        label: "Accept the Feature",
        description: "Become a global icon.",
        consequences: { aura: 1000, clout: 500 },
        setFlags: { "dubois_icon": true, "rel_camille": 100 }
      }
    ]
  },
  {
    id: "char_dubois_2_museum",
    characterId: "char_camille_dubois",
    arcId: "arc_dubois_culture",
    title: "The Dubois Museum",
    description: "Camille wants to build a museum in your name.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "dubois_icon": true } },
    choices: [
      {
        id: "dubois_fund_museum",
        label: "Fund the Museum",
        description: "Build the landmark.",
        consequences: { bag: -20000000, aura: 2000, clout: 1000 },
        setFlags: { "dubois_museum_active": true }
      }
    ]
  },
  {
    id: "char_dubois_3_nobel",
    characterId: "char_camille_dubois",
    arcId: "arc_dubois_culture",
    title: "The Nobel Peace Prize",
    description: "Camille has lobbied for your nomination.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "dubois_museum_active": true } },
    choices: [
      {
        id: "dubois_accept_nobel",
        label: "Accept the Peace Prize",
        description: "Secure your place in history.",
        consequences: { aura: 10000, clout: 5000, biographyEntry: "Awarded the Nobel Peace Prize for contributions to culture." },
        setFlags: { "dubois_arc_complete": "idealist" }
      }
    ]
  }
];

const XAVIER_THORNE_ARC: NarrativeEvent[] = [
  {
    id: "char_thorne_1_military",
    characterId: "char_xavier_thorne",
    arcId: "arc_thorne_military",
    title: "The Thorne Defense",
    description: "Xavier offers a private military contract.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "thorne_contract",
        label: "Sign the Contract",
        description: "Commit $10M to defense.",
        consequences: { bag: -10000000, heat: -200, clout: 1000 },
        setFlags: { "thorne_ally": true, "rel_thorne": 100 }
      }
    ]
  },
  {
    id: "char_thorne_2_coups",
    characterId: "char_xavier_thorne",
    arcId: "arc_thorne_military",
    title: "The Precision Coup",
    description: "Xavier's team has identified a nation in chaos.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "thorne_ally": true } },
    choices: [
      {
        id: "thorne_fund_coup",
        label: "Authorize the Coup",
        description: "Sponsor regime change.",
        consequences: { bag: -50000000, clout: 5000, aura: -2000 },
        setFlags: { "thorne_regime_change": true }
      }
    ]
  },
  {
    id: "char_thorne_3_world_policing",
    characterId: "char_xavier_thorne",
    arcId: "arc_thorne_military",
    title: "World Policing",
    description: "The Thorne PMC is now larger than most armies.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "thorne_regime_change": true } },
    choices: [
      {
        id: "thorne_global_security",
        label: "Secure the World Order",
        description: "Establish a policing network.",
        consequences: { clout: 20000, heat: -500, biographyEntry: "Established a private global policing network with Xavier Thorne." },
        setFlags: { "thorne_arc_complete": "peacekeeper" }
      }
    ]
  }
];

const OLIVIA_WEST_ARC: NarrativeEvent[] = [
  {
    id: "char_olivia_1_network",
    characterId: "char_olivia_west",
    arcId: "arc_west_comms",
    title: "The West Network",
    description: "Olivia offers to run your global communications.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "olivia_hire",
        label: "Hire Olivia",
        description: "Control the narrative.",
        consequences: { bag: -2000000, clout: 1500 },
        setFlags: { "olivia_partner": true, "rel_olivia": 100 }
      }
    ]
  },
  {
    id: "char_olivia_2_surveillance",
    characterId: "char_olivia_west",
    arcId: "arc_west_comms",
    title: "The Panopticon",
    description: "Olivia has integrated her network with everything.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.2, once: true, flagReqs: { "olivia_partner": true } },
    choices: [
      {
        id: "olivia_activate_surveillance",
        label: "Activate the Network",
        description: "Gain absolute informational leverage.",
        consequences: { clout: 5000, aura: -1000, heat: -100 },
        setFlags: { "olivia_panopticon_active": true }
      }
    ]
  },
  {
    id: "char_olivia_3_global_mind",
    characterId: "char_olivia_west",
    arcId: "arc_west_comms",
    title: "The Global Mind",
    description: "Olivia's network is now sentient.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "olivia_panopticon_active": true } },
    choices: [
      {
        id: "olivia_yield_control",
        label: "Yield to the Network",
        description: "Let the AI manage the world.",
        consequences: { aura: 20000, clout: 20000, biographyEntry: "Handed over global management to a sentient network." },
        setFlags: { "olivia_arc_complete": "steward" }
      }
    ]
  }
];

const MARCUS_ARC: NarrativeEvent[] = [
  {
    id: "char_marcus_1_expansion",
    characterId: "char_marcus",
    title: "Marcus' Global Vision",
    description: "Marcus wants to take your street hustle global.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "marcus_go_global",
        label: "Go Global",
        description: "Commit $5M to international expansion.",
        consequences: { bag: -5000000, passiveCash: 50000, clout: 1000 },
        setFlags: { "marcus_global": true, "rel_marcus": 100 }
      }
    ]
  },
  {
    id: "char_marcus_2_logistics",
    characterId: "char_marcus",
    title: "The Global Hub",
    description: "Marcus has secured a lease for a massive global logistics hub.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "marcus_global": true } },
    choices: [
      {
        id: "marcus_fund_hub",
        label: "Fund the Hub",
        description: "Spend $20M on the facility.",
        consequences: { bag: -20000000, passiveCash: 150000 },
        setFlags: { "marcus_hub_active": true }
      }
    ]
  },
  {
    id: "char_marcus_3_dominance",
    characterId: "char_marcus",
    title: "Supply Chain King",
    description: "You now control one of the world's most efficient supply chains.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "marcus_hub_active": true } },
    choices: [
      {
        id: "marcus_monopolize",
        label: "Monopolize Trade",
        description: "Become the undisputed king of trade.",
        consequences: { clout: 10000, passiveCash: 500000, biographyEntry: "Architected a global supply chain monopoly alongside Marcus." },
        setFlags: { "marcus_arc_complete": "tycoon" }
      }
    ]
  }
];

const ASHLEY_ARC: NarrativeEvent[] = [
  {
    id: "char_ashley_1_innovation",
    characterId: "char_ashley",
    title: "Ashley's AI",
    description: "Ashley has developed a market-predicting AI.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "ashley_fund_ai",
        label: "Fund the AI",
        description: "Invest $2M in the tech.",
        consequences: { bag: -2000000, passiveCash: 100000 },
        setFlags: { "ashley_ai_active": true, "rel_ashley": 100 }
      }
    ]
  },
  {
    id: "char_ashley_2_quantum",
    characterId: "char_ashley",
    title: "Quantum Ashley",
    description: "Ashley wants to upgrade the AI with quantum hardware.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "ashley_ai_active": true } },
    choices: [
      {
        id: "ashley_quantum_upgrade",
        label: "Quantum Upgrade",
        description: "Spend $50M on quantum servers.",
        consequences: { bag: -50000000, passiveCash: 1000000 },
        setFlags: { "ashley_quantum_active": true }
      }
    ]
  },
  {
    id: "char_ashley_3_oracle",
    characterId: "char_ashley",
    title: "The Market Oracle",
    description: "The AI is now so powerful it effectively controls the markets.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "ashley_quantum_active": true } },
    choices: [
      {
        id: "ashley_control_economy",
        label: "Rule the Economy",
        description: "Use the Oracle to stay on top forever.",
        consequences: { clout: 50000, aura: 5000, biographyEntry: "Used Ashley's Market Oracle to achieve absolute economic dominance." },
        setFlags: { "ashley_arc_complete": "oracle" }
      }
    ]
  }
];

const COLE_ARC: NarrativeEvent[] = [
  {
    id: "char_cole_1_security",
    characterId: "char_cole",
    title: "Cole's Elite Guard",
    description: "Cole offers an elite personal guard detail.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "cole_hire_guard",
        label: "Hire the Guard",
        description: "Pay $1M for the best security.",
        consequences: { bag: -1000000, heat: -150, clout: 500 },
        setFlags: { "cole_guard_active": true, "rel_cole": 100 }
      }
    ]
  },
  {
    id: "char_cole_2_black_ops",
    characterId: "char_cole",
    title: "Shadow Operations",
    description: "Cole wants to launch a clandestine wing for the firm.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "cole_guard_active": true } },
    choices: [
      {
        id: "cole_fund_shadow",
        label: "Fund Shadow Wing",
        description: "Commit $10M to black ops.",
        consequences: { bag: -10000000, clout: 1000, heat: 50 },
        setFlags: { "cole_shadow_active": true }
      }
    ]
  },
  {
    id: "char_cole_3_intelligence",
    characterId: "char_cole",
    title: "The Ghost Agency",
    description: "Your shadow wing is now a global intelligence agency.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "cole_shadow_active": true } },
    choices: [
      {
        id: "cole_global_intel",
        label: "Master Intelligence",
        description: "Know everything before it happens.",
        consequences: { clout: 20000, heat: -500, biographyEntry: "Established a global intelligence network with Cole." },
        setFlags: { "cole_arc_complete": "ghost" }
      }
    ]
  }
];

const CHEN_ARC: NarrativeEvent[] = [
  {
    id: "char_chen_1_market",
    characterId: "char_chen",
    title: "Chen's Market Dominance",
    description: "Chen wants to monopolize the local retail market.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true },
    choices: [
      {
        id: "chen_monopolize",
        label: "Monopolize",
        description: "Commit $1M to the effort.",
        consequences: { bag: -1000000, passiveCash: 20000, aura: -500 },
        setFlags: { "chen_monopoly": true, "rel_chen": 100 }
      }
    ]
  },
  {
    id: "char_chen_2_franchise",
    characterId: "char_chen",
    title: "Global Franchising",
    description: "Chen wants to take the retail model national.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "chen_monopoly": true } },
    choices: [
      {
        id: "chen_go_national",
        label: "Go National",
        description: "Invest $10M in franchising.",
        consequences: { bag: -10000000, passiveCash: 100000 },
        setFlags: { "chen_national_active": true }
      }
    ]
  },
  {
    id: "char_chen_3_retail_god",
    characterId: "char_chen",
    title: "Retail Empire",
    description: "Your brand is now in every city in the country.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "chen_national_active": true } },
    choices: [
      {
        id: "chen_rule_retail",
        label: "Absolute Dominance",
        description: "Squeeze out all competition.",
        consequences: { clout: 5000, passiveCash: 250000, biographyEntry: "Built a national retail empire with Chen." },
        setFlags: { "chen_arc_complete": "magnate" }
      }
    ]
  },
  {
    id: "char_chen_summers_summit",
    characterId: "char_chen",
    title: "The Valuation Clash",
    description: "Lawrence Chen and Brooke Summers are having a heated discussion in your waiting room. Chen values your liquid stability, while Summers is pushing for more viral expansion. \"He's a portfolio asset, Brooke, not a streaming star,\" Chen snaps.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.15, once: true },
    choices: [
      {
        id: "side_with_chen",
        label: "Side with Chen",
        description: "Prioritize institutional stability over hype.",
        consequences: { passiveCash: 10000, clout: 200, aura: -100, biographyEntry: "Sided with Lawrence Chen in a major strategy dispute, choosing stability over viral growth." },
        setFlags: { "strategy_focus": "institutional", "rel_chen": 80, "rel_summers": 20 }
      },
      {
        id: "side_with_summers",
        label: "Side with Summers",
        description: "Lean into the digital era and public image.",
        consequences: { aura: 500, clout: 300, bag: -100000, biographyEntry: "Chose Brooke Summers' viral-first strategy, betting the empire on public perception." },
        setFlags: { "strategy_focus": "viral", "rel_summers": 80, "rel_chen": 20 }
      }
    ]
  }
];

const SOFIA_ARC: NarrativeEvent[] = [
  {
    id: "char_sofia_1_charity",
    characterId: "char_sofia_ramirez",
    arcId: "arc_sofia_ramirez",
    title: "The Sofia Foundation",
    description: "Sofia wants you to head a global charity.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "sofia_lead",
        label: "Lead the Foundation",
        description: "Commit $10M to global charity.",
        consequences: { bag: -10000000, aura: 5000, clout: 1000 },
        setFlags: { "sofia_charity_active": true, "rel_sofia": 100 }
      }
    ]
  },
  {
    id: "char_sofia_2_un",
    characterId: "char_sofia_ramirez",
    arcId: "arc_sofia_ramirez",
    title: "The Diplomat",
    description: "Sofia has arranged a meeting at the United Nations.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "sofia_charity_active": true } },
    choices: [
      {
        id: "sofia_un_speech",
        label: "Address the UN",
        description: "Present your vision for the world.",
        consequences: { aura: 10000, clout: 2000 },
        setFlags: { "sofia_un_active": true }
      }
    ]
  },
  {
    id: "char_sofia_3_peace",
    characterId: "char_sofia_ramirez",
    arcId: "arc_sofia_ramirez",
    title: "World Peace Architect",
    description: "You've successfully mediated a major international conflict.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "sofia_un_active": true } },
    choices: [
      {
        id: "sofia_nobel",
        label: "Accept Nobel Peace Prize",
        description: "Finalize your legacy as a humanitarian.",
        consequences: { aura: 50000, clout: 10000, biographyEntry: "Achieved world peace alongside Sofia Ramirez." },
        setFlags: { "sofia_arc_complete": "saint" }
      }
    ]
  }
];

const GHOST_ARC: NarrativeEvent[] = [
  {
    id: "char_ghost_1_darknet",
    characterId: "char_ghost",
    arcId: "arc_ghost_network",
    title: "The Ghost Network",
    description: "Ghost offers a proprietary darknet for communications.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true },
    choices: [
      {
        id: "ghost_join",
        label: "Join the Network",
        description: "Pay $500k for access.",
        consequences: { bag: -500000, heat: -200, clout: 300 },
        setFlags: { "ghost_network_active": true, "rel_ghost": 100 }
      }
    ]
  },
  {
    id: "char_ghost_2_crypto",
    characterId: "char_ghost",
    arcId: "arc_ghost_network",
    title: "Ghost Currency",
    description: "Ghost wants to launch a new, untraceable global currency.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "ghost_network_active": true } },
    choices: [
      {
        id: "ghost_launch_crypto",
        label: "Launch GhostCoin",
        description: "Establish the digital black market.",
        consequences: { bag: -5000000, passiveCash: 50000, heat: 40 },
        setFlags: { "ghost_crypto_active": true }
      }
    ]
  },
  {
    id: "char_ghost_3_shadow_bank",
    characterId: "char_ghost",
    arcId: "arc_ghost_network",
    title: "The Shadow Bank",
    description: "You now control the world's premier digital shadow bank.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "ghost_crypto_active": true } },
    choices: [
      {
        id: "ghost_shadow_control",
        label: "Rule the Shadow Economy",
        description: "Become the financier of the underworld.",
        consequences: { clout: 20000, passiveCash: 200000, biographyEntry: "Masterminded the global shadow economy with Ghost." },
        setFlags: { "ghost_arc_complete": "overlord" }
      }
    ]
  }
];

const LEO_THORNE_ARC: NarrativeEvent[] = [
  {
    id: "char_leo_1_luxury",
    characterId: "char_leo_thorne",
    arcId: "arc_leo_lifestyle",
    title: "The Thorne Lifestyle",
    description: "Leo wants to design your global headquarters.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "leo_build",
        label: "Build the HQ",
        description: "Commit $50M to the HQ.",
        consequences: { bag: -50000000, aura: 2000, clout: 3000 },
        setFlags: { "leo_hq_built": true, "rel_leo": 100 }
      }
    ]
  },
  {
    id: "char_leo_2_lifestyle",
    characterId: "char_leo_thorne",
    arcId: "arc_leo_lifestyle",
    title: "Thorne Living",
    description: "Leo wants to design a whole city according to your vision.",
    trigger: { tier: ["PRESIDENT"], probability: 0.2, once: true, flagReqs: { "leo_hq_built": true } },
    choices: [
      {
        id: "leo_build_city",
        label: "Build Vane City",
        description: "Invest $500M in the private city.",
        consequences: { bag: -500000000, clout: 10000, aura: 5000 },
        setFlags: { "leo_city_active": true }
      }
    ]
  },
  {
    id: "char_leo_3_immortality",
    characterId: "char_leo_thorne",
    arcId: "arc_leo_lifestyle",
    title: "The Immortal Architect",
    description: "Leo's designs have redefined how humanity lives.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "leo_city_active": true } },
    choices: [
      {
        id: "leo_eternal",
        label: "Cement Eternal Design",
        description: "Become the immortal patron of the arts.",
        consequences: { aura: 100000, biographyEntry: "Redefined the global skyline with Leo Thorne." },
        setFlags: { "leo_arc_complete": "legend" }
      }
    ]
  }
];

const SARAH_ARC: NarrativeEvent[] = [
  {
    id: "char_sarah_1_policy",
    characterId: "char_sarah_jenkins",
    arcId: "arc_sarah_jenkins",
    title: "The Sarah Policy",
    description: "Sarah wants to implement a revolutionary social policy.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "sarah_enact",
        label: "Enact the Policy",
        description: "Spend $20M to fund the program.",
        consequences: { bag: -20000000, aura: 10000, clout: 2000 },
        setFlags: { "sarah_policy_active": true, "rel_sarah": 100 }
      }
    ]
  },
  {
    id: "char_sarah_2_global_policy",
    characterId: "char_sarah_jenkins",
    arcId: "arc_sarah_jenkins",
    title: "The Global UBI",
    description: "Sarah wants to take the social policy global.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.2, once: true, flagReqs: { "sarah_policy_active": true } },
    choices: [
      {
        id: "sarah_fund_global",
        label: "Fund the Global Pilot",
        description: "Commit $100M to the program.",
        consequences: { bag: -100000000, aura: 20000, clout: 5000 },
        setFlags: { "sarah_global_ubi_active": true }
      }
    ]
  },
  {
    id: "char_sarah_3_utopia",
    characterId: "char_sarah_jenkins",
    arcId: "arc_sarah_jenkins",
    title: "Architect of Utopia",
    description: "Poverty has been officially eliminated.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "sarah_global_ubi_active": true } },
    choices: [
      {
        id: "sarah_accept_gratitude",
        label: "Accept the Gratitude",
        description: "Be remembered as the savior.",
        consequences: { aura: 100000, biographyEntry: "Eliminated global poverty with Sarah Jenkins." },
        setFlags: { "sarah_arc_complete": "savior" }
      }
    ]
  }
];

const VOLKOV_ARC: NarrativeEvent[] = [
  {
    id: "char_volkov_1_resource",
    characterId: "char_volkov",
    arcId: "arc_volkov_energy",
    title: "The Volkov Resource",
    description: "Volkov offers control of the regional energy grid.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "volkov_monopoly_partner",
        label: "Control the Grid",
        description: "Commit $100M to the monopoly.",
        consequences: { bag: -100000000, passiveCash: 1000000, clout: 5000 },
        setFlags: { "volkov_monopoly": true, "rel_volkov": 100 }
      }
    ]
  },
  {
    id: "char_volkov_2_fusion",
    characterId: "char_volkov",
    arcId: "arc_volkov_energy",
    title: "The Fusion Breakthrough",
    description: "Volkov's scientists have cracked cold fusion.",
    trigger: { tier: ["OPEN"], probability: 0.2, once: true, flagReqs: { "volkov_monopoly": true } },
    choices: [
      {
        id: "volkov_deploy_fusion",
        label: "Deploy Fusion Power",
        description: "Establish total hegemony.",
        consequences: { passiveCash: 5000000, clout: 10000, aura: 5000 },
        setFlags: { "volkov_fusion_active": true }
      }
    ]
  },
  {
    id: "char_volkov_3_dyson",
    characterId: "char_volkov",
    arcId: "arc_volkov_energy",
    title: "The Dyson Sphere",
    description: "Volkov is looking at the sun.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "volkov_fusion_active": true } },
    choices: [
      {
        id: "volkov_fund_dyson",
        label: "Fund the Dyson Sphere",
        description: "Commit everything to the star-forge.",
        consequences: { bag: -1000000000, clout: 100000, biographyEntry: "Financed the construction of the Dyson Sphere with Volkov." },
        setFlags: { "volkov_arc_complete": "stellar" }
      }
    ]
  }
];

const ELENA_ARC: NarrativeEvent[] = [
  {
    id: "char_elena_1_legacy",
    characterId: "char_elena_vance",
    arcId: "arc_elena_vance",
    title: "The Vance Legacy",
    description: "Elena wants to unite the families.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.3, once: true },
    choices: [
      {
        id: "elena_marry",
        label: "The Royal Union",
        description: "Unite the dynasties.",
        consequences: { clout: 10000, aura: 5000 },
        setFlags: { "vance_union": true, "rel_elena": 150 }
      }
    ]
  },
  {
    id: "char_elena_2_expansion",
    characterId: "char_elena_vance",
    arcId: "arc_elena_vance",
    title: "Dynamic Expansion",
    description: "Elena has identified new markets for the union.",
    trigger: { tier: ["OPEN"], probability: 0.2, once: true, flagReqs: { "vance_union": true } },
    choices: [
      {
        id: "elena_fund_expansion",
        label: "Fund the Union",
        description: "Spend $500M on the joint venture.",
        consequences: { bag: -500000000, passiveCash: 5000000 },
        setFlags: { "elena_expansion_active": true }
      }
    ]
  },
  {
    id: "char_elena_3_world_rule",
    characterId: "char_elena_vance",
    arcId: "arc_elena_vance",
    title: "The Uncontested Rule",
    description: "The Player-Vance union now effectively rules the world.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "elena_expansion_active": true } },
    choices: [
      {
        id: "elena_ascend",
        label: "Rule Forever",
        description: "Solidify the eternal dynasty.",
        consequences: { clout: 100000, aura: 50000, biographyEntry: "Established an eternal world dynasty alongside Elena Vance." },
        setFlags: { "elena_arc_complete": "emperor" }
      }
    ]
  }
];

const STONE_ARC: NarrativeEvent[] = [
  {
    id: "char_stone_1_kingmaker",
    characterId: "char_stone",
    arcId: "arc_stone_politics",
    title: "Marcus Stone: The Kingmaker",
    description: "Marcus Stone approaches you. \"I can put you in the Oval Office. But it requires absolute loyalty.\"",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "stone_accept",
        label: "Accept the Deal",
        description: "Begin the dirty campaign.",
        consequences: { clout: 500, aura: -500, heat: 50 },
        setFlags: { "kingmaker_active": true, "rel_stone": 100 }
      }
    ]
  },
  {
    id: "char_stone_2_the_leak",
    characterId: "char_stone",
    arcId: "arc_stone_politics",
    title: "Opposition Research",
    description: "Marcus Stone has dirt on your opponent. \"I need 250k to distribute it.\"",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "kingmaker_active": true } },
    choices: [
      {
        id: "stone_leak_dirt",
        label: "Release the Kraken",
        description: "Destroy your opponent's reputation.",
        consequences: { clout: 300, aura: -500, heat: 30 },
        setFlags: { "stone_strategy": "dirty", "rel_stone": 100 }
      }
    ]
  },
  {
    id: "char_stone_3_the_debate",
    characterId: "char_stone",
    arcId: "arc_stone_politics",
    title: "The Staged Debate",
    description: "Stone wants to feed you questions via neural link.",
    trigger: { tier: ["PRESIDENT"], probability: 0.25, once: true, flagReqs: { "rel_stone": 100 } },
    choices: [
      {
        id: "stone_use_link",
        label: "Use the Link",
        description: "Flawless performance.",
        consequences: { clout: 500, aura: 200, biographyEntry: "Delivered a historically flawless debate performance." },
        setFlags: { "debate_result": "perfect" }
      }
    ]
  }
];

const VALDEZ_ARC: NarrativeEvent[] = [
  {
    id: "char_valdez_1_espionage",
    characterId: "char_valdez",
    arcId: "arc_valdez_intel",
    title: "The Corporate Ghost",
    description: "Sofia Valdez offers encryption keys to your rival's servers.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true },
    choices: [
      {
        id: "valdez_buy_keys",
        label: "Buy the Keys",
        description: "Gain absolute knowledge for $500k.",
        consequences: { bag: -500000, clout: 200, heat: 15 },
        setFlags: { "valdez_spy": true, "rel_valdez": 100 }
      }
    ]
  },
  {
    id: "char_valdez_2_intel",
    characterId: "char_valdez",
    arcId: "arc_valdez_intel",
    title: "The Deep Dive",
    description: "Valdez has found a major vulnerability in the national infrastructure.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "valdez_spy": true } },
    choices: [
      {
        id: "valdez_exploit",
        label: "Exploit the System",
        description: "Redirect funds to your accounts.",
        consequences: { bag: 5000000, heat: 100, aura: -500 },
        setFlags: { "valdez_heist_complete": true }
      }
    ]
  },
  {
    id: "char_valdez_3_shadow",
    characterId: "char_valdez",
    arcId: "arc_valdez_intel",
    title: "The Shadow Advisor",
    description: "Valdez wants to head your new private intelligence arm.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "valdez_heist_complete": true } },
    choices: [
      {
        id: "valdez_appoint",
        label: "Appoint Valdez",
        description: "Control the shadows.",
        consequences: { clout: 5000, heat: -200, biographyEntry: "Established a global shadow intelligence network with Sofia Valdez." },
        setFlags: { "valdez_arc_complete": "ghost" }
      }
    ]
  }
];

const DYNASTY_ARC: NarrativeEvent[] = [
  {
    id: "dynasty_1_the_heir",
    title: "The Unwanted Legacy",
    pacingCategory: 'MAJOR',
    arcId: "arc_dynasty_succession",
    description: "A man claiming to be your son arrives. He wants a seat at the table.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.1, once: true },
    choices: [
      {
        id: "dynasty_embrace",
        label: "Acknowledge Him",
        description: "Bring him into the fold.",
        consequences: { bag: -1000000, aura: 500, clout: 200, biographyEntry: "Publicly acknowledged a long-lost heir." },
        setFlags: { "dynasty_status": "heir_active" }
      }
    ]
  },
  {
    id: "dynasty_2_training",
    title: "The Heir's Ascent",
    pacingCategory: 'MAJOR',
    arcId: "arc_dynasty_succession",
    description: "Your heir is proving capable, but needs a billion-dollar project to lead.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true, flagReqs: { "dynasty_status": "heir_active" } },
    choices: [
      {
        id: "dynasty_fund_project",
        label: "Fund the Project",
        description: "Spend $100M on the heir's venture.",
        consequences: { bag: -100000000, clout: 5000 },
        setFlags: { "dynasty_status": "heir_proven" }
      }
    ]
  },
  {
    id: "dynasty_3_succession",
    title: "The Passing of the Crown",
    pacingCategory: 'MAJOR',
    arcId: "arc_dynasty_succession",
    description: "The dynasty is secure. You are now a family of legends.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.15, once: true, flagReqs: { "dynasty_status": "heir_proven" } },
    choices: [
      {
        id: "dynasty_crown",
        label: "Secure the Succession",
        description: "Plan for the future.",
        consequences: { clout: 20000, aura: 10000, biographyEntry: "Established a permanent family dynasty." },
        setFlags: { "dynasty_arc_complete": "eternal" }
      }
    ]
  }
];

const PARTNER_ARC: NarrativeEvent[] = [
  {
    id: "partner_1_the_betrayal",
    title: "Et Tu, Brute?",
    pacingCategory: 'MAJOR',
    arcId: "arc_partner_betrayal",
    description: "Your business partner has been caught meeting with regulators.",
    trigger: { tier: ["CORPORATE", "ELITE", "MOGUL"], probability: 0.15, once: true },
    choices: [
      {
        id: "partner_liquidate",
        label: "Liquidate and Exile",
        description: "Banish them from the industry.",
        consequences: { bag: 1000000, clout: 300, aura: -300, biographyEntry: "Crushed a partner who attempted betrayal." },
        setFlags: { "partner_status": "liquidated" }
      }
    ]
  },
  {
    id: "partner_2_the_replacement",
    title: "The New Blood",
    pacingCategory: 'MAJOR',
    arcId: "arc_partner_betrayal",
    description: "You need a new right hand. An ambitious young shark has approached you.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "partner_status": "liquidated" } },
    choices: [
      {
        id: "partner_hire_shark",
        label: "Hire the Shark",
        description: "Bring on new energy.",
        consequences: { clout: 500, passiveCash: 25000 },
        setFlags: { "partner_status": "shark_active" }
      }
    ]
  },
  {
    id: "partner_3_synergy",
    title: "The Perfect Synergy",
    pacingCategory: 'MAJOR',
    arcId: "arc_partner_betrayal",
    description: "Your new partner has tripled the firm's efficiency.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "partner_status": "shark_active" } },
    choices: [
      {
        id: "partner_maximize",
        label: "Maximize Synergy",
        description: "Optimize the empire.",
        consequences: { passiveCash: 100000, clout: 5000, biographyEntry: "Achieved perfect operational synergy with a new partner." },
        setFlags: { "partner_arc_complete": "perfect" }
      }
    ]
  }
];

const BOARDROOM_ARC: NarrativeEvent[] = [
  {
    id: "board_1_the_coup",
    title: "The Midnight Coup",
    pacingCategory: 'MAJOR',
    arcId: "arc_boardroom_power",
    description: "Three board members called an emergency meeting to vote you out.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "board_purge",
        label: "The Scorch Policy",
        description: "Purge the conspirators.",
        consequences: { clout: 1000, aura: -500, biographyEntry: "Survived a boardroom coup by purging the conspirators." },
        setFlags: { "board_status": "purged" }
      }
    ]
  },
  {
    id: "board_2_consolidation",
    title: "Absolute Power",
    pacingCategory: 'MAJOR',
    arcId: "arc_boardroom_power",
    description: "With the conspirators gone, you can buy back their shares.",
    trigger: { tier: ["PRESIDENT"], probability: 0.2, once: true, flagReqs: { "board_status": "purged" } },
    choices: [
      {
        id: "board_buy_back",
        label: "Buy Back Control",
        description: "Spend $500M to own the firm outright.",
        consequences: { bag: -500000000, clout: 10000 },
        setFlags: { "board_status": "absolute" }
      }
    ]
  },
  {
    id: "board_3_the_monolith",
    title: "The Monolith",
    pacingCategory: 'MAJOR',
    arcId: "arc_boardroom_power",
    description: "You are the board. You are the firm. You are the law.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "board_status": "absolute" } },
    choices: [
      {
        id: "board_eternal",
        label: "Establish the Monolith",
        description: "Rule without oversight.",
        consequences: { clout: 50000, biographyEntry: "Transformed the firm into a monolith with absolute personal control." },
        setFlags: { "board_arc_complete": "monolith" }
      }
    ]
  }
];

const IPO_ARC: NarrativeEvent[] = [
  {
    id: "ipo_1_the_valuation",
    title: "The Trillion-Dollar Question",
    pacingCategory: 'MAJOR',
    arcId: "arc_ipo_dominance",
    description: "The banks are valuing your global holdings at over a trillion dollars.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "ipo_go_public",
        label: "Go Public",
        description: "Launch the world's largest IPO.",
        consequences: { bag: 10000000, clout: 1000, aura: 500, biographyEntry: "Launched the first trillion-dollar IPO." },
        setFlags: { "ipo_status": "public" }
      }
    ]
  },
  {
    id: "ipo_2_market_dom",
    title: "Market Dominance",
    pacingCategory: 'MAJOR',
    arcId: "arc_ipo_dominance",
    description: "Your stock has become the standard for the global economy.",
    trigger: { tier: ["PRESIDENT"], probability: 0.2, once: true, flagReqs: { "ipo_status": "public" } },
    choices: [
      {
        id: "ipo_acquire_rivals",
        label: "Acquire Everyone",
        description: "Buy all remaining competitors.",
        consequences: { bag: 100000000, clout: 10000 },
        setFlags: { "ipo_status": "dominant" }
      }
    ]
  },
  {
    id: "ipo_3_too_big",
    title: "Too Big to Fail",
    pacingCategory: 'MAJOR',
    arcId: "arc_ipo_dominance",
    description: "Your organization is now the single largest component of the global GDP.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "ipo_status": "dominant" } },
    choices: [
      {
        id: "ipo_eternal",
        label: "The Economic Pillar",
        description: "Become the backbone of the world.",
        consequences: { clout: 100000, biographyEntry: "Built an organization that became the backbone of the global economy." },
        setFlags: { "ipo_arc_complete": "pillar" }
      }
    ]
  }
];

const CARTEL_ARC: NarrativeEvent[] = [
  {
    id: "cartel_1_the_meeting",
    title: "The Southern Shadow",
    pacingCategory: 'MAJOR',
    arcId: "arc_cartel_shadow",
    description: "A powerful Southern cartel meets you in a private hangar.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.15, once: true },
    choices: [
      {
        id: "cartel_accept_pact",
        label: "Accept the Pact",
        description: "Partner for resource security.",
        consequences: { bag: 500000, heat: 60, aura: -300 },
        setFlags: { "cartel_member": true, "rel_cartel": 100 }
      }
    ]
  },
  {
    id: "cartel_2_the_crackdown",
    title: "The Federal Heat",
    pacingCategory: 'MAJOR',
    arcId: "arc_cartel_shadow",
    description: "The DEA is closing in on the cartel's shipments.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.2, once: true, flagReqs: { "cartel_member": true } },
    choices: [
      {
        id: "cartel_betray_them",
        label: "Betray the Cartel",
        description: "Feed the feds their location.",
        consequences: { heat: -100, aura: 500, clout: 200, biographyEntry: "Dismantled a major international cartel." },
        setFlags: { "cartel_arc_complete": "betrayed", "rel_cartel": -500 }
      }
    ]
  },
  {
    id: "cartel_3_new_order",
    title: "The Power Vacuum",
    pacingCategory: 'MAJOR',
    arcId: "arc_cartel_shadow",
    description: "With the old cartel gone, you can install your own leadership.",
    trigger: { tier: ["MOGUL", "PRESIDENT"], probability: 0.15, once: true, flagReqs: { "cartel_arc_complete": "betrayed" } },
    choices: [
      {
        id: "cartel_install_puppet",
        label: "Install a Puppet",
        description: "Control the supply chain from the shadows.",
        consequences: { passiveCash: 50000, clout: 1000 },
        setFlags: { "cartel_controlled": true }
      }
    ]
  }
];

const DIGITAL_SYNDICATE_ARC: NarrativeEvent[] = [
  {
    id: "digi_sync_1_the_offer",
    title: "The Silicon Underground",
    pacingCategory: 'MAJOR',
    arcId: "arc_digital_syndicate",
    description: "Elite hackers offer to 'optimize' your competitor's servers.",
    trigger: { tier: ["STARTUP", "CORPORATE"], probability: 0.2, once: true },
    choices: [
      {
        id: "digi_sync_hire",
        label: "Hire the Collective",
        description: "Pay $50k for sabotage.",
        consequences: { bag: -50000, clout: 100, heat: 20 },
        setFlags: { "digi_sync_active": true, "rel_digi": 80 }
      }
    ]
  },
  {
    id: "digi_sync_2_the_extortion",
    title: "The Table Turns",
    pacingCategory: 'MAJOR',
    arcId: "arc_digital_syndicate",
    description: "The collective is now extorting YOU.",
    trigger: { tier: ["CORPORATE", "ELITE"], probability: 0.2, once: true, flagReqs: { "digi_sync_active": true } },
    choices: [
      {
        id: "digi_sync_trace_and_destroy",
        label: "Trace and Destroy",
        description: "Neutralize the ring.",
        consequences: { bag: -500000, clout: 200, heat: 40, biographyEntry: "Neutralized a high-tech extortion ring." },
        setFlags: { "digi_sync_arc_complete": "neutralized" }
      }
    ]
  },
  {
    id: "digi_sync_3_cyber_shield",
    title: "The Cyber Shield",
    pacingCategory: 'MAJOR',
    arcId: "arc_digital_syndicate",
    description: "You've built the world's most robust digital defense system.",
    trigger: { tier: ["ELITE", "MOGUL"], probability: 0.15, once: true, flagReqs: { "digi_sync_arc_complete": "neutralized" } },
    choices: [
      {
        id: "digi_shield_activate",
        label: "Activate the Shield",
        description: "Make your systems impenetrable.",
        consequences: { heat: -50, clout: 1000 },
        setFlags: { "digi_shield_active": true }
      }
    ]
  }
];

const PEACE_ARC: NarrativeEvent[] = [
  {
    id: "peace_1_the_crisis",
    title: "The Brink of War",
    pacingCategory: 'MAJOR',
    arcId: "arc_peace_order",
    description: "Two of your largest trade partners are on the verge of conflict.",
    trigger: { tier: ["PRESIDENT"], probability: 0.2, once: true },
    choices: [
      {
        id: "peace_mediate",
        label: "Force Mediation",
        description: "Hold a summit.",
        consequences: { bag: -5000000, aura: 1000, clout: 500, biographyEntry: "Averted a global conflict." },
        setFlags: { "peace_status": "hero", "rel_world": 150 }
      }
    ]
  },
  {
    id: "peace_2_stabilization",
    title: "Global Stabilization",
    pacingCategory: 'MAJOR',
    arcId: "arc_peace_order",
    description: "The peace accords have held. The world economy is booming.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.2, once: true, flagReqs: { "peace_status": "hero" } },
    choices: [
      {
        id: "peace_economic_pact",
        label: "Enact Economic Pact",
        description: "Unify the trade markets.",
        consequences: { passiveCash: 100000, clout: 2000 },
        setFlags: { "peace_status": "architect" }
      }
    ]
  },
  {
    id: "peace_3_global_order",
    title: "The New Global Order",
    pacingCategory: 'MAJOR',
    arcId: "arc_peace_order",
    description: "The world is unified under a single economic and political banner.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "peace_status": "architect" } },
    choices: [
      {
        id: "peace_eternal",
        label: "Rule the Unified World",
        description: "Become the first Global Governor.",
        consequences: { clout: 100000, aura: 100000, biographyEntry: "Masterminded the unification of the global order." },
        setFlags: { "peace_arc_complete": "governor" }
      }
    ]
  }
];

const MONUMENT_ARC: NarrativeEvent[] = [
  {
    id: "monument_1_the_architect",
    title: "The Eternal Vane",
    pacingCategory: 'MAJOR',
    arcId: "arc_monument_legacy",
    description: "A world-renowned architect proposes a city-sized monument.",
    trigger: { tier: ["PRESIDENT", "OPEN"], probability: 0.2, once: true },
    choices: [
      {
        id: "monument_build",
        label: "Build the Monument",
        description: "Spend $50M on the structure.",
        consequences: { bag: -50000000, clout: 2000, aura: 1000, biographyEntry: "Constructed a city-sized monument." },
        setFlags: { "monument_status": "built" }
      }
    ]
  },
  {
    id: "monument_2_expansion",
    title: "The Living City",
    pacingCategory: 'MAJOR',
    arcId: "arc_monument_legacy",
    description: "The monument has become the core of a new, hyper-tech city.",
    trigger: { tier: ["OPEN"], probability: 0.2, once: true, flagReqs: { "monument_status": "built" } },
    choices: [
      {
        id: "monument_expand_city",
        label: "Expand the City",
        description: "Commit $500M to the urban expansion.",
        consequences: { bag: -500000000, clout: 10000, aura: 5000 },
        setFlags: { "monument_status": "metropolis" }
      }
    ]
  },
  {
    id: "monument_3_immortality",
    title: "Immortal Legacy",
    pacingCategory: 'MAJOR',
    arcId: "arc_monument_legacy",
    description: "Your city is now the capital of human civilization.",
    trigger: { tier: ["OPEN"], probability: 0.15, once: true, flagReqs: { "monument_status": "metropolis" } },
    choices: [
      {
        id: "monument_eternal",
        label: "The Eternal Ruler",
        description: "Become an immortal legend.",
        consequences: { clout: 100000, aura: 100000, biographyEntry: "Built the eternal capital of human civilization." },
        setFlags: { "monument_arc_complete": "immortal" }
      }
    ]
  }
];

const CABINET_ARC: NarrativeEvent[] = [
  {
    id: 'cab_disagreement_1',
    title: 'Cabinet Friction',
    pacingCategory: 'PRESIDENCY',
    arcId: 'arc_cabinet_friction',
    description: 'Internal reports suggest significant disagreements between your cabinet members. Tensions are leaking to the press.',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.15,
      minMonth: 12
    },
    choices: [
      {
        id: 'cab_friction_unify',
        label: 'Force a Consensus',
        description: 'Demand they get in line or get out.',
        consequences: { aura: 20, mentalHealth: -10, biographyEntry: 'Enforced a strict "one voice" policy in the cabinet.' },
        setFlags: { cab_consensus: 1 }
      },
      {
        id: 'cab_friction_rivalry',
        label: 'Encourage Competition',
        description: 'Let them battle it out. The best ideas will rise.',
        consequences: { clout: 30, heat: 10, biographyEntry: 'Allowed internal rivalries to sharpen the administration\'s edge.' },
        setFlags: { cab_rivalry: 1 }
      }
    ]
  },
  {
    id: 'cab_scandal_1',
    title: 'Media Praise',
    pacingCategory: 'PRESIDENCY',
    arcId: 'arc_cabinet_friction',
    description: 'A major news outlet has published a glowing profile of your cabinet\'s competence, calling it the "most efficient in a generation."',
    trigger: {
      tier: ['PRESIDENT'],
      probability: 0.1,
      minMonth: 6
    },
    choices: [
      {
        id: 'cab_praise_humble',
        label: 'Share the Credit',
        description: 'The success belongs to the team.',
        consequences: { aura: 15, biographyEntry: 'Humbly shared the success of the administration with the entire cabinet.' },
        setFlags: { cab_loyal_boost: 1 }
      },
      {
        id: 'cab_praise_self',
        label: 'Take the Lead',
        description: 'I chose them. I lead them.',
        consequences: { clout: 20, aura: -5, biographyEntry: 'Asserted personal leadership as the key driver of cabinet success.' }
      }
    ]
  }
];

export const NARRATIVE_EVENTS: NarrativeEvent[] = [
  ...BASE_EVENTS,
  ...POPS_ARC,
  ...TWITCH_ARC,
  ...SLICK_ARC,
  ...ROSA_ARC,
  ...MILLER_COP_ARC,
  ...JDOG_ARC,
  ...CASSIE_ARC,
  ...RAY_ARC,
  ...LEXI_ARC,
  ...DANTE_ARC,
  ...LILA_ARC,
  ...BIG_G_ARC,
  ...TESSA_ARC,
  ...CLARK_ARC,
  ...SUMMERS_ARC,
  ...KHALID_ARC,
  ...JULIAN_VANE_ARC,
  ...ELARA_ARC,
  ...GARRETT_ARC,
  ...SELENA_ROSSO_ARC,
  ...HUDSON_REED_ARC,
  ...NAOMI_WEST_ARC,
  ...ARTHUR_BENNETT_ARC,
  ...FIONA_GLASS_ARC,
  ...STERLING_VANE_ARC,
  ...IVY_CHEN_ARC,
  ...DOMINIC_RUSSO_ARC,
  ...CAMILLE_DUBOIS_ARC,
  ...XAVIER_THORNE_ARC,
  ...OLIVIA_WEST_ARC,
  ...MARCUS_ARC,
  ...ASHLEY_ARC,
  ...COLE_ARC,
  ...CHEN_ARC,
  ...SOFIA_ARC,
  ...GHOST_ARC,
  ...LEO_THORNE_ARC,
  ...SARAH_ARC,
  ...VOLKOV_ARC,
  ...ELENA_ARC,
  ...STONE_ARC,
  ...VALDEZ_ARC,
  ...DYNASTY_ARC,
  ...PARTNER_ARC,
  ...BOARDROOM_ARC,
  ...IPO_ARC,
  ...CARTEL_ARC,
  ...DIGITAL_SYNDICATE_ARC,
  ...PEACE_ARC,
  ...MONUMENT_ARC,
  ...CABINET_ARC,
];
