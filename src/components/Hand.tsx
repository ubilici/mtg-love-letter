import { CARD_DEFS, type CardValue } from "../game/cards";
import { Card } from "./Card";

interface HandProps {
  hand: CardValue[];
  playable: CardValue[];
  actable: boolean;
  selected: CardValue | null;
  onSelect: (card: CardValue) => void;
}

export function Hand({
  hand,
  playable,
  actable,
  selected,
  onSelect,
}: HandProps) {
  const forced = actable && playable.length === 1 && hand.length > 1;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-end gap-4">
        {hand.map((value, i) => {
          const isPlayable = actable && playable.includes(value);
          return (
            <div key={`${value}-${i}`} className="flex flex-col items-center gap-1">
              <Card
                value={value}
                size="lg"
                selectable={isPlayable}
                selected={selected === value}
                dimmed={actable && !isPlayable}
                onClick={isPlayable ? () => onSelect(value) : undefined}
                className="anim-deal"
              />
              <span className="hidden max-w-40 text-center text-[0.65rem] leading-tight text-muted sm:block">
                {CARD_DEFS[value].description}
              </span>
            </div>
          );
        })}
      </div>
      {forced && (
        <p className="label text-accent">
          Griselbrand must be discarded
        </p>
      )}
    </div>
  );
}
