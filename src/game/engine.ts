import {
  buildDeck,
  CARD_DEFS,
  cardName,
  type CardValue,
} from "./cards";
import {
  cloneKnowledge,
  createKnowledge,
  setKnown,
} from "./knowledge";
import { createRng, shuffle, type Rng } from "./rng";
import type {
  GameState,
  LogEntry,
  PlayDecision,
  Player,
  PlayerId,
} from "./types";

export function tokensForPlayers(count: number): number {
  if (count <= 2) return 7;
  if (count === 3) return 5;
  return 4;
}

export function createMatch(
  names: string[],
  seed: number,
  tokensToWin = 4,
): GameState {
  const players: Player[] = names.map((name, i) => ({
    id: i,
    name,
    isBot: i !== 0,
    hand: [],
    discards: [],
    favor: 0,
    isOut: false,
    isProtected: false,
    knowledge: createKnowledge(),
  }));

  const state: GameState = {
    players,
    deck: [],
    setAsideCard: null,
    faceUpCards: [],
    currentPlayerIndex: 0,
    phase: "roundStart",
    round: 0,
    log: [],
    logCounter: 0,
    tokensToWin,
    roundWinnerIds: [],
    matchWinnerId: null,
    lastReveal: null,
    seed,
  };

  return startRound(state, 0);
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      hand: [...p.hand],
      discards: [...p.discards],
      knowledge: cloneKnowledge(p.knowledge),
    })),
    deck: [...state.deck],
    faceUpCards: [...state.faceUpCards],
    log: [...state.log],
    roundWinnerIds: [...state.roundWinnerIds],
    lastReveal: state.lastReveal ? { ...state.lastReveal } : null,
  };
}

function addLog(
  state: GameState,
  entry: Omit<LogEntry, "id" | "round">,
): void {
  state.log.push({ ...entry, id: state.logCounter++, round: state.round });
}

function activePlayers(state: GameState): Player[] {
  return state.players.filter((p) => !p.isOut);
}

function vb(p: Player, third: string, second: string): string {
  return p.isBot ? third : second;
}

export function startRound(state: GameState, starterId: number): GameState {
  const next = cloneState(state);
  next.round += 1;
  next.roundWinnerIds = [];
  next.lastReveal = null;

  const rng: Rng = createRng((next.seed + next.round * 2654435761) >>> 0);
  const deck = shuffle(buildDeck(), rng);

  next.setAsideCard = deck.shift() ?? null;
  next.faceUpCards =
    next.players.length === 2 ? deck.splice(0, 3).filter((c) => c !== undefined) : [];

  for (const p of next.players) {
    p.hand = [];
    p.discards = [];
    p.isOut = false;
    p.isProtected = false;
    p.knowledge = createKnowledge();
  }

  for (const p of next.players) {
    const card = deck.shift();
    if (card !== undefined) p.hand.push(card);
  }

  next.deck = deck;
  next.currentPlayerIndex = starterId;
  next.phase = "roundStart";

  addLog(next, {
    actor: null,
    kind: "info",
    text:
      next.faceUpCards.length > 0
        ? `Round ${next.round} begins. One card is banished and three are revealed.`
        : `Round ${next.round} begins. A card is banished from the game.`,
  });

  return beginTurn(next);
}

function beginTurn(state: GameState): GameState {
  const next = state;
  let idx = next.currentPlayerIndex;

  const alive = activePlayers(next);
  if (alive.length <= 1) return endRound(next);
  if (next.deck.length === 0) return endRound(next);

  const count = next.players.length;
  let guard = 0;
  while (next.players[idx].isOut && guard < count * 2) {
    idx = (idx + 1) % count;
    guard++;
  }
  next.currentPlayerIndex = idx;

  const player = next.players[idx];
  player.isProtected = false;

  const drawn = next.deck.shift();
  if (drawn === undefined) return endRound(next);
  player.hand.push(drawn);

  next.phase = "awaitingPlay";
  return next;
}

export function forcedCountess(hand: CardValue[]): boolean {
  return hand.includes(7) && (hand.includes(6) || hand.includes(5));
}

export function playableCards(hand: CardValue[]): CardValue[] {
  if (forcedCountess(hand)) return [7];
  return [...hand];
}

export function legalTargets(
  state: GameState,
  actorId: PlayerId,
  card: CardValue,
): PlayerId[] {
  const def = CARD_DEFS[card];
  if (!def.needsTarget) return [];
  const targets: PlayerId[] = [];
  for (const p of state.players) {
    if (p.isOut) continue;
    if (p.id === actorId && !def.canTargetSelf) continue;
    if (p.id !== actorId && p.isProtected) continue;
    targets.push(p.id);
  }
  return targets;
}

function clearKnownEverywhere(state: GameState, about: PlayerId): void {
  for (const p of state.players) delete p.knowledge.known[about];
}

function onCardPlayedForget(
  state: GameState,
  player: PlayerId,
  playedCard: CardValue,
): void {
  for (const p of state.players) {
    if (p.knowledge.known[player] === playedCard) {
      delete p.knowledge.known[player];
    }
  }
}

function eliminate(state: GameState, targetId: PlayerId, reason: string): void {
  const target = state.players[targetId];
  if (target.isOut) return;
  for (const c of target.hand) target.discards.push(c);
  target.hand = [];
  target.isOut = true;
  clearKnownEverywhere(state, targetId);
  addLog(state, {
    actor: targetId,
    kind: "eliminate",
    text: `${target.name} ${vb(target, "is", "are")} cast out (${reason}).`,
  });
}

function drawReplacement(state: GameState): CardValue | undefined {
  const fromDeck = state.deck.shift();
  if (fromDeck !== undefined) return fromDeck;
  if (state.setAsideCard !== null) {
    const c = state.setAsideCard;
    state.setAsideCard = null;
    return c;
  }
  return undefined;
}

function princeDiscard(state: GameState, targetId: PlayerId): void {
  const target = state.players[targetId];
  const discarded = target.hand.shift();
  if (discarded === undefined) return;
  target.discards.push(discarded);
  onCardPlayedForget(state, targetId, discarded);
  addLog(state, {
    actor: targetId,
    value: discarded,
    kind: "discard",
    text: `${target.name} ${vb(target, "discards", "discard")} ${cardName(discarded)}.`,
  });

  if (discarded === 8) {
    eliminate(state, targetId, "discarded Liliana");
    return;
  }

  const replacement = drawReplacement(state);
  if (replacement !== undefined) {
    target.hand.push(replacement);
    clearKnownEverywhere(state, targetId);
  }
}

function resolveEffect(
  state: GameState,
  actorId: PlayerId,
  card: CardValue,
  decision: PlayDecision,
): void {
  const actor = state.players[actorId];
  const def = CARD_DEFS[card];

  if (card === 4) {
    actor.isProtected = true;
    addLog(state, {
      actor: actorId,
      value: card,
      kind: "protect",
      text: `${actor.name} ${vb(actor, "is", "are")} shielded until ${vb(actor, "their", "your")} next turn.`,
    });
    return;
  }

  if (card === 7) {
    addLog(state, {
      actor: actorId,
      value: card,
      kind: "play",
      text: `${actor.name} ${vb(actor, "plays", "play")} Griselbrand. No effect.`,
    });
    return;
  }

  if (def.needsTarget) {
    const targets = legalTargets(state, actorId, card);
    if (targets.length === 0) {
      addLog(state, {
        actor: actorId,
        value: card,
        kind: "play",
        text: `${actor.name} plays ${cardName(card)}, but there are no valid targets.`,
      });
      return;
    }
    const targetId =
      decision.targetId !== undefined && targets.includes(decision.targetId)
        ? decision.targetId
        : targets[0];
    const target = state.players[targetId];

    if (card === 1) {
      const guess = decision.guess ?? 2;
      addLog(state, {
        actor: actorId,
        value: card,
        kind: "play",
        text: `${actor.name} ${vb(actor, "sends", "send")} a Zombie at ${target.name}, naming ${cardName(guess)}.`,
      });
      if (target.hand[0] === guess) {
        eliminate(state, targetId, `held ${cardName(guess)}`);
      } else {
        addLog(state, {
          actor: actorId,
          kind: "info",
          text: `${target.name} ${vb(target, "does", "do")} not hold it.`,
        });
      }
      return;
    }

    if (card === 2) {
      const seen = target.hand[0];
      if (seen !== undefined && actor.isBot) {
        setKnown(actor.knowledge, targetId, seen);
      }
      if (seen !== undefined) {
        state.lastReveal = { viewerId: actorId, targetId, card: seen };
      }
      addLog(state, {
        actor: actorId,
        value: card,
        kind: "peek",
        text: actor.isBot
          ? `${actor.name} studies ${target.isBot ? `${target.name}'s` : "your"} hand.`
          : `You study ${target.name}'s hand.`,
      });
      return;
    }

    if (card === 3) {
      const mine = actor.hand[0];
      const theirs = target.hand[0];
      addLog(state, {
        actor: actorId,
        value: card,
        kind: "compare",
        text: `${actor.name} ${vb(actor, "duels", "duel")} ${target.name}.`,
      });
      if (mine === undefined || theirs === undefined) return;
      if (actor.isBot) setKnown(actor.knowledge, targetId, theirs);
      if (target.isBot) setKnown(target.knowledge, actorId, mine);
      if (mine > theirs) {
        eliminate(state, targetId, `lost the duel`);
      } else if (theirs > mine) {
        eliminate(state, actorId, `lost the duel`);
      } else {
        addLog(state, {
          actor: actorId,
          kind: "info",
          text: `The duel is a draw. Both stand.`,
        });
      }
      return;
    }

    if (card === 5) {
      addLog(state, {
        actor: actorId,
        value: card,
        kind: "play",
        text: `${actor.name} ${vb(actor, "commands", "command")} ${target.name} to discard.`,
      });
      princeDiscard(state, targetId);
      return;
    }

    if (card === 6) {
      const mine = actor.hand[0];
      const theirs = target.hand[0];
      if (mine === undefined || theirs === undefined) return;
      actor.hand[0] = theirs;
      target.hand[0] = mine;
      addLog(state, {
        actor: actorId,
        value: card,
        kind: "swap",
        text: `${actor.name} ${vb(actor, "trades", "trade")} hands with ${target.name}.`,
      });
      clearKnownEverywhere(state, actorId);
      clearKnownEverywhere(state, targetId);
      if (actor.isBot) setKnown(actor.knowledge, targetId, mine);
      if (target.isBot) setKnown(target.knowledge, actorId, theirs);
      return;
    }
  }
}

export function playCard(state: GameState, decision: PlayDecision): GameState {
  if (state.phase !== "awaitingPlay") return state;
  const next = cloneState(state);
  next.lastReveal = null;
  const actorId = next.currentPlayerIndex;
  const actor = next.players[actorId];

  const legal = playableCards(actor.hand);
  const card = legal.includes(decision.card) ? decision.card : legal[0];

  const idx = actor.hand.indexOf(card);
  if (idx >= 0) actor.hand.splice(idx, 1);
  actor.discards.push(card);
  onCardPlayedForget(next, actorId, card);

  if (card === 8) {
    eliminate(next, actorId, "discarded Liliana");
    return advanceTurn(next);
  }

  next.phase = "resolving";
  resolveEffect(next, actorId, card, decision);

  return advanceTurn(next);
}

function advanceTurn(state: GameState): GameState {
  const alive = activePlayers(state);
  if (alive.length <= 1 || state.deck.length === 0) {
    return endRound(state);
  }
  state.currentPlayerIndex =
    (state.currentPlayerIndex + 1) % state.players.length;
  return beginTurn(state);
}

function endRound(state: GameState): GameState {
  const alive = activePlayers(state);
  let winners: Player[];

  if (alive.length <= 1) {
    winners = alive;
  } else {
    const maxVal = Math.max(...alive.map((p) => p.hand[0] ?? 0));
    let contenders = alive.filter((p) => (p.hand[0] ?? 0) === maxVal);
    if (contenders.length > 1) {
      const discSum = (p: Player) =>
        p.discards.reduce((s, c) => s + c, 0);
      const maxSum = Math.max(...contenders.map(discSum));
      contenders = contenders.filter((p) => discSum(p) === maxSum);
    }
    winners = contenders;
    for (const p of alive) {
      if (p.hand[0] !== undefined) {
        addLog(state, {
          actor: p.id,
          value: p.hand[0],
          kind: "info",
          text: `${p.name} ${vb(p, "reveals", "reveal")} ${cardName(p.hand[0])}.`,
        });
      }
    }
  }

  for (const w of winners) w.favor += 1;
  state.roundWinnerIds = winners.map((w) => w.id);

  if (winners.length === 1) {
    addLog(state, {
      actor: winners[0].id,
      kind: "roundWin",
      text: `${winners[0].name} ${vb(winners[0], "wins", "win")} Liliana's favor this round.`,
    });
  } else {
    addLog(state, {
      actor: null,
      kind: "roundWin",
      text: `${winners.map((w) => w.name).join(" & ")} share the round.`,
    });
  }

  const topFavor = Math.max(...state.players.map((p) => p.favor));
  const champs = state.players.filter((p) => p.favor === topFavor);
  if (topFavor >= state.tokensToWin && champs.length === 1) {
    state.matchWinnerId = champs[0].id;
    state.phase = "matchOver";
    addLog(state, {
      actor: champs[0].id,
      kind: "matchWin",
      text: `${champs[0].name} ${vb(champs[0], "has", "have")} won Liliana's heart!`,
    });
  } else {
    state.phase = "roundOver";
  }

  return state;
}

export function nextRoundStarter(state: GameState): number {
  if (state.roundWinnerIds.length > 0) return state.roundWinnerIds[0];
  return 0;
}

export function beginNextRound(state: GameState): GameState {
  if (state.phase !== "roundOver") return state;
  return startRound(state, nextRoundStarter(state));
}

export function isHumanTurn(state: GameState): boolean {
  return (
    state.phase === "awaitingPlay" &&
    !state.players[state.currentPlayerIndex].isBot
  );
}
