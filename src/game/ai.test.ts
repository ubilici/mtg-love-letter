import { describe, expect, it } from "vitest";
import type { CardValue } from "./cards";
import { decideBotMove } from "./ai";
import {
  createMatch,
  forcedCountess,
  isHumanTurn,
  legalTargets,
  playableCards,
  playCard,
  beginNextRound,
} from "./engine";
import { createKnowledge } from "./knowledge";
import type { GameState, Player } from "./types";

function mkPlayer(id: number, hand: CardValue[], over: Partial<Player> = {}): Player {
  return {
    id,
    name: `Bot ${id}`,
    isBot: true,
    hand: [...hand],
    discards: [],
    favor: 0,
    isOut: false,
    isProtected: false,
    knowledge: createKnowledge(),
    ...over,
  };
}

function mkState(hands: CardValue[][], over: Partial<GameState> = {}): GameState {
  return {
    players: hands.map((h, i) => mkPlayer(i, h)),
    deck: [6, 2, 4, 1, 3],
    setAsideCard: 7,
    faceUpCards: [],
    currentPlayerIndex: 0,
    phase: "awaitingPlay",
    round: 1,
    log: [],
    logCounter: 0,
    tokensToWin: 4,
    roundWinnerIds: [],
    matchWinnerId: null,
    lastReveal: null,
    seed: 1,
    ...over,
  };
}

describe("bot decisions", () => {
  it("always discards Countess when forced", () => {
    const s = mkState([[7, 6], [2], [3], [4]]);
    expect(forcedCountess(s.players[0].hand)).toBe(true);
    expect(decideBotMove(s, 0).card).toBe(7);
  });

  it("never voluntarily discards the Princess", () => {
    const s = mkState([[8, 3], [2], [4], [5]]);
    expect(decideBotMove(s, 0).card).not.toBe(8);
  });

  it("produces a legal card and target", () => {
    for (let seed = 0; seed < 40; seed++) {
      let s = createMatch(["You", "B1", "B2", "B3"], seed);
      let steps = 0;
      while (s.phase !== "matchOver" && steps < 2000) {
        if (s.phase === "roundOver") {
          s = beginNextRound(s);
          continue;
        }
        const actor = s.currentPlayerIndex;
        const decision = isHumanTurn(s)
          ? decideBotMove(s, actor)
          : decideBotMove(s, actor);
        const legal = playableCards(s.players[actor].hand);
        expect(legal).toContain(decision.card);
        if (decision.targetId !== undefined) {
          const targets = legalTargets(s, actor, decision.card);
          expect(targets).toContain(decision.targetId);
        }
        s = playCard(s, decision);
        steps++;
      }
      expect(s.phase).toBe("matchOver");
      expect(s.matchWinnerId).not.toBeNull();
    }
  });

  it("uses a known card to make a lethal Guard guess", () => {
    const s = mkState([[1, 4], [5], [2], [3]]);
    s.players[0].knowledge.known[1] = 5;
    const d = decideBotMove(s, 0);
    expect(d.card).toBe(1);
    expect(d.targetId).toBe(1);
    expect(d.guess).toBe(5);
  });
});
