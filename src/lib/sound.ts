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

const KEYS = Object.keys(SRC) as SoundKey[];

let ctx: AudioContext | null = null;
const rawPromises: Partial<Record<SoundKey, Promise<ArrayBuffer>>> = {};
const decoded: Partial<Record<SoundKey, Promise<AudioBuffer>>> = {};

function fetchRaw(key: SoundKey): Promise<ArrayBuffer> {
  if (!rawPromises[key]) {
    rawPromises[key] = fetch(SRC[key]).then((r) => r.arrayBuffer());
  }
  return rawPromises[key]!;
}

// Warm the HTTP cache as soon as this module loads (no AudioContext needed).
if (typeof window !== "undefined") {
  for (const key of KEYS) void fetchRaw(key).catch(() => {});
}

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    // Decode everything up front so later plays fire with zero latency.
    for (const key of KEYS) void getBuffer(ctx, key).catch(() => {});
  } catch {
    ctx = null;
  }
  return ctx;
}

function getBuffer(context: AudioContext, key: SoundKey): Promise<AudioBuffer> {
  if (!decoded[key]) {
    decoded[key] = fetchRaw(key).then((arr) =>
      context.decodeAudioData(arr.slice(0)),
    );
  }
  return decoded[key]!;
}

export function playSound(key: SoundKey): void {
  if (muted) return;
  const context = getContext();
  if (!context) return;
  if (context.state === "suspended") void context.resume();
  getBuffer(context, key)
    .then((buffer) => {
      if (muted) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      const gain = context.createGain();
      gain.gain.value = VOLUME[key];
      source.connect(gain).connect(context.destination);
      source.start();
    })
    .catch(() => {});
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
