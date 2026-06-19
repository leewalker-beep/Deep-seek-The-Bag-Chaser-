export interface Background {
  id: string;
  name: string;
  description: string;
  flavor: string; // shown when selected
  starterBag: number;
  starterClout: number;
  starterAura: number;
  newsReferences: string[]; // recurring news ticker lines
}

export const BACKGROUNDS: Background[] = [
  {
    id: 'street_kid',
    name: 'Street Kid',
    description: 'You grew up with nothing. Every dollar feels like survival.',
    flavor: 'The streets raised you. You learned to fight, scrape, and survive before you could read.',
    starterBag: 500,
    starterClout: 0,
    starterAura: 10,
    newsReferences: [
      'The Street Kid who made it.',
      'From the streets to the boardroom.',
      'They said you\'d never make it. They were wrong.',
    ]
  },
  {
    id: 'dropout',
    name: 'The Dropout',
    description: 'You left school early to chase money. You have something to prove.',
    flavor: 'You took your parents\' savings and bet on yourself. Failure is not an option.',
    starterBag: 1000,
    starterClout: 10,
    starterAura: 0,
    newsReferences: [
      'The Dropout who built an empire.',
      'No degree, no problem.',
      'They laughed at you. Now they work for you.',
    ]
  },
  {
    id: 'benefactor',
    name: 'The Benefactor',
    description: 'A family friend gave you a head start. You carry their legacy.',
    flavor: 'Your parents died in a crash. A family friend gave you $25k and told you to make something of yourself.',
    starterBag: 25000,
    starterClout: 5,
    starterAura: 5,
    newsReferences: [
      'The Benefactor\'s protégé rises.',
      'A legacy continued.',
      'They believed in you. You proved them right.',
    ]
  },
  {
    id: 'legacy',
    name: 'The Legacy',
    description: 'Your family had money once. You\'re the last chance to restore the name.',
    flavor: 'Your family built an empire. Then they lost it. Now it\'s your turn to rebuild.',
    starterBag: 10000,
    starterClout: 5,
    starterAura: 5,
    newsReferences: [
      'The family name restored.',
      'A legacy reborn.',
      'The heir who reclaimed it all.',
    ]
  },
  {
    id: 'gambler',
    name: 'The Gambler',
    description: 'You\'ve always bet on yourself. High risk, high reward.',
    flavor: 'You start with a gambling debt to repay. But you\'ve never lost a bet that mattered.',
    starterBag: 5000,
    starterClout: 0,
    starterAura: 10,
    newsReferences: [
      'The Gambler took a risk and won.',
      'All bets are off.',
      'They said it was a gamble. You called it destiny.',
    ]
  },
];
