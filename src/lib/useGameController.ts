import { useCallback, useEffect, useRef, useState } from "react";
import { decideBotMove } from "../game/ai";
import {
  beginNextRound,
  createMatch,
  playCard,
} from "../game/engine";
import type { GameState, PendingReveal, PlayDecision } from "../game/types";
import { randomSeed } from "../game/rng";

const BOT_NAMES = ["You", "Sorin", "Chandra", "Jace"];
const BOT_DELAY_MS = 950;

export function useGameController() {
  const [state, setState] = useState<GameState>(() =>
    createMatch(BOT_NAMES, randomSeed()),
  );
  const [reveal, setReveal] = useState<PendingReveal | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const play = useCallback((decision: PlayDecision) => {
    setState((s) => {
      const next = playCard(s, decision);
      if (next.lastReveal && next.lastReveal.viewerId === 0) {
        setReveal(next.lastReveal);
      }
      return next;
    });
  }, []);

  const nextRound = useCallback(() => {
    setState((s) => beginNextRound(s));
  }, []);

  const newMatch = useCallback(() => {
    setReveal(null);
    setState(createMatch(BOT_NAMES, randomSeed()));
  }, []);

  const dismissReveal = useCallback(() => setReveal(null), []);

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (reveal) return;
    if (
      state.phase === "awaitingPlay" &&
      state.players[state.currentPlayerIndex].isBot
    ) {
      timer.current = setTimeout(() => {
        setState((s) => {
          if (
            s.phase !== "awaitingPlay" ||
            !s.players[s.currentPlayerIndex].isBot
          ) {
            return s;
          }
          const decision = decideBotMove(s, s.currentPlayerIndex);
          const next = playCard(s, decision);
          return next;
        });
      }, BOT_DELAY_MS);
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [state, reveal]);

  const isHumanActable =
    state.phase === "awaitingPlay" &&
    !state.players[state.currentPlayerIndex].isBot &&
    !reveal;

  return {
    state,
    reveal,
    dismissReveal,
    play,
    nextRound,
    newMatch,
    isHumanActable,
  };
}
