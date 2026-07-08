import { useEffect, useState } from "react";

export type SoundKey =
  | "card_play"
  | "guard_hit"
  | "favor"
  | "match_win"
  | "ui_click";

const SRC: Record<SoundKey, string> = {
  card_play: "/sfx/card_play.ogg",
  guard_hit: "/sfx/guard_hit.ogg",
  favor: "/sfx/favor.ogg",
  match_win: "/sfx/match_win.ogg",
  ui_click: "/sfx/ui_click.ogg",
};

const VOLUME: Record<SoundKey, number> = {
  card_play: 0.5,
  guard_hit: 0.6,
  favor: 0.55,
  match_win: 0.7,
  ui_click: 0.35,
};

const STORAGE_KEY = "ll_muted";

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let muted = readMuted();
const listeners = new Set<() => void>();

export function isMuted(): boolean {
  return muted;
}

export function toggleMuted(): void {
  muted = !muted;
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function playSound(key: SoundKey): void {
  if (muted) return;
  try {
    const audio = new Audio(SRC[key]);
    audio.volume = VOLUME[key];
    void audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

export function useMuted(): boolean {
  const [value, setValue] = useState(muted);
  useEffect(() => {
    const listener = () => setValue(muted);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return value;
}
