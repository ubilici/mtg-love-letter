import type { CardValue } from "./cards";
import type { PlayerId } from "./types";

export interface BotKnowledge {
  known: Record<PlayerId, CardValue | undefined>;
}

export function createKnowledge(): BotKnowledge {
  return { known: {} };
}

export function cloneKnowledge(k: BotKnowledge): BotKnowledge {
  return { known: { ...k.known } };
}

export function setKnown(
  k: BotKnowledge,
  target: PlayerId,
  card: CardValue,
): void {
  k.known[target] = card;
}

export function clearKnown(k: BotKnowledge, target: PlayerId): void {
  delete k.known[target];
}

export function getKnown(
  k: BotKnowledge,
  target: PlayerId,
): CardValue | undefined {
  return k.known[target];
}
