"use client";

import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AlgorithmPicker } from "@/components/submission/AlgorithmPicker";
import { DifficultySelector } from "@/components/submission/DifficultySelector";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { FIXTURE_SOURCE_CODE } from "@/lib/fixtures";
import { useSubmissionStore } from "@/stores/submissionStore";
import type { AlgorithmName, Difficulty } from "@/types/lesson";

export function CodeSubmissionForm() {
  const router = useRouter();
  const submit = useSubmissionStore((s) => s.actions.submit);
  const [algorithmName, setAlgorithmName] = useState<AlgorithmName>("bubble_sort");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [sourceCode, setSourceCode] = useState(FIXTURE_SOURCE_CODE.bubble_sort.source_code);

  function handleAlgorithmChange(next: AlgorithmName) {
    setAlgorithmName(next);
    setSourceCode(FIXTURE_SOURCE_CODE[next].source_code);
  }

  async function handleSubmit() {
    router.push("/submissions/pending");
    const fixture = FIXTURE_SOURCE_CODE[algorithmName];
    await submit({
      sourceCode,
      entrypoint: fixture.entrypoint,
      algorithmName,
      args: fixture.args,
      difficulty,
    });
  }

  return (
    <GlassPanel className="space-y-5 p-6">
      <AlgorithmPicker value={algorithmName} onChange={handleAlgorithmChange} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Your Python solution
        </span>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border-glass">
        <CodeMirror value={sourceCode} height="220px" extensions={[python()]} onChange={setSourceCode} />
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Turn this into a lesson
      </Button>
    </GlassPanel>
  );
}
