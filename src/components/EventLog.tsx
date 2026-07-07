import { useEffect, useRef } from "react";
import type { LogEntry } from "../game/types";

const KIND_COLOR: Partial<Record<LogEntry["kind"], string>> = {
  eliminate: "text-red-400",
  roundWin: "text-accent",
  matchWin: "text-accent",
  favor: "text-accent",
  peek: "text-sky-300",
  swap: "text-amber-300",
  compare: "text-amber-300",
  protect: "text-emerald-300",
};

export function EventLog({ log, className = "" }: { log: LogEntry[]; className?: string }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log.length]);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-border bg-surface/60 ${className}`}
    >
      <div className="border-b border-border px-3 py-2">
        <span className="label text-accent">Chronicle</span>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-2 text-xs">
        {log.map((entry) => (
          <p
            key={entry.id}
            className={`leading-snug ${KIND_COLOR[entry.kind] ?? "text-muted"} anim-fade`}
          >
            {entry.text}
          </p>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
