import { ALL_VALUES, CARD_DEFS, type CardValue } from "./cards";
import { forcedCountess, legalTargets, playableCards } from "./engine";
import { getKnown } from "./knowledge";
import type { GameState, PlayDecision, PlayerId } from "./types";

interface Distribution {
  counts: Record<number, number>;
  total: number;
}

function unseenDistribution(state: GameState, botId: PlayerId): Distribution {
  const counts: Record<number, number> = {};
  for (const v of ALL_VALUES) counts[v] = CARD_DEFS[v].count;

  const remove = (c: CardValue) => {
    if (counts[c] > 0) counts[c] -= 1;
  };

  for (const p of state.players) {
    for (const c of p.discards) remove(c);
  }
  for (const c of state.faceUpCards) remove(c);
  for (const c of state.players[botId].hand) remove(c);

  const bot = state.players[botId];
  for (const p of state.players) {
    if (p.id === botId || p.isOut) continue;
    const known = getKnown(bot.knowledge, p.id);
    if (known !== undefined) remove(known);
  }

  let total = 0;
  for (const v of ALL_VALUES) total += counts[v];
  return { counts, total };
}

function probHolds(
  state: GameState,
  botId: PlayerId,
  targetId: PlayerId,
  value: CardValue,
  dist: Distribution,
): number {
  const known = getKnown(state.players[botId].knowledge, targetId);
  if (known !== undefined) return known === value ? 1 : 0;
  if (dist.total === 0) return 0;
  return dist.counts[value] / dist.total;
}

function expectedValue(
  state: GameState,
  botId: PlayerId,
  targetId: PlayerId,
  dist: Distribution,
): number {
  const known = getKnown(state.players[botId].knowledge, targetId);
  if (known !== undefined) return known;
  if (dist.total === 0) return 3;
  let ev = 0;
  for (const v of ALL_VALUES) ev += v * (dist.counts[v] / dist.total);
  return ev;
}

function probLower(
  state: GameState,
  botId: PlayerId,
  targetId: PlayerId,
  myValue: number,
  dist: Distribution,
): number {
  const known = getKnown(state.players[botId].knowledge, targetId);
  if (known !== undefined) return known < myValue ? 1 : 0;
  if (dist.total === 0) return 0;
  let p = 0;
  for (const v of ALL_VALUES) if (v < myValue) p += dist.counts[v];
  return p / dist.total;
}

function probHigher(
  state: GameState,
  botId: PlayerId,
  targetId: PlayerId,
  myValue: number,
  dist: Distribution,
): number {
  const known = getKnown(state.players[botId].knowledge, targetId);
  if (known !== undefined) return known > myValue ? 1 : 0;
  if (dist.total === 0) return 0;
  let p = 0;
  for (const v of ALL_VALUES) if (v > myValue) p += dist.counts[v];
  return p / dist.total;
}

interface Candidate {
  decision: PlayDecision;
  score: number;
}

export function decideBotMove(
  state: GameState,
  botId: PlayerId,
): PlayDecision {
  const bot = state.players[botId];
  const hand = bot.hand;

  if (forcedCountess(hand)) return { card: 7 };

  const legal = playableCards(hand).filter((c) => c !== 8);
  const playable = legal.length > 0 ? legal : playableCards(hand);
  const dist = unseenDistribution(state, botId);

  const candidates: Candidate[] = [];

  for (const card of playable) {
    const keptCard = otherCard(hand, card);
    const targets = legalTargets(state, botId, card);

    if (card === 4) {
      const threat = threatLevel(state, botId, dist);
      const vuln = keptCard ? keptCard / 8 : 0.3;
      candidates.push({
        decision: { card },
        score: 1.2 + threat * 3 + vuln * 1.5,
      });
      continue;
    }

    if (card === 7) {
      const keepValue = keptCard ?? 0;
      candidates.push({
        decision: { card },
        score: 1.5 + (keepValue >= 6 ? keepValue * 0.4 : 0),
      });
      continue;
    }

    if (card === 1) {
      let best: { targetId: PlayerId; guess: CardValue; p: number } | null =
        null;
      for (const t of targets) {
        for (const v of ALL_VALUES) {
          if (v === 1) continue;
          const p = probHolds(state, botId, t, v as CardValue, dist);
          if (!best || p > best.p) {
            best = { targetId: t, guess: v as CardValue, p };
          }
        }
      }
      if (best) {
        candidates.push({
          decision: { card, targetId: best.targetId, guess: best.guess },
          score: 0.4 + best.p * 7,
        });
      } else {
        candidates.push({ decision: { card }, score: 0.2 });
      }
      continue;
    }

    if (card === 2) {
      const t = pickBy(targets, (p) =>
        getKnown(bot.knowledge, p) === undefined ? 1 : 0,
      );
      const infoBonus = state.deck.length > 4 ? 1.2 : 0.4;
      candidates.push({
        decision: { card, targetId: t ?? undefined },
        score: t !== null ? 1.0 + infoBonus : 0.1,
      });
      continue;
    }

    if (card === 3) {
      const myVal = keptCard ?? 0;
      let best: { targetId: PlayerId; win: number; lose: number } | null =
        null;
      for (const t of targets) {
        const win = probLower(state, botId, t, myVal, dist);
        const lose = probHigher(state, botId, t, myVal, dist);
        if (!best || win - lose > best.win - best.lose) {
          best = { targetId: t, win, lose };
        }
      }
      if (best) {
        candidates.push({
          decision: { card, targetId: best.targetId },
          score: 0.3 + best.win * 5 - best.lose * 8,
        });
      } else {
        candidates.push({ decision: { card }, score: 0.5 });
      }
      continue;
    }

    if (card === 5) {
      let best: { targetId: PlayerId; score: number } | null = null;
      for (const t of targets) {
        if (t === botId) continue;
        const known = getKnown(bot.knowledge, t);
        let s: number;
        if (known === 8) s = 8;
        else s = 0.5 + expectedValue(state, botId, t, dist) * 0.5;
        if (!best || s > best.score) best = { targetId: t, score: s };
      }
      if (best) {
        candidates.push({
          decision: { card, targetId: best.targetId },
          score: best.score,
        });
      } else if (targets.some((t) => t === botId)) {
        candidates.push({ decision: { card, targetId: botId }, score: 0.2 });
      } else {
        candidates.push({ decision: { card }, score: 0.2 });
      }
      continue;
    }

    if (card === 6) {
      const myVal = keptCard ?? 0;
      let best: { targetId: PlayerId; gain: number } | null = null;
      for (const t of targets) {
        const gain = expectedValue(state, botId, t, dist) - myVal;
        if (!best || gain > best.gain) best = { targetId: t, gain };
      }
      if (best) {
        candidates.push({
          decision: { card, targetId: best.targetId },
          score: 0.5 + Math.max(0, best.gain) * 1.2,
        });
      } else {
        candidates.push({ decision: { card }, score: 0.3 });
      }
      continue;
    }

    candidates.push({ decision: { card }, score: 0.5 });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.decision ?? { card: playable[0] };
}

function otherCard(hand: CardValue[], played: CardValue): CardValue | null {
  const idx = hand.indexOf(played);
  const rest = hand.filter((_, i) => i !== idx);
  return rest[0] ?? null;
}

function pickBy<T>(items: T[], score: (item: T) => number): T | null {
  let best: T | null = null;
  let bestScore = -Infinity;
  for (const it of items) {
    const s = score(it);
    if (s > bestScore) {
      bestScore = s;
      best = it;
    }
  }
  return best;
}

function threatLevel(
  state: GameState,
  botId: PlayerId,
  dist: Distribution,
): number {
  const opponents = state.players.filter((p) => !p.isOut && p.id !== botId);
  if (opponents.length === 0) return 0;
  let attackerProb = 0;
  for (const v of [1, 3, 5] as CardValue[]) {
    attackerProb += dist.total > 0 ? dist.counts[v] / dist.total : 0;
  }
  return Math.min(1, attackerProb * opponents.length * 0.5);
}
