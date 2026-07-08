import { useCallback, useEffect, useRef, useState } from "react";
import { decideBotMove, explainBotMove } from "../game/ai";
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
import { playSound } from "./sound";
import { isInsight, useStepMode } from "./settings";

const BOT_NAMES = ["You", "Sorin", "Chandra", "Jace"];

const THINK_MS = 800;
const ANNOUNCE_MS = 1700;

export interface BotAction {
  botId: PlayerId;
  decision: PlayDecision;
}

function playActionSounds(prev: GameState, next: GameState): void {
  const newEntries = next.log.slice(prev.log.length);
  const guardPlayed = newEntries.some((e) => e.kind === "play" && e.value === 1);
  const eliminated = newEntries.some((e) => e.kind === "eliminate");
  if (guardPlayed && eliminated) playSound("guard_hit");
  else playSound("card_play");

  if (prev.phase !== "roundOver" && next.phase === "roundOver") {
    playSound("favor");
  }
  if (
    prev.phase !== "matchOver" &&
    next.phase === "matchOver" &&
    next.matchWinnerId === 0
  ) {
    playSound("match_win");
  }
}

export function useGameController() {
  const [state, setState] = useState<GameState>(() =>
    createMatch(BOT_NAMES, randomSeed()),
  );
  const [reveal, setReveal] = useState<PendingReveal | null>(null);
  const [announce, setAnnounce] = useState<BotAction | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const announceRef = useRef(announce);
  announceRef.current = announce;
  const stepMode = useStepMode();

  const play = useCallback((decision: PlayDecision) => {
    const prev = stateRef.current;
    const actorId = prev.currentPlayerIndex;
    const actorIsBot = prev.players[actorId]?.isBot ?? false;
    let next = playCard(prev, decision);
    playActionSounds(prev, next);
    if (actorIsBot && isInsight()) {
      const text = explainBotMove(prev, actorId, decision);
      next = {
        ...next,
        log: [
          ...next.log,
          {
            id: next.logCounter,
            round: next.round,
            actor: actorId,
            kind: "insight",
            text,
          },
        ],
        logCounter: next.logCounter + 1,
      };
    }
    if (next.lastReveal && next.lastReveal.viewerId === 0) {
      setReveal(next.lastReveal);
    }
    setState(next);
  }, []);

  const nextRound = useCallback(() => {
    playSound("ui_click");
    setAnnounce(null);
    setState((s) => beginNextRound(s));
  }, []);

  const newMatch = useCallback(() => {
    playSound("ui_click");
    setReveal(null);
    setAnnounce(null);
    setState(createMatch(BOT_NAMES, randomSeed()));
  }, []);

  const dismissReveal = useCallback(() => setReveal(null), []);

  const continueBotTurn = useCallback(() => {
    const action = announceRef.current;
    if (!action) return;
    setAnnounce(null);
    play(action.decision);
  }, [play]);

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
    } else if (!stepMode) {
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
  }, [state, reveal, announce, isBotTurn, stepMode, play]);

  const isHumanActable =
    state.phase === "awaitingPlay" &&
    !state.players[state.currentPlayerIndex].isBot &&
    !reveal &&
    !announce;

  const awaitingContinue = stepMode && announce !== null && !reveal;

  return {
    state,
    reveal,
    dismissReveal,
    announce,
    awaitingContinue,
    continueBotTurn,
    play,
    nextRound,
    newMatch,
    isHumanActable,
  };
}
