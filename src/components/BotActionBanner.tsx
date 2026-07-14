import { CARD_DEFS } from "../game/cards";
import type { GameState } from "../game/types";
import type { BotAction } from "../lib/useGameController";
import { Card } from "./Card";

function targetName(state: GameState, botId: number, targetId?: number): string {
  if (targetId === undefined) return "";
  if (targetId === botId) return "themselves";
  if (targetId === 0) return "you";
  return state.players[targetId].name;
}

function describe(state: GameState, action: BotAction): string {
  const { botId, decision } = action;
  const bot = state.players[botId].name;
  const who = targetName(state, botId, decision.targetId);

  switch (decision.card) {
    case 1:
      return decision.guess !== undefined && who
        ? `${bot} names ${CARD_DEFS[decision.guess].mtgName} against ${who}.`
        : `${bot} plays Zombie.`;
    case 2: {
      const poss =
        decision.targetId === 0 ? "your" : who ? `${who}'s` : "";
      return poss
        ? `${bot} peeks at ${poss} hand.`
        : `${bot} plays Dark Confidant.`;
    }
    case 3:
      return who ? `${bot} duels ${who}.` : `${bot} plays Deadly Assassin.`;
    case 4:
      return `${bot} takes cover behind the Grave Titan.`;
    case 5:
      return who
        ? `${bot} forces ${who} to discard.`
        : `${bot} plays The Raven Man.`;
    case 6:
      return who
        ? `${bot} trades hands with ${who}.`
        : `${bot} plays Nicol Bolas.`;
    case 7:
      return `${bot} discards Griselbrand.`;
    default:
      return `${bot} makes a move.`;
  }
}

export function BotActionBanner({
  state,
  action,
}: {
  state: GameState;
  action: BotAction;
}) {
  const bot = state.players[action.botId];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/2 z-40 flex -translate-y-1/2 justify-center px-4 lg:pl-0 lg:pr-[312px]">
      <div className="flex items-center gap-3 rounded-xl border border-accent/50 bg-surface/95 px-4 py-3 card-glow anim-pop">
        <Card value={action.decision.card} size="sm" />
        <div className="flex flex-col">
          <span className="label text-accent">{bot.name} plays</span>
          <span className="text-sm font-semibold tracking-tight">
            {CARD_DEFS[action.decision.card].mtgName}
          </span>
          <span className="mt-0.5 max-w-56 text-xs text-muted">
            {describe(state, action)}
          </span>
        </div>
      </div>
    </div>
  );
}
