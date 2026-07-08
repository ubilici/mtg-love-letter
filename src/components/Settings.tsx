import { useEffect } from "react";
import { toggleMuted, useMuted } from "../lib/sound";
import { toggleInsight, useInsight } from "../lib/settings";

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

export function Settings({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sfxOn = !useMuted();
  const insight = useInsight();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 anim-fade"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-surface anim-rise"
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
        </div>
      </div>
    </div>
  );
}
