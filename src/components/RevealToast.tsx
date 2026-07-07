import type { GameState, PendingReveal } from "../game/types";
import { CARD_DEFS } from "../game/cards";
import { Card } from "./Card";

export function RevealToast({
  state,
  reveal,
  onDismiss,
}: {
  state: GameState;
  reveal: PendingReveal;
  onDismiss: () => void;
}) {
  const target = state.players[reveal.targetId];
  const def = CARD_DEFS[reveal.card];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 anim-fade">
      <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-surface p-6 text-center anim-rise">
        <p className="label text-accent">Dark Confidant reveals</p>
        <p className="mt-1 text-sm text-muted">
          {target.name} is holding
        </p>
        <div className="my-4 flex justify-center">
          <Card value={reveal.card} size="lg" />
        </div>
        <p className="text-base font-semibold tracking-tight">
          {def.mtgName} — the {def.role}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 rounded-md bg-accent px-5 py-2 font-medium text-black transition hover:opacity-90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
