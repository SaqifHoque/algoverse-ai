"use client";

import { clsx } from "clsx";

import type { AlgorithmName } from "@/types/lesson";

const ALGORITHMS: { key: AlgorithmName; label: string; emoji: string }[] = [
  { key: "bubble_sort", label: "Bubble Sort", emoji: "🫧" },
  { key: "binary_search", label: "Binary Search", emoji: "📖" },
  { key: "fibonacci_recursive", label: "Fibonacci (recursive)", emoji: "🪞" },
  { key: "custom", label: "Custom / Other", emoji: "🧩" },
];

export function AlgorithmPicker({
  value,
  onChange,
}: {
  value: AlgorithmName;
  onChange: (value: AlgorithmName) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ALGORITHMS.map((algo) => (
        <button
          key={algo.key}
          onClick={() => onChange(algo.key)}
          className={clsx(
            "glass-panel flex flex-col items-center gap-2 p-4 text-sm font-medium transition-all",
            value === algo.key ? "border-accent ring-2 ring-accent/40" : "hover:bg-accent/5",
          )}
        >
          <span className="text-2xl">{algo.emoji}</span>
          {algo.label}
        </button>
      ))}
    </div>
  );
}
