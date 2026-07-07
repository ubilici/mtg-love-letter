import { ALL_VALUES, CARD_DEFS } from "../game/cards";

export function Menu({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-center anim-rise">
        <div className="h-px w-16 bg-accent/60" />
        <p className="label text-accent">A Love Letter · Vess Archive</p>
        <h1 className="text-5xl font-semibold tracking-tight text-glow">
          Liliana's Favor
        </h1>
        <p className="max-w-lg text-sm text-muted">
          Three rivals. One necromancer's favor. Read your foes, play your
          card, and outlast the graveyard. The first to four favors wins
          Liliana's heart.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 anim-fade">
        {ALL_VALUES.map((v) => (
          <div
            key={v}
            className="relative aspect-[63/88] w-20 overflow-hidden rounded-lg border border-border sm:w-24"
            title={CARD_DEFS[v].description}
          >
            <img
              src={CARD_DEFS[v].art}
              alt={CARD_DEFS[v].mtgName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-accent/70 bg-black/70 text-[0.65rem] font-semibold text-accent">
              {v}
            </span>
            <span className="absolute inset-x-0 bottom-0 truncate px-1 pb-1 text-[0.55rem] text-foreground">
              {CARD_DEFS[v].mtgName}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="rounded-md bg-accent px-7 py-3 font-medium text-black transition hover:opacity-90 anim-pop"
      >
        Enter the Archive
      </button>
    </div>
  );
}
