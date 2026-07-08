import { useEffect, useState } from "react";

const INSIGHT_KEY = "ll_insight";
const STEP_KEY = "ll_step";

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
