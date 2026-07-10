import { useState } from "react";
import { Grimoire } from "./Grimoire";
import { Settings } from "./Settings";
import { playSound } from "../lib/sound";

export function Menu({ onStart }: { onStart: () => void }) {
  const [showGrimoire, setShowGrimoire] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-3xl flex-col items-center justify-center overflow-hidden px-4">
      <div className="relative z-10 flex flex-col items-center gap-2 text-center anim-rise">
        <div className="h-px w-16 bg-accent/60" />
        <p className="label text-accent">Love Letter, Reanimated</p>
        <h1 className="text-4xl font-semibold tracking-tight text-glow sm:text-5xl">
          Liliana's Favor
        </h1>
        <p className="max-w-lg text-sm text-muted">
          Three rivals. One necromancer's favor. Read your foes, play your
          card, and outlast the graveyard. The first to four favors wins
          Liliana's heart.
        </p>
      </div>

      <div className="relative -mt-2 w-full max-w-lg anim-fade">
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

      <div className="relative z-10 -mt-12 flex flex-col items-center gap-3 anim-fade">
        <button
          type="button"
          onClick={onStart}
          className="rounded-md bg-accent px-7 py-3 font-medium text-black shadow-lg transition hover:opacity-90"
        >
          Enter the Archive
        </button>
        <button
          type="button"
          onClick={() => {
            playSound("ui_click");
            setShowGrimoire(true);
          }}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-foreground"
        >
          Open the Grimoire
        </button>
        <button
          type="button"
          onClick={() => {
            playSound("ui_click");
            setShowSettings(true);
          }}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-foreground"
        >
          Settings
        </button>
      </div>

      <p className="absolute inset-x-0 bottom-3 px-6 text-center text-[0.7rem] leading-relaxed text-muted/60">
        All artwork is AI-generated placeholder. I hope to commission original
        art from a real artist.
      </p>

      {showGrimoire && <Grimoire onClose={() => setShowGrimoire(false)} />}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

