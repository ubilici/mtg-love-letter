import { useCallback, useEffect, useRef, useState } from "react";
import { decideBotMove } from "../game/ai";
import {
  beginNextRound,
  createMatch,
  playCard,
} from "../game/engine";
import type {
  GameState,
  PendingReveal,
  PlayDecision,
  PlayerId,
} from "../game/types";
import { randomSeed } from "../game/rng";

const BOT_NAMES = ["You", "Sorin", "Chandra", "Jace"];

const THINK_MS = 800;
const ANNOUNCE_MS = 1700;

export interface BotAction {
  botId: PlayerId;
  decision: PlayDecision;
}

export function useGameController() {
  const [state, setState] = useState<GameState>(() =>
    createMatch(BOT_NAMES, randomSeed()),
  );
  const [reveal, setReveal] = useState<PendingReveal | null>(null);
  const [announce, setAnnounce] = useState<BotAction | null>(null);
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
    setAnnounce(null);
    setState((s) => beginNextRound(s));
  }, []);

  const newMatch = useCallback(() => {
    setReveal(null);
    setAnnounce(null);
    setState(createMatch(BOT_NAMES, randomSeed()));
  }, []);

  const dismissReveal = useCallback(() => setReveal(null), []);

  const isBotTurn =
    state.phase === "awaitingPlay" &&
    state.players[state.currentPlayerIndex].isBot;

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (reveal) return;

    if (!isBotTurn) {
      if (announce) setAnnounce(null);
      return;
    }

    if (!announce) {
      timer.current = setTimeout(() => {
        setState((s) => {
          if (
            s.phase === "awaitingPlay" &&
            s.players[s.currentPlayerIndex].isBot
          ) {
            const botId = s.currentPlayerIndex;
            setAnnounce({ botId, decision: decideBotMove(s, botId) });
          }
          return s;
        });
      }, THINK_MS);
    } else {
      timer.current = setTimeout(() => {
        const action = announce;
        setAnnounce(null);
        play(action.decision);
      }, ANNOUNCE_MS);
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [state, reveal, announce, isBotTurn, play]);

  const isHumanActable =
    state.phase === "awaitingPlay" &&
    !state.players[state.currentPlayerIndex].isBot &&
    !reveal &&
    !announce;

  return {
    state,
    reveal,
    dismissReveal,
    announce,
    play,
    nextRound,
    newMatch,
    isHumanActable,
  };
}
