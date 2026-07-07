import { useEffect } from "react";
import { ALL_VALUES, CARD_DEFS, TOTAL_CARDS } from "../game/cards";

export function Grimoire({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 anim-fade"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-surface anim-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="label text-accent">The Grimoire</p>
            <h2 className="text-lg font-semibold tracking-tight">
              {TOTAL_CARDS} cards in the deck
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {ALL_VALUES.map((v) => {
            const def = CARD_DEFS[v];
            return (
              <div
                key={v}
                className="flex gap-3 rounded-lg border border-border bg-black/30 p-3"
              >
                <div className="relative aspect-[63/88] w-16 shrink-0 overflow-hidden rounded-md border border-border">
                  <img
                    src={def.art}
                    alt={def.mtgName}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-accent/70 bg-black/70 text-[0.65rem] font-semibold text-accent">
                    {v}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold text-accent">
                      {def.mtgName}
                    </span>
                    <span className="shrink-0 text-sm text-muted">
                      ×{def.count}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-snug text-muted">
                    {def.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
