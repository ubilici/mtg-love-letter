import type { Difficulty } from "../game/ai";
import { boolPersist, createStore, useStore, type Persist } from "./store";

const INSIGHT_KEY = "ll_insight";
const STEP_KEY = "ll_step";
const DIFFICULTY_KEY = "ll_difficulty";

const insightStore = createStore(false, boolPersist(INSIGHT_KEY));
const stepStore = createStore(false, boolPersist(STEP_KEY));

const difficultyPersist: Persist<Difficulty> = {
  key: DIFFICULTY_KEY,
  serialize: (v) => v,
  deserialize: (raw) =>
    raw === "easy" || raw === "medium" || raw === "hard" ? raw : "medium",
};
const difficultyStore = createStore<Difficulty>("medium", difficultyPersist);

export function isInsight(): boolean {
  return insightStore.get();
}

export function toggleInsight(): void {
  insightStore.set(!insightStore.get());
}

export function useInsight(): boolean {
  return useStore(insightStore);
}

export function isStepMode(): boolean {
  return stepStore.get();
}

export function toggleStepMode(): void {
  stepStore.set(!stepStore.get());
}

export function useStepMode(): boolean {
  return useStore(stepStore);
}

export function getDifficulty(): Difficulty {
  return difficultyStore.get();
}

export function setDifficulty(value: Difficulty): void {
  difficultyStore.set(value);
}

export function useDifficulty(): Difficulty {
  return useStore(difficultyStore);
}
