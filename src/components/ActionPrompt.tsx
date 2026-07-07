import { useEffect, useState } from "react";
import { ALL_VALUES, CARD_DEFS, cardName, type CardValue } from "../game/cards";
import type { GameState, PlayDecision, PlayerId } from "../game/types";
import { legalTargets } from "../game/engine";

interface ActionPromptProps {
  state: GameState;
  card: CardValue;
  onConfirm: (decision: PlayDecision) => void;
  onCancel: () => void;
}

export function ActionPrompt({
  state,
  card,
  onConfirm,
  onCancel,
}: ActionPromptProps) {
  const def = CARD_DEFS[card];
  const actorId = state.currentPlayerIndex;
  const targets = legalTargets(state, actorId, card);
  const [targetId, setTargetId] = useState<PlayerId | null>(
    targets.length === 1 ? targets[0] : null,
  );
  const [guess, setGuess] = useState<CardValue | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const needsTarget = def.needsTarget && targets.length > 0;
  const needsGuess = def.needsGuess;
  const ready =
    (!needsTarget || targetId !== null) && (!needsGuess || guess !== null);

  const confirm = () => {
    if (!ready) return;
    onConfirm({
      card,
      targetId: needsTarget ? (targetId ?? undefined) : undefined,
      guess: needsGuess ? (guess ?? undefined) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 anim-fade">
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg anim-rise">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent/70 bg-black/70 text-xs font-semibold text-accent">
            {card}
          </span>
          <h3 className="text-lg font-semibold tracking-tight">
            {def.mtgName}
          </h3>
        </div>
        <p className="mb-4 text-sm text-muted">{def.description}</p>

        {needsTarget && (
          <div className="mb-4">
            <p className="label mb-2 text-accent">Choose a rival</p>
            <div className="flex flex-wrap gap-2">
              {targets.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTargetId(id)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${
                    targetId === id
                      ? "border-accent bg-accent text-black"
                      : "border-border text-foreground hover:border-accent"
                  }`}
                >
                  {id === actorId ? "Yourself" : state.players[id].name}
                </button>
              ))}
            </div>
          </div>
        )}

        {needsGuess && (
          <div className="mb-4">
            <p className="label mb-2 text-accent">Name a card</p>
            <div className="flex flex-wrap gap-2">
              {ALL_VALUES.filter((v) => v !== 1).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setGuess(v)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs transition ${
                    guess === v
                      ? "border-accent bg-accent text-black"
                      : "border-border text-foreground hover:border-accent"
                  }`}
                  title={cardName(v)}
                >
                  {v} · {CARD_DEFS[v].mtgName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-2 text-sm text-muted transition hover:text-foreground"
          >
            Back
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!ready}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-40"
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
