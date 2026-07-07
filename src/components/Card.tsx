import { CARD_DEFS, type CardValue } from "../game/cards";

type CardSize = "xs" | "sm" | "md" | "lg";

const SIZES: Record<CardSize, string> = {
  xs: "w-11",
  sm: "w-16",
  md: "w-24",
  lg: "w-40",
};

interface CardProps {
  value?: CardValue;
  faceDown?: boolean;
  size?: CardSize;
  selectable?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  detail?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CardBack({
  size = "sm",
  className = "",
}: {
  size?: CardSize;
  className?: string;
}) {
  return (
    <div
      className={`relative ${SIZES[size]} aspect-[63/88] shrink-0 overflow-hidden rounded-lg border border-accent/40 bg-[#0a0a0a] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b1330] via-[#0a0a0a] to-[#150c26]" />
      <div className="absolute inset-1 rounded-md border border-accent/25" />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-1/2 opacity-70">
          <g
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <path d="M20 3 C12 12 12 22 20 37 C28 22 28 12 20 3 Z" />
            <path d="M20 10 L20 30 M13 20 L27 20" />
            <circle cx="20" cy="20" r="3.2" fill="var(--accent)" stroke="none" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function Card({
  value,
  faceDown,
  size = "md",
  selectable,
  selected,
  dimmed,
  detail,
  onClick,
  className = "",
}: CardProps) {
  if (faceDown || value === undefined) {
    return <CardBack size={size} className={className} />;
  }

  const def = CARD_DEFS[value];
  const interactive = selectable && !!onClick;

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={`group relative ${SIZES[size]} aspect-[63/88] shrink-0 overflow-hidden rounded-lg border text-left transition ${
        selected
          ? "border-accent card-glow -translate-y-2"
          : "border-border"
      } ${
        interactive
          ? "cursor-pointer hover:-translate-y-1 hover:border-accent"
          : "cursor-default"
      } ${dimmed ? "eliminated-stamp" : ""} ${className}`}
    >
      <img
        src={def.art}
        alt={def.mtgName}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className={`absolute inset-0 ${
          detail
            ? "bg-[linear-gradient(to_top,#000_4%,rgba(0,0,0,0.82)_34%,transparent_64%)]"
            : "bg-gradient-to-t from-black/85 via-transparent to-black/40"
        }`}
      />
      <div className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-accent/70 bg-black/70 text-xs font-semibold text-accent">
        {value}
      </div>
      {detail ? (
        <div className="absolute inset-x-0 bottom-0 p-2">
          <div className="flex h-9 items-end">
            <span className="line-clamp-2 text-sm font-semibold leading-tight text-accent">
              {def.mtgName}
            </span>
          </div>
          <p className="mt-1 text-[0.68rem] leading-snug text-muted">
            {def.description}
          </p>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 p-1">
          <div className="line-clamp-2 text-[0.5rem] font-semibold leading-tight text-accent">
            {def.mtgName}
          </div>
        </div>
      )}
    </button>
  );
}
