import { useEffect, useState } from "react";
import { CARD_DEFS, type CardValue } from "../game/cards";
import { legalTargets, playableCards } from "../game/engine";
import type { useGameController } from "../lib/useGameController";
import { CardBack } from "./Card";
import { PlayerSeat } from "./PlayerSeat";
import { Hand } from "./Hand";
import { EventLog } from "./EventLog";
import { ActionPrompt } from "./ActionPrompt";
import { BotActionBanner } from "./BotActionBanner";
import { Grimoire } from "./Grimoire";
import { RevealToast } from "./RevealToast";
import { RoundBanner } from "./RoundBanner";
import { MatchOverScreen } from "./MatchOverScreen";

type Controller = ReturnType<typeof useGameController>;

function CenterPod({
  deckCount,
  turnLabel,
}: {
  deckCount: number;
  turnLabel: string;
}) {
  return (
    <>
      <div className="hidden flex-col items-center gap-2 lg:flex">
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
        <p className="rounded-full border border-border bg-black/40 px-3 py-1 text-xs text-accent text-glow-soft">
          {turnLabel}
        </p>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <span className="rounded-full border border-border bg-black/40 px-3 py-1 text-xs text-accent text-glow-soft">
          {turnLabel}
        </span>
        <span className="flex items-center gap-1 rounded-full border border-border bg-black/40 px-2.5 py-1 text-xs text-muted">
          <span className="font-semibold text-accent">{deckCount}</span>
          in deck
        </span>
      </div>
    </>
  );
}

export function GameTable({ ctrl }: { ctrl: Controller }) {
  const {
    state,
    reveal,
    dismissReveal,
    announce,
    play,
    nextRound,
    newMatch,
    isHumanActable,
  } = ctrl;
  const [selected, setSelected] = useState<CardValue | null>(null);
  const [showGrimoire, setShowGrimoire] = useState(false);

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
    <div className="flex h-screen flex-col overflow-x-hidden">
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-baseline gap-2 sm:gap-3">
          <span className="truncate text-base font-semibold tracking-tight text-glow-soft sm:text-lg">
            Liliana's Favor
          </span>
          <span className="label shrink-0 text-muted">Round {state.round}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-muted sm:inline">
            First to {state.tokensToWin} favors
          </span>
          <button
            type="button"
            onClick={() => setShowGrimoire(true)}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-foreground"
          >
            Grimoire
          </button>
          <button
            type="button"
            onClick={newMatch}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-foreground"
          >
            New match
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1">
        <section className="relative flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto p-3">
          <div className="flex w-full flex-wrap items-start justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <PlayerSeat
                key={i}
                player={state.players[i]}
                isCurrent={state.currentPlayerIndex === i}
                tokensToWin={state.tokensToWin}
              />
            ))}
          </div>

          <CenterPod deckCount={state.deck.length} turnLabel={turnLabel} />

          <div className="mt-auto flex w-full flex-col items-center gap-3 pt-2">
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

            <EventLog
              log={state.log.slice(-30)}
              className="max-h-28 w-full max-w-md lg:hidden"
            />
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

      {announce && <BotActionBanner state={state} action={announce} />}

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
