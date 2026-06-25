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
