import { useState } from "react";
import { Grimoire } from "./Grimoire";
import { Settings } from "./Settings";
import { playSound } from "../lib/sound";
import { tokensForPlayers } from "../game/engine";

const MODES: { count: number; rivals: number; note?: string }[] = [
  { count: 2, rivals: 1, note: "3 cards revealed each round" },
  { count: 3, rivals: 2 },
  { count: 4, rivals: 3 },
];

export function Menu({ onStart }: { onStart: (playerCount: number) => void }) {
  const [showGrimoire, setShowGrimoire] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSelect, setShowSelect] = useState(false);

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
          onClick={() => {
            playSound("ui_click");
            setShowSelect(true);
          }}
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

      {showSelect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 anim-fade"
          onClick={() => setShowSelect(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-surface anim-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="label text-accent">New match</p>
                <h2 className="text-lg font-semibold tracking-tight">
                  Choose your table
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSelect(false)}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="flex flex-col gap-2 p-5">
              {MODES.map((m) => (
                <button
                  key={m.count}
                  type="button"
                  onClick={() => onStart(m.count)}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-black/30 p-4 text-left transition hover:border-accent"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {m.count} players
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      You + {m.rivals} rival{m.rivals > 1 ? "s" : ""}
                      {m.note ? `, ${m.note}` : ""}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-accent">
                    first to {tokensForPlayers(m.count)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showGrimoire && <Grimoire onClose={() => setShowGrimoire(false)} />}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

