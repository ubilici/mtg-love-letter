import { describe, expect, it } from "vitest";
import { buildDeck, TOTAL_CARDS, type CardValue } from "./cards";
import {
  createMatch,
  forcedCountess,
  legalTargets,
  playableCards,
  playCard,
  beginNextRound,
  tokensForPlayers,
} from "./engine";
import { createKnowledge } from "./knowledge";
import type { GameState, Player } from "./types";

function mkPlayer(id: number, hand: CardValue[], over: Partial<Player> = {}): Player {
  return {
    id,
    name: id === 0 ? "You" : `Bot ${id}`,
    isBot: id !== 0,
    hand: [...hand],
    discards: [],
    favor: 0,
    isOut: false,
    isProtected: false,
    knowledge: createKnowledge(),
    ...over,
  };
}

function mkState(
  hands: CardValue[][],
  deck: CardValue[],
  over: Partial<GameState> = {},
): GameState {
  return {
    players: hands.map((h, i) => mkPlayer(i, h)),
    deck: [...deck],
    setAsideCard: null,
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

describe("deck", () => {
  it("has 16 cards with correct composition", () => {
    const deck = buildDeck();
    expect(deck.length).toBe(16);
    expect(TOTAL_CARDS).toBe(16);
    const counts = deck.reduce<Record<number, number>>((m, c) => {
      m[c] = (m[c] ?? 0) + 1;
      return m;
    }, {});
    expect(counts[1]).toBe(5);
    expect(counts[2]).toBe(2);
    expect(counts[3]).toBe(2);
    expect(counts[4]).toBe(2);
    expect(counts[5]).toBe(2);
    expect(counts[6]).toBe(1);
    expect(counts[7]).toBe(1);
    expect(counts[8]).toBe(1);
  });
});

describe("player counts", () => {
  it("tokensForPlayers uses official thresholds", () => {
    expect(tokensForPlayers(2)).toBe(7);
    expect(tokensForPlayers(3)).toBe(5);
    expect(tokensForPlayers(4)).toBe(4);
  });

  it("2-player match banishes 1 and reveals 3 face-up", () => {
    const s = createMatch(["You", "Sorin"], 7, tokensForPlayers(2));
    expect(s.players.length).toBe(2);
    expect(s.tokensToWin).toBe(7);
    expect(s.setAsideCard).not.toBeNull();
    expect(s.faceUpCards.length).toBe(3);
    // 16 - 1 setaside - 3 faceup - 2 dealt - 1 drawn = 9
    expect(s.deck.length).toBe(9);
  });

  it("3-player match has no face-up cards", () => {
    const s = createMatch(["You", "Sorin", "Chandra"], 3, tokensForPlayers(3));
    expect(s.players.length).toBe(3);
    expect(s.faceUpCards.length).toBe(0);
    // 16 - 1 setaside - 3 dealt - 1 drawn = 11
    expect(s.deck.length).toBe(11);
  });
});

describe("createMatch", () => {
  it("sets aside 1 card, deals 1 each, current player drew a 2nd", () => {
    const s = createMatch(["You", "B1", "B2", "B3"], 42);
    expect(s.setAsideCard).not.toBeNull();
    expect(s.players.filter((p) => !p.isOut).length).toBe(4);
    const current = s.players[s.currentPlayerIndex];
    expect(current.hand.length).toBe(2);
    const others = s.players.filter((_, i) => i !== s.currentPlayerIndex);
    for (const p of others) expect(p.hand.length).toBe(1);
    // 16 - 1 setaside - 4 dealt - 1 drawn = 10 left
    expect(s.deck.length).toBe(10);
    expect(s.phase).toBe("awaitingPlay");
  });
});

describe("Countess rule", () => {
  it("forces Countess when holding King or Prince", () => {
    expect(forcedCountess([7, 6])).toBe(true);
    expect(forcedCountess([7, 5])).toBe(true);
    expect(forcedCountess([7, 3])).toBe(false);
    expect(playableCards([7, 6])).toEqual([7]);
    expect(playableCards([3, 4])).toEqual([3, 4]);
  });
});

describe("Guard", () => {
  it("eliminates a correct guess", () => {
    const s = mkState([[1, 4], [3], [2], [5]], [6, 6]);
    const r = playCard(s, { card: 1, targetId: 1, guess: 3 });
    expect(r.players[1].isOut).toBe(true);
  });
  it("does nothing on a wrong guess", () => {
    const s = mkState([[1, 4], [3], [2], [5]], [6, 6]);
    const r = playCard(s, { card: 1, targetId: 1, guess: 5 });
    expect(r.players[1].isOut).toBe(false);
  });
});

describe("Baron", () => {
  it("eliminates the lower hand", () => {
    const s = mkState([[3, 7], [2], [4], [5]], [6, 6]);
    const r = playCard(s, { card: 3, targetId: 1 });
    expect(r.players[1].isOut).toBe(true);
    expect(r.players[0].isOut).toBe(false);
  });
  it("eliminates the actor when lower", () => {
    const s = mkState([[3, 2], [6], [4], [5]], [1, 1]);
    const r = playCard(s, { card: 3, targetId: 1 });
    expect(r.players[0].isOut).toBe(true);
    expect(r.players[1].isOut).toBe(false);
  });
  it("does nothing on a tie", () => {
    const s = mkState([[3, 5], [5], [4], [2]], [1, 1]);
    const r = playCard(s, { card: 3, targetId: 1 });
    expect(r.players[0].isOut).toBe(false);
    expect(r.players[1].isOut).toBe(false);
  });
});

describe("Princess", () => {
  it("eliminates whoever discards her", () => {
    const s = mkState([[8, 4], [3], [2], [5]], [6, 6]);
    const r = playCard(s, { card: 8 });
    expect(r.players[0].isOut).toBe(true);
  });
  it("is eliminated when forced to discard by Prince", () => {
    const s = mkState([[5, 4], [8], [2], [3]], [6, 6]);
    const r = playCard(s, { card: 5, targetId: 1 });
    expect(r.players[1].isOut).toBe(true);
  });
});

describe("Prince", () => {
  it("makes target discard and redraw", () => {
    const s = mkState([[5, 4], [3], [2], [6]], [1, 7]);
    const r = playCard(s, { card: 5, targetId: 1 });
    expect(r.players[1].isOut).toBe(false);
    expect(r.players[1].discards).toContain(3);
    // player 1 redrew the top of the deck (1) as their new hand card
    expect(r.players[1].hand).toContain(1);
  });
  it("draws the set-aside card if the deck is empty", () => {
    const s = mkState([[5, 4], [3], [2], [6]], [], { setAsideCard: 2 });
    const r = playCard(s, { card: 5, targetId: 1 });
    // deck empty after resolve -> round ends; target should have redrawn set-aside
    expect(r.players[1].discards).toContain(3);
    expect(r.setAsideCard).toBeNull();
  });
});

describe("King", () => {
  it("swaps hands with the target", () => {
    const s = mkState([[6, 2], [8], [3], [4]], [1, 1]);
    const r = playCard(s, { card: 6, targetId: 1 });
    expect(r.players[0].hand[0]).toBe(8);
    expect(r.players[1].hand[0]).toBe(2);
  });
});

describe("Handmaid", () => {
  it("protects and cannot be targeted", () => {
    const s = mkState([[4, 2], [3], [1], [5]], [6, 6]);
    const r = playCard(s, { card: 4 });
    expect(r.players[0].isProtected).toBe(true);
    // next actor cannot target player 0
    const targets = legalTargets(r, r.currentPlayerIndex, 1);
    expect(targets).not.toContain(0);
  });
  it("guard fizzles when the only target is protected", () => {
    const s = mkState(
      [[1, 4], [3], [2], [5]],
      [6, 6],
      {
        players: [
          mkPlayer(0, [1, 4]),
          mkPlayer(1, [3], { isProtected: true }),
          mkPlayer(2, [2], { isOut: true }),
          mkPlayer(3, [5], { isOut: true }),
        ],
      },
    );
    const r = playCard(s, { card: 1, targetId: 1, guess: 3 });
    expect(r.players[1].isOut).toBe(false);
  });
});

describe("round end", () => {
  it("ends when only one player remains", () => {
    const s = mkState(
      [[1, 4], [3], [2], [5]],
      [6, 6],
      {
        players: [
          mkPlayer(0, [1, 4]),
          mkPlayer(1, [3]),
          mkPlayer(2, [2], { isOut: true }),
          mkPlayer(3, [5], { isOut: true }),
        ],
      },
    );
    const r = playCard(s, { card: 1, targetId: 1, guess: 3 });
    expect(r.phase).toBe("roundOver");
    expect(r.roundWinnerIds).toEqual([0]);
    expect(r.players[0].favor).toBe(1);
  });

  it("compares hands when the deck runs out (highest wins)", () => {
    const s = mkState(
      [[4, 2], [7], [1], [3]],
      [],
      {
        players: [
          mkPlayer(0, [4, 2]),
          mkPlayer(1, [7]),
          mkPlayer(2, [1], { isOut: true }),
          mkPlayer(3, [3], { isOut: true }),
        ],
      },
    );
    // player 0 plays Handmaid, keeps 2; deck empty -> compare: Bot1 has 7 > 2
    const r = playCard(s, { card: 4 });
    expect(r.phase).toBe("roundOver");
    expect(r.roundWinnerIds).toEqual([1]);
  });

  it("breaks a hand tie by discard sum", () => {
    const p0 = mkPlayer(0, [4, 5]);
    p0.discards = [6];
    const p1 = mkPlayer(1, [5]);
    p1.discards = [1];
    const s = mkState([[4, 5], [5], [1], [3]], [], {
      players: [
        p0,
        p1,
        mkPlayer(2, [1], { isOut: true }),
        mkPlayer(3, [3], { isOut: true }),
      ],
    });
    const r = playCard(s, { card: 4 });
    expect(r.roundWinnerIds).toEqual([0]);
  });
});

describe("match end", () => {
  it("declares a winner at the token threshold", () => {
    const p0 = mkPlayer(0, [1, 4]);
    p0.favor = 3;
    const s = mkState([[1, 4], [3], [2], [5]], [6, 6], {
      tokensToWin: 4,
      players: [
        p0,
        mkPlayer(1, [3]),
        mkPlayer(2, [2], { isOut: true }),
        mkPlayer(3, [5], { isOut: true }),
      ],
    });
    const r = playCard(s, { card: 1, targetId: 1, guess: 3 });
    expect(r.players[0].favor).toBe(4);
    expect(r.phase).toBe("matchOver");
    expect(r.matchWinnerId).toBe(0);
  });

  it("continues to a new round below the threshold", () => {
    const s = mkState(
      [[1, 4], [3], [2], [5]],
      [6, 6],
      {
        players: [
          mkPlayer(0, [1, 4]),
          mkPlayer(1, [3]),
          mkPlayer(2, [2], { isOut: true }),
          mkPlayer(3, [5], { isOut: true }),
        ],
      },
    );
    const over = playCard(s, { card: 1, targetId: 1, guess: 3 });
    expect(over.phase).toBe("roundOver");
    const next = beginNextRound(over);
    expect(next.round).toBe(2);
    expect(next.phase).toBe("awaitingPlay");
    expect(next.players.every((p) => !p.isOut)).toBe(true);
  });
});
