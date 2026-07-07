export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type CardRole =
  | "Guard"
  | "Priest"
  | "Baron"
  | "Handmaid"
  | "Prince"
  | "King"
  | "Countess"
  | "Princess";

export interface CardDef {
  value: CardValue;
  role: CardRole;
  mtgName: string;
  art: string;
  count: number;
  needsTarget: boolean;
  needsGuess: boolean;
  canTargetSelf: boolean;
  description: string;
  flavor: string;
}

export const CARD_DEFS: Record<CardValue, CardDef> = {
  1: {
    value: 1,
    role: "Guard",
    mtgName: "Zombie",
    art: "/cards/01_zombie.png",
    count: 5,
    needsTarget: true,
    needsGuess: true,
    canTargetSelf: false,
    description:
      "Name a value from 2 to 8 and a rival. If they hold it, they are cast out.",
    flavor: "A shambling servant claws at another's secret.",
  },
  2: {
    value: 2,
    role: "Priest",
    mtgName: "Dark Confidant",
    art: "/cards/02_dark_confidant.png",
    count: 2,
    needsTarget: true,
    needsGuess: false,
    canTargetSelf: false,
    description: "Look at a rival's hand in secret.",
    flavor: "Bob peeks at the card fate has dealt.",
  },
  3: {
    value: 3,
    role: "Baron",
    mtgName: "Deadly Assassin",
    art: "/cards/03_deadly_assassin.png",
    count: 2,
    needsTarget: true,
    needsGuess: false,
    canTargetSelf: false,
    description: "Compare hands with a rival. The lesser is cast out.",
    flavor: "A silent blade settles the matter of worth.",
  },
  4: {
    value: 4,
    role: "Handmaid",
    mtgName: "Grave Titan",
    art: "/cards/04_grave_titan.png",
    count: 2,
    needsTarget: false,
    needsGuess: false,
    canTargetSelf: false,
    description: "You cannot be targeted until your next turn.",
    flavor: "None dare approach the towering guardian.",
  },
  5: {
    value: 5,
    role: "Prince",
    mtgName: "The Raven Man",
    art: "/cards/05_the_raven_man.png",
    count: 2,
    needsTarget: true,
    needsGuess: false,
    canTargetSelf: true,
    description: "Choose anyone (even yourself) to discard and draw anew.",
    flavor: "His ravens whisper: cast that card aside.",
  },
  6: {
    value: 6,
    role: "King",
    mtgName: "Nicol Bolas",
    art: "/cards/06_nicol_bolas.png",
    count: 1,
    needsTarget: true,
    needsGuess: false,
    canTargetSelf: false,
    description: "Trade hands with a rival.",
    flavor: "The Elder Dragon rewrites the terms of the game.",
  },
  7: {
    value: 7,
    role: "Countess",
    mtgName: "Griselbrand",
    art: "/cards/07_griselbrand.png",
    count: 1,
    needsTarget: false,
    needsGuess: false,
    canTargetSelf: false,
    description:
      "No effect, but must be discarded if held with Nicol Bolas or The Raven Man.",
    flavor: "The demon's bargain will not abide a rival crown.",
  },
  8: {
    value: 8,
    role: "Princess",
    mtgName: "Liliana Vess",
    art: "/cards/08_liliana_vess.png",
    count: 1,
    needsTarget: false,
    needsGuess: false,
    canTargetSelf: false,
    description: "If you ever discard her, you are cast out.",
    flavor: "Lose Liliana's favor and lose everything.",
  },
};

export const ALL_VALUES: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8];

export const TOTAL_CARDS = ALL_VALUES.reduce(
  (sum, v) => sum + CARD_DEFS[v].count,
  0,
);

export function buildDeck(): CardValue[] {
  const deck: CardValue[] = [];
  for (const v of ALL_VALUES) {
    for (let i = 0; i < CARD_DEFS[v].count; i++) deck.push(v);
  }
  return deck;
}

export function cardName(value: CardValue): string {
  const def = CARD_DEFS[value];
  return `${def.mtgName}`;
}
