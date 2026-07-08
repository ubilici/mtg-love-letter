import { useEffect, useState } from "react";

const STORAGE_KEY = "ll_insight";

function readInsight(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let insight = readInsight();
const listeners = new Set<() => void>();

export function isInsight(): boolean {
  return insight;
}

export function toggleInsight(): void {
  insight = !insight;
  try {
    localStorage.setItem(STORAGE_KEY, insight ? "1" : "0");
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function useInsight(): boolean {
  const [value, setValue] = useState(insight);
  useEffect(() => {
    const listener = () => setValue(insight);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return value;
}
