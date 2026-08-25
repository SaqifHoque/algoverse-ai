"use client";

import { clsx } from "clsx";

import type { Difficulty } from "@/types/lesson";

const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced"];

export function DifficultySelector({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-full border border-border-glass text-sm">
      {LEVELS.map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={clsx(
            "px-4 py-1.5 capitalize transition-colors",
            level === value ? "bg-accent text-white" : "hover:bg-accent/10",
          )}
        >
          {level}
        </button>
      ))}
    </div>
  );
}
