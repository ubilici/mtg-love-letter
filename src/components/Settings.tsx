import { useEffect } from "react";
import type { Difficulty } from "../game/ai";
import { toggleMuted, useMuted } from "../lib/sound";
import {
  setDifficulty,
  toggleInsight,
  toggleStepMode,
  useDifficulty,
  useInsight,
  useStepMode,
} from "../lib/settings";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

function DifficultyRow() {
  const current = useDifficulty();
  return (
    <div className="rounded-lg border border-border bg-black/30 p-4">
      <div className="text-sm font-semibold">Bot difficulty</div>
      <div className="mt-0.5 text-xs text-muted">
        How sharply your rivals play.
      </div>
      <div className="mt-3 flex gap-1 rounded-md border border-border p-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setDifficulty(d.value)}
            className={`flex-1 rounded px-3 py-1.5 text-sm transition ${
              current === d.value
                ? "bg-accent font-medium text-black"
                : "text-muted hover:text-foreground"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
        on ? "border-accent bg-accent" : "border-border bg-surface"
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${
          on ? "left-[1.5rem] bg-black" : "left-1 bg-muted"
        }`}
      />
    </button>
  );
}

function Row({
  title,
  desc,
  on,
  onToggle,
}: {
  title: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-black/30 p-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-muted">{desc}</div>
      </div>
      <Switch on={on} onToggle={onToggle} />
    </div>
  );
}

export function Settings({
  onClose,
  onNewMatch,
  onExitToMenu,
}: {
  onClose: () => void;
  onNewMatch?: () => void;
  onExitToMenu?: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sfxOn = !useMuted();
  const insight = useInsight();
  const stepMode = useStepMode();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 anim-fade"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface anim-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="label text-accent">Settings</p>
            <h2 className="text-lg font-semibold tracking-tight">Preferences</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <DifficultyRow />
          <Row
            title="Sound effects"
            desc="Card plays, guesses, favors, and victory."
            on={sfxOn}
            onToggle={toggleMuted}
          />
          <Row
            title="Insight mode"
            desc="Log each bot's reasoning and probabilities in the Chronicle."
            on={insight}
            onToggle={toggleInsight}
          />
          <Row
            title="Step through bot turns"
            desc="Pause on each bot's move and press Continue to advance."
            on={stepMode}
            onToggle={toggleStepMode}
          />
        </div>

        {(onNewMatch || onExitToMenu) && (
          <div className="flex flex-col gap-2 border-t border-border p-5">
            {onNewMatch && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewMatch();
                }}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
              >
                New match
              </button>
            )}
            {onExitToMenu && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExitToMenu();
                }}
                className="rounded-md border border-border px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-foreground"
              >
                Back to Main Menu
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
