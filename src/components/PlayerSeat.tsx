import type { Player } from "../game/types";
import { Card, CardBack } from "./Card";

interface PlayerSeatProps {
  player: Player;
  isCurrent: boolean;
  tokensToWin: number;
}

function SeatCards({
  player,
  size,
}: {
  player: Player;
  size: "xs" | "sm";
}) {
  const lastDiscard = player.discards[player.discards.length - 1];
  return (
    <div className="flex items-end gap-1 lg:gap-2">
      <div className="flex items-center gap-1">
        {player.isOut ? (
          <span className="label rounded border border-border px-1.5 py-1 text-muted">
            Out
          </span>
        ) : (
          Array.from({ length: Math.max(1, player.hand.length) }).map((_, i) => (
            <CardBack key={i} size={size} />
          ))
        )}
      </div>

      {lastDiscard !== undefined && (
        <div className="relative">
          <Card value={lastDiscard} size={size} dimmed />
          {player.discards.length > 1 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-black/80 text-[0.6rem] text-muted">
              {player.discards.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
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
}: PlayerSeatProps) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border bg-surface/70 px-1.5 py-1.5 transition lg:gap-1.5 lg:px-3 lg:py-2 ${
        isCurrent ? "border-accent card-glow" : "border-border"
      } ${player.isOut ? "opacity-45" : ""}`}
    >
      <div className="flex w-full items-center justify-between gap-1 lg:gap-3">
        <span className="min-w-0 truncate text-xs font-semibold tracking-tight lg:text-sm">
          {player.name}
        </span>
        <FavorPips favor={player.favor} total={tokensToWin} />
      </div>

      <div className="lg:hidden">
        <SeatCards player={player} size="xs" />
      </div>
      <div className="hidden lg:block">
        <SeatCards player={player} size="sm" />
      </div>

      {player.isProtected && !player.isOut && (
        <span className="label text-accent">Shielded</span>
      )}
    </div>
  );
}
