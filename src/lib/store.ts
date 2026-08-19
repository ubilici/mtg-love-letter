import { useSyncExternalStore } from "react";

export interface Store<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
}

export interface Persist<T> {
  key: string;
  serialize: (value: T) => string;
  deserialize: (raw: string | null) => T;
}

export function createStore<T>(initial: T, persist?: Persist<T>): Store<T> {
  let value = initial;
  if (persist) {
    try {
      value = persist.deserialize(localStorage.getItem(persist.key));
    } catch {
      value = initial;
    }
  }

  const listeners = new Set<() => void>();

  return {
    get: () => value,
    set: (next: T) => {
      if (next === value) return;
      value = next;
      if (persist) {
        try {
          localStorage.setItem(persist.key, persist.serialize(next));
        } catch {
          void 0;
        }
      }
      listeners.forEach((l) => l());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function boolPersist(key: string): Persist<boolean> {
  return {
    key,
    serialize: (v) => (v ? "1" : "0"),
    deserialize: (raw) => raw === "1",
  };
}
