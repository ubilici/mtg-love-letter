import type { GameState } from "../game/types";
import { Card } from "./Card";

export function RoundBanner({
  state,
  onContinue,
}: {
  state: GameState;
  onContinue: () => void;
}) {
  const winners = state.roundWinnerIds.map((id) => state.players[id]);
  const title =
    winners.length === 1
      ? `${winners[0].name} ${winners[0].isBot ? "wins" : "win"} the round`
      : `${winners.map((w) => w.name).join(" & ")} share the round`;

  const survivors = state.players.filter((p) => !p.isOut);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 anim-fade">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-surface p-6 text-center anim-rise">
        <p className="label text-accent">Round {state.round}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-glow-soft">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">
          They earn a favor of Liliana.
        </p>

        <div className="mt-5 flex flex-wrap items-start justify-center gap-4">
          {survivors.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-1">
              {p.hand[0] !== undefined && <Card value={p.hand[0]} size="sm" />}
              <span className="text-xs text-foreground">{p.name}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-6 rounded-md bg-accent px-5 py-2 font-medium text-black transition hover:opacity-90"
        >
          Next round
        </button>
      </div>
    </div>
  );
}
