import { useEffect, useState } from "react";
import { CARD_DEFS, type CardValue } from "../game/cards";
import { legalTargets, playableCards } from "../game/engine";
import type { useGameController } from "../lib/useGameController";
import { Card, CardBack } from "./Card";
import { PlayerSeat } from "./PlayerSeat";
import { Hand } from "./Hand";
import { EventLog } from "./EventLog";
import { ActionPrompt } from "./ActionPrompt";
import { BotActionBanner } from "./BotActionBanner";
import { Grimoire } from "./Grimoire";
import { Settings } from "./Settings";
import { RevealToast } from "./RevealToast";
import { playSound } from "../lib/sound";
import { RoundBanner } from "./RoundBanner";
import { MatchOverScreen } from "./MatchOverScreen";

type Controller = ReturnType<typeof useGameController>;

function CenterPod({
  deckCount,
  turnLabel,
  faceUp,
}: {
  deckCount: number;
  turnLabel: string;
  faceUp: CardValue[];
}) {
  return (
    <>
      <div className="hidden flex-col items-center gap-2 lg:flex lg:my-auto">
        <div className="flex items-end gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <CardBack size="md" />
              <span className="absolute -bottom-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full border border-accent/50 bg-black/85 px-1 text-xs font-semibold text-accent">
                {deckCount}
              </span>
            </div>
            <span className="label text-muted">Deck</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-60">
            <CardBack size="sm" />
            <span className="label text-muted">Banished</span>
          </div>
        </div>
        {faceUp.length > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-1.5">
              {faceUp.map((c, i) => (
                <Card key={i} value={c} size="sm" dimmed />
              ))}
            </div>
            <span className="label text-muted">Revealed</span>
          </div>
        )}
        <p className="rounded-full border border-border bg-black/40 px-3 py-1 text-xs text-accent text-glow-soft">
          {turnLabel}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-black/40 px-3 py-1 text-xs text-accent text-glow-soft">
            {turnLabel}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-border bg-black/40 px-2.5 py-1 text-xs text-muted">
            <span className="font-semibold text-accent">{deckCount}</span>
            in deck
          </span>
        </div>
        {faceUp.length > 0 && (
          <div className="flex items-end gap-1.5">
            {faceUp.map((c, i) => (
              <Card key={i} value={c} size="xs" dimmed />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function GameTable({
  ctrl,
  onExitToMenu,
}: {
  ctrl: Controller;
  onExitToMenu: () => void;
}) {
  const {
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
  } = ctrl;
  const [selected, setSelected] = useState<CardValue | null>(null);
  const [showGrimoire, setShowGrimoire] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    if (!isHumanActable) setSelected(null);
  }, [isHumanActable]);

  const human = state.players[0];
  const playable = playableCards(human.hand);

  const handleSelect = (card: CardValue) => {
    const def = CARD_DEFS[card];
    if (def.needsTarget) {
      const targets = legalTargets(state, 0, card);
      if (targets.length === 0) {
        play({ card });
        return;
      }
      setSelected(card);
    } else {
      play({ card });
    }
  };

  const currentName = state.players[state.currentPlayerIndex].name;
  const turnLabel =
    state.currentPlayerIndex === 0 ? "Your turn" : `${currentName} is scheming…`;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-baseline gap-2 sm:gap-3">
          <span className="truncate text-base font-semibold tracking-tight text-glow-soft sm:text-lg">
            Liliana's Favor
          </span>
          <span className="label shrink-0 text-muted">Round {state.round}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-muted sm:inline">
            First to {state.tokensToWin} favors
          </span>
          <button
            type="button"
            onClick={() => {
              playSound("ui_click");
              setShowGrimoire(true);
            }}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-foreground"
          >
            Grimoire
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("ui_click");
              setShowSettings(true);
            }}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-foreground"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1">
        <section className="relative flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto p-3">
          <div className="flex w-full flex-wrap items-start justify-center gap-1.5 lg:gap-2">
            {state.players.slice(1).map((p) => (
              <PlayerSeat
                key={p.id}
                player={p}
                isCurrent={state.currentPlayerIndex === p.id}
                tokensToWin={state.tokensToWin}
              />
            ))}
          </div>

          <CenterPod
            deckCount={state.deck.length}
            turnLabel={turnLabel}
            faceUp={state.faceUpCards}
          />

          <div className="mt-auto mb-12 flex w-full flex-col items-center gap-2 pt-0 lg:mb-0 lg:mt-0 lg:gap-3 lg:pt-2">
            <div
              className={`rounded-xl border px-4 py-2 transition ${
                state.currentPlayerIndex === 0 && !human.isOut
                  ? "border-accent card-glow"
                  : "border-border"
              } ${human.isOut ? "opacity-45" : ""}`}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-semibold tracking-tight">
                  {human.name}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: state.tokensToWin }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < human.favor ? "bg-accent" : "bg-border"
                      }`}
                      style={
                        i < human.favor
                          ? { boxShadow: "0 0 6px rgba(167,139,250,0.8)" }
                          : undefined
                      }
                    />
                  ))}
                </div>
                {human.isProtected && !human.isOut && (
                  <span className="label text-accent">Shielded</span>
                )}
                {human.isOut && <span className="label text-red-400">Out</span>}
              </div>
            </div>

            {human.isOut ? (
              <p className="py-4 text-sm text-muted">
                You are out this round. Watching the rivals…
              </p>
            ) : (
              <Hand
                hand={human.hand}
                playable={playable}
                actable={isHumanActable}
                selected={selected}
                onSelect={handleSelect}
              />
            )}

            <button
              type="button"
              onClick={() => {
                playSound("ui_click");
                setShowLog(true);
              }}
              className="rounded-md border border-border px-4 py-1.5 text-xs text-muted transition hover:border-accent hover:text-foreground lg:hidden"
            >
              Chronicle
            </button>
          </div>
        </section>

        <EventLog log={state.log} className="m-3 hidden w-72 lg:flex" />
      </main>

      {selected !== null && isHumanActable && (
        <ActionPrompt
          state={state}
          card={selected}
          onConfirm={(decision) => {
            setSelected(null);
            play(decision);
          }}
          onCancel={() => setSelected(null)}
        />
      )}

      {showGrimoire && <Grimoire onClose={() => setShowGrimoire(false)} />}

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onNewMatch={newMatch}
          onExitToMenu={onExitToMenu}
        />
      )}

      {showLog && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/70 lg:hidden anim-fade"
          onClick={() => setShowLog(false)}
        >
          <div
            className="relative w-full anim-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowLog(false)}
              className="absolute right-3 top-2 z-10 rounded-full border border-border bg-black/60 px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-foreground"
            >
              Close
            </button>
            <EventLog
              log={state.log}
              className="max-h-[70vh] w-full rounded-b-none"
            />
          </div>
        </div>
      )}

      {announce && <BotActionBanner state={state} action={announce} />}

      {awaitingContinue && (
        <div className="fixed inset-x-0 top-1/2 z-40 flex translate-y-16 justify-center px-4 lg:pl-0 lg:pr-[312px]">
          <button
            type="button"
            onClick={continueBotTurn}
            className="rounded-md bg-accent px-6 py-2 text-sm font-medium text-black shadow-lg transition hover:opacity-90 anim-pop"
          >
            Continue ▶
          </button>
        </div>
      )}

      {reveal && (
        <RevealToast state={state} reveal={reveal} onDismiss={dismissReveal} />
      )}

      {state.phase === "roundOver" && (
        <RoundBanner state={state} onContinue={nextRound} />
      )}

      {state.phase === "matchOver" && (
        <MatchOverScreen state={state} onNewMatch={newMatch} />
      )}
    </div>
  );
}
