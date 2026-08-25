"use client";

import { useState } from "react";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import type { Hint } from "@/types/lesson";

export function HintsPanel({ hints }: { hints: Hint[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const onRequestHints = hints.filter((h) => h.trigger === "on_request");
  if (onRequestHints.length === 0) return null;

  return (
    <GlassPanel className="space-y-2 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Hints</h3>
      {onRequestHints.map((hint, index) => (
        <div key={index}>
          {revealed.has(index) ? (
            <p className="text-sm text-foreground/70">{hint.text}</p>
          ) : (
            <Button variant="ghost" onClick={() => setRevealed(new Set(revealed).add(index))}>
              Reveal hint {index + 1}
            </Button>
          )}
        </div>
      ))}
    </GlassPanel>
  );
}
