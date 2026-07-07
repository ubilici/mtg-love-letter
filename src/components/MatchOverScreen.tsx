import type { GameState } from "../game/types";
import { CARD_DEFS } from "../game/cards";

export function MatchOverScreen({
  state,
  onNewMatch,
}: {
  state: GameState;
  onNewMatch: () => void;
}) {
  const winner =
    state.matchWinnerId !== null ? state.players[state.matchWinnerId] : null;
  const humanWon = state.matchWinnerId === 0;
  const standings = [...state.players].sort((a, b) => b.favor - a.favor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 anim-fade">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-surface p-8 text-center anim-rise">
        <img
          src={CARD_DEFS[8].art}
          alt="Liliana Vess"
          className="mx-auto mb-4 h-40 w-auto rounded-lg border border-accent/40 object-cover card-glow"
        />
        <p className="label text-accent">The letter is delivered</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-glow">
          {winner ? `${winner.name} ${winner.isBot ? "wins" : "win"}` : "Match over"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {humanWon
            ? "Liliana grants you her favor. The Archive is yours."
            : `${winner?.name} claims Liliana's favor this time.`}
        </p>

        <div className="mx-auto mt-6 max-w-xs space-y-2">
          {standings.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
            >
              <span
                className={p.id === state.matchWinnerId ? "text-accent" : ""}
              >
                {p.name}
              </span>
              <span className="text-muted">
                {p.favor} favor{p.favor === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onNewMatch}
          className="mt-7 rounded-md bg-accent px-6 py-2.5 font-medium text-black transition hover:opacity-90"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
