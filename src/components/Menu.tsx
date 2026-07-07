export function Menu({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-center anim-rise">
        <div className="h-px w-16 bg-accent/60" />
        <p className="label text-accent">Love Letter, Reanimated</p>
        <h1 className="text-5xl font-semibold tracking-tight text-glow">
          Liliana's Favor
        </h1>
        <p className="max-w-lg text-sm text-muted">
          Three rivals. One necromancer's favor. Read your foes, play your
          card, and outlast the graveyard. The first to four favors wins
          Liliana's heart.
        </p>
      </div>

      <div className="flex w-full max-w-lg flex-col items-center anim-fade">
        <div className="relative w-full">
          <img
            src="/splash.png"
            alt="Liliana Vess enthroned among her rivals"
            className="block w-full select-none"
            draggable={false}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--background) 1%, transparent 28%), linear-gradient(to right, var(--background) 1%, transparent 24%), linear-gradient(to left, var(--background) 1%, transparent 24%), radial-gradient(ellipse at 50% 46%, transparent 42%, var(--background) 82%)",
            }}
          />
        </div>
        <button
          type="button"
          onClick={onStart}
          className="relative z-10 -mt-10 rounded-md bg-accent px-7 py-3 font-medium text-black shadow-lg transition hover:opacity-90 anim-pop"
        >
          Enter the Archive
        </button>
      </div>
    </div>
  );
}
