"use client";

import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { CurriculumBrowser } from "@/components/curriculum/CurriculumBrowser";
import { DifficultySelector } from "@/components/submission/DifficultySelector";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import type { ExampleSnippet } from "@/lib/examples";
import { FIXTURE_SOURCE_CODE } from "@/lib/fixtures";
import { useSubmissionStore } from "@/stores/submissionStore";
import type { AlgorithmName, Difficulty } from "@/types/lesson";

function topLevelFunctions(source: string): string[] {
  return Array.from(source.matchAll(/^def\s+([A-Za-z_]\w*)\s*\(/gm), (match) => match[1]!);
}

export function CodeSubmissionForm() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const submit = useSubmissionStore((s) => s.actions.submit);
  const [algorithmName, setAlgorithmName] = useState<AlgorithmName>("bubble_sort");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [sourceCode, setSourceCode] = useState(FIXTURE_SOURCE_CODE.bubble_sort.source_code);
  const [entrypoint, setEntrypoint] = useState(FIXTURE_SOURCE_CODE.bubble_sort.entrypoint);
  const [argsText, setArgsText] = useState(JSON.stringify(FIXTURE_SOURCE_CODE.bubble_sort.args));
  const [argsError, setArgsError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState("Bubble Sort");

  function handleAlgorithmChange(next: AlgorithmName) {
    setAlgorithmName(next);
    const fixture = FIXTURE_SOURCE_CODE[next];
    setSourceCode(fixture.source_code);
    setEntrypoint(fixture.entrypoint);
    setArgsText(JSON.stringify(fixture.args));
    setArgsError(null);
    setCodeError(null);
    setSelectedLesson(next === "bubble_sort" ? "Bubble Sort" : next === "binary_search" ? "Binary Search" : "Recursive Fibonacci");
  }

  function loadLesson(snippet: ExampleSnippet) {
    setAlgorithmName("custom");
    setSourceCode(snippet.source_code);
    setEntrypoint(snippet.entrypoint);
    setArgsText(JSON.stringify(snippet.args));
    setArgsError(null);
    setCodeError(null);
    setSelectedLesson(snippet.label);
    document.getElementById("playground")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startBlank() {
    setAlgorithmName("custom");
    setSourceCode("def my_solution(items):\n    # Write your solution here\n    return items\n");
    setEntrypoint("my_solution");
    setArgsText("[[5, 3, 1, 4, 2]]");
    setArgsError(null);
    setCodeError(null);
    setSelectedLesson("Custom solution");
    document.getElementById("playground")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSourceCodeChange(nextSource: string) {
    setSourceCode(nextSource);
    setCodeError(null);
    const functions = topLevelFunctions(nextSource);
    // The most common custom-code failure was pasting a new function while the hidden
    // entrypoint still named the previous demo. Repair that mismatch immediately.
    if (functions.length > 0 && !functions.includes(entrypoint)) {
      setEntrypoint(functions[0]!);
      setAlgorithmName("custom");
      setSelectedLesson("Custom solution");
    }
  }

  async function handleSubmit() {
    const functions = topLevelFunctions(sourceCode);
    if (!functions.includes(entrypoint)) {
      setCodeError(
        functions.length
          ? `Entrypoint “${entrypoint}” is not a top-level function. Choose one of: ${functions.join(", ")}.`
          : "Add at least one top-level Python function, for example: def my_solution(items):",
      );
      return;
    }
    let args: unknown[];
    try {
      args = JSON.parse(argsText);
      if (!Array.isArray(args)) throw new Error("must be a JSON array");
    } catch (err) {
      setArgsError(`Arguments must be a valid JSON array, e.g. [[5,3,1,4,2]] -- ${err instanceof Error ? err.message : err}`);
      return;
    }
    setArgsError(null);

    router.push("/submissions/pending");
    await submit({
      sourceCode,
      entrypoint,
      algorithmName,
      args,
      difficulty,
    });
  }

  return (
    <div className="space-y-8">
      <CurriculumBrowser onSelect={loadLesson} />

      <GlassPanel id="playground" className="scroll-mt-6 space-y-5 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">AI playground</div>
          <h2 className="mt-1 text-xl font-semibold">{selectedLesson}</h2>
          <p className="mt-1 text-xs text-foreground/45">Edit the starter or paste a completely custom Python solution.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["bubble_sort", "binary_search", "fibonacci_recursive"] as AlgorithmName[]).map((name) => (
            <button key={name} type="button" onClick={() => handleAlgorithmChange(name)} className="rounded-lg bg-foreground/5 px-3 py-1.5 text-xs text-foreground/60 transition hover:bg-accent/10 hover:text-accent">
              {name === "bubble_sort" ? "Bubble" : name === "binary_search" ? "Binary" : "Fibonacci"}
            </button>
          ))}
          <button type="button" onClick={startBlank} className="rounded-lg border border-accent/30 px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/10">
            + Blank solution
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Your Python solution
        </span>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border-glass">
        {mounted && (
          <CodeMirror
            value={sourceCode}
            height="220px"
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            extensions={[python()]}
            onChange={handleSourceCodeChange}
          />
        )}
      </div>

      <p className="text-xs text-foreground/50">
        Edited the code into something else entirely? Update the entrypoint/arguments below to
        match -- they&apos;re what actually gets called, independent of the code text.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-foreground/50">
            Entrypoint function name
          </span>
          <input
            value={entrypoint}
            onChange={(e) => { setEntrypoint(e.target.value); setCodeError(null); }}
            list="entrypoint-functions"
            className="w-full rounded-lg border border-border-glass bg-transparent px-3 py-1.5 font-mono text-sm text-foreground"
            spellCheck={false}
          />
          <datalist id="entrypoint-functions">
            {topLevelFunctions(sourceCode).map((name) => <option key={name} value={name} />)}
          </datalist>
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-foreground/50">
            Arguments (JSON array)
          </span>
          <input
            value={argsText}
            onChange={(e) => setArgsText(e.target.value)}
            className="w-full rounded-lg border border-border-glass bg-transparent px-3 py-1.5 font-mono text-sm text-foreground"
            spellCheck={false}
          />
        </label>
      </div>
      {argsError && <p className="text-xs text-red-400">{argsError}</p>}
      {codeError && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{codeError}</p>}

      <Button onClick={handleSubmit} className="w-full">
        Run code & create AI visualization
      </Button>
      <p className="text-center text-[11px] text-foreground/35">Your code is executed locally, then your Ollama model writes the narration. No cloud AI API is used.</p>
      </GlassPanel>
    </div>
  );
}
