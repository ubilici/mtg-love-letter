import { useEffect, useState } from "react";
import type { Difficulty } from "../game/ai";

const INSIGHT_KEY = "ll_insight";
const STEP_KEY = "ll_step";
const DIFFICULTY_KEY = "ll_difficulty";

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function write(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // ignore
  }
}

let insight = read(INSIGHT_KEY);
let stepMode = read(STEP_KEY);
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => l());
}

function useSetting(get: () => boolean): boolean {
  const [value, setValue] = useState(get);
  useEffect(() => {
    const listener = () => setValue(get());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [get]);
  return value;
}

export function isInsight(): boolean {
  return insight;
}

export function toggleInsight(): void {
  insight = !insight;
  write(INSIGHT_KEY, insight);
  notify();
}

export function useInsight(): boolean {
  return useSetting(isInsight);
}

export function isStepMode(): boolean {
  return stepMode;
}

export function toggleStepMode(): void {
  stepMode = !stepMode;
  write(STEP_KEY, stepMode);
  notify();
}

export function useStepMode(): boolean {
  return useSetting(isStepMode);
}

function readDifficulty(): Difficulty {
  try {
    const v = localStorage.getItem(DIFFICULTY_KEY);
    if (v === "easy" || v === "medium" || v === "hard") return v;
  } catch {
    // ignore
  }
  return "medium";
}

let difficulty: Difficulty = readDifficulty();

export function getDifficulty(): Difficulty {
  return difficulty;
}

export function setDifficulty(value: Difficulty): void {
  difficulty = value;
  try {
    localStorage.setItem(DIFFICULTY_KEY, value);
  } catch {
    // ignore
  }
  notify();
}

export function useDifficulty(): Difficulty {
  const [value, setValue] = useState(difficulty);
  useEffect(() => {
    const listener = () => setValue(difficulty);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return value;
}
