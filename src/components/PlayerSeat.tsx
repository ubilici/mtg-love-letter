import type { Player } from "../game/types";
import { Card, CardBack } from "./Card";

interface PlayerSeatProps {
  player: Player;
  isCurrent: boolean;
  tokensToWin: number;
  compact?: boolean;
}

function FavorPips({ favor, total }: { favor: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < favor ? "bg-accent" : "bg-border"
          }`}
          style={
            i < favor
              ? { boxShadow: "0 0 6px rgba(167,139,250,0.8)" }
              : undefined
          }
        />
      ))}
    </div>
  );
}

export function PlayerSeat({
  player,
  isCurrent,
  tokensToWin,
  compact,
}: PlayerSeatProps) {
  const lastDiscard = player.discards[player.discards.length - 1];

  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-xl border bg-surface/70 px-3 py-2 transition ${
        isCurrent
          ? "border-accent card-glow"
          : "border-border"
      } ${player.isOut ? "opacity-45" : ""}`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-sm font-semibold tracking-tight">
          {player.name}
        </span>
        <FavorPips favor={player.favor} total={tokensToWin} />
      </div>

      <div className="flex items-end gap-2">
        <div className="flex items-center gap-1">
          {player.isOut ? (
            <span className="label rounded border border-border px-2 py-1 text-muted">
              Out
            </span>
          ) : (
            Array.from({ length: Math.max(1, player.hand.length) }).map(
              (_, i) => <CardBack key={i} size={compact ? "sm" : "sm"} />,
            )
          )}
        </div>

        {lastDiscard !== undefined && (
          <div className="relative">
            <Card value={lastDiscard} size="sm" dimmed />
            {player.discards.length > 1 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-black/80 text-[0.6rem] text-muted">
                {player.discards.length}
              </span>
            )}
          </div>
        )}
      </div>

      {player.isProtected && !player.isOut && (
        <span className="label text-accent">Shielded</span>
      )}
    </div>
  );
}
