"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";

import { CATEGORY_LABELS, EXAMPLE_SNIPPETS, groupExamplesByCategory } from "@/lib/examples";
import type { ExampleCategory, ExampleKind, ExampleSnippet } from "@/lib/examples";

const CATEGORY_ICONS: Record<ExampleCategory, string> = {
  arrays: "▦", strings: "Aa", linked_lists: "↝", stacks_queues: "⇅", trees: "♧",
  pointers: "↔", hashing: "#", searching: "⌕", sorting: "↕", graphs: "⌘",
  recursion: "↻", dynamic_programming: "▥", greedy: "◈", math: "∑",
};

export function CurriculumBrowser({ onSelect }: { onSelect: (snippet: ExampleSnippet) => void }) {
  const [track, setTrack] = useState<"all" | ExampleKind>("all");
  const [category, setCategory] = useState<ExampleCategory | "all">("all");
  const [query, setQuery] = useState("");

  const groups = groupExamplesByCategory();
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return EXAMPLE_SNIPPETS.filter((snippet) => {
      const kind = snippet.kind ?? "algorithm";
      const matchesTrack = track === "all" || kind === track;
      const matchesCategory = category === "all" || snippet.category === category;
      const haystack = `${snippet.label} ${snippet.description ?? ""} ${CATEGORY_LABELS[snippet.category]}`.toLowerCase();
      return matchesTrack && matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [category, query, track]);

  return (
    <section className="overflow-hidden rounded-2xl border border-border-glass bg-foreground/[0.025]">
      <div className="border-b border-border-glass p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              Learning library
            </div>
            <h2 className="text-xl font-semibold">Choose a concept to visualize</h2>
            <p className="mt-1 text-sm text-foreground/50">
              {EXAMPLE_SNIPPETS.length} beginner-friendly, editable Python lessons.
            </p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lessons..."
            className="w-full rounded-xl border border-border-glass bg-surface/60 px-4 py-2.5 text-sm outline-none transition focus:border-accent sm:w-64"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {([
            ["all", "All lessons"],
            ["data_structure", "Data structures"],
            ["algorithm", "Algorithms"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => { setTrack(value); setCategory("all"); }}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                track === value ? "bg-accent text-white" : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto border-b border-border-glass p-3 md:max-h-[430px] md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={clsx("whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs transition", category === "all" ? "bg-accent/10 font-semibold text-accent" : "text-foreground/55 hover:bg-foreground/5")}
          >
            ◉ &nbsp;All modules
          </button>
          {groups.map((group) => {
            const count = group.snippets.filter((item) => track === "all" || (item.kind ?? "algorithm") === track).length;
            if (!count) return null;
            return (
              <button
                key={group.category}
                type="button"
                onClick={() => setCategory(group.category)}
                className={clsx("flex min-w-max items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition", category === group.category ? "bg-accent/10 font-semibold text-accent" : "text-foreground/55 hover:bg-foreground/5")}
              >
                <span><span className="mr-2 inline-block w-5 text-center">{CATEGORY_ICONS[group.category]}</span>{group.label}</span>
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px]">{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="max-h-[430px] overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-foreground/40">
            <span>{category === "all" ? "All modules" : CATEGORY_LABELS[category]}</span>
            <span>{visible.length} lessons</span>
          </div>
          {visible.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {visible.map((snippet, index) => (
                <button
                  key={snippet.key}
                  type="button"
                  onClick={() => onSelect(snippet)}
                  className="group rounded-xl border border-border-glass bg-surface/40 p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-bold text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full bg-foreground/5 px-2 py-1 font-mono text-[10px] text-foreground/45">
                      {snippet.complexity ?? "Beginner"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold group-hover:text-accent">{snippet.label}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-foreground/45">
                    {snippet.description ?? `Learn ${snippet.label.toLowerCase()} step by step with a runnable example.`}
                  </p>
                  <span className="mt-3 inline-block text-xs font-medium text-accent opacity-0 transition group-hover:opacity-100">
                    Open in playground →
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-foreground/40">No lessons match that search.</div>
          )}
        </div>
      </div>
    </section>
  );
}
