import type { CardValue } from "./cards";
import type { BotKnowledge } from "./knowledge";

export type PlayerId = number;

export interface Player {
  id: PlayerId;
  name: string;
  isBot: boolean;
  hand: CardValue[];
  discards: CardValue[];
  favor: number;
  isOut: boolean;
  isProtected: boolean;
  knowledge: BotKnowledge;
}

export type GamePhase =
  | "roundStart"
  | "awaitingPlay"
  | "resolving"
  | "roundOver"
  | "matchOver";

export interface LogEntry {
  id: number;
  round: number;
  actor: PlayerId | null;
  value?: CardValue;
  kind:
    | "info"
    | "play"
    | "eliminate"
    | "peek"
    | "swap"
    | "compare"
    | "discard"
    | "protect"
    | "favor"
    | "roundWin"
    | "matchWin";
  text: string;
}

export interface PendingReveal {
  viewerId: PlayerId;
  targetId: PlayerId;
  card: CardValue;
}

export interface GameState {
  players: Player[];
  deck: CardValue[];
  setAsideCard: CardValue | null;
  faceUpCards: CardValue[];
  currentPlayerIndex: number;
  phase: GamePhase;
  round: number;
  log: LogEntry[];
  logCounter: number;
  tokensToWin: number;
  roundWinnerIds: PlayerId[];
  matchWinnerId: PlayerId | null;
  lastReveal: PendingReveal | null;
  seed: number;
}

export interface PlayDecision {
  card: CardValue;
  targetId?: PlayerId;
  guess?: CardValue;
}
