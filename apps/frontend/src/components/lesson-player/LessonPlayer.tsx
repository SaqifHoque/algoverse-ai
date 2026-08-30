"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { CodePanel } from "@/components/lesson-player/CodePanel";
import { HintsPanel } from "@/components/lesson-player/HintsPanel";
import { MemoryPanel } from "@/components/lesson-player/MemoryPanel";
import { NarrationPanel } from "@/components/lesson-player/NarrationPanel";
import { PlaybackControls } from "@/components/lesson-player/PlaybackControls";
import { QuizPanel } from "@/components/lesson-player/QuizPanel";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { VisualizerStage } from "@/components/visualizers/VisualizerStage";
import { useLessonKeyboardControls } from "@/hooks/useLessonKeyboardControls";
import { useLessonPlayback } from "@/hooks/useLessonPlayback";
import { completeLesson } from "@/lib/api/progress";
import { LessonPlayerProvider, useLessonPlayerStore } from "@/stores/LessonPlayerContext";
import type { Lesson, ProgressSummary } from "@/types/lesson";

function LessonPlayerInner({ sourceCode }: { sourceCode: string }) {
  useLessonPlayback();
  useLessonKeyboardControls();

  const lesson = useLessonPlayerStore((s) => s.lesson);
  const stepIndex = useLessonPlayerStore((s) => s.stepIndex);
  const isFullscreen = useLessonPlayerStore((s) => s.isFullscreen);
  const currentStep = lesson.timeline[stepIndex]!;
  const containerRef = useRef<HTMLDivElement>(null);
  const completionStarted = useRef(false);
  const [reward, setReward] = useState<ProgressSummary | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);

  const handleComplete = useCallback(
    async (score: number) => {
      if (completionStarted.current) return;
      completionStarted.current = true;
      setCompletionScore(score);
      setIsSavingCompletion(true);
      setCompletionError(null);
      try {
        setReward(await completeLesson(lesson.lesson_id, score, lesson.difficulty));
      } catch {
        completionStarted.current = false;
        setCompletionError("Progress could not be saved. You can retry by completing the lesson again.");
      } finally {
        setIsSavingCompletion(false);
      }
    },
    [lesson.difficulty, lesson.lesson_id],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isFullscreen && !document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else if (!isFullscreen && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [isFullscreen]);

  return (
    <div ref={containerRef} className="mx-auto flex max-w-6xl flex-col gap-4 bg-surface p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs text-foreground/40 hover:text-accent">
            &larr; New submission
          </Link>
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
          <p className="text-sm text-foreground/50">
            {lesson.algorithm_name} &middot; {lesson.difficulty} &middot; {lesson.complexity_overall}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <VisualizerStage />
          <PlaybackControls />
          <NarrationPanel step={currentStep} />
        </div>
        <div className="flex flex-col gap-4">
          <CodePanel
            sourceCode={sourceCode}
            currentLine={currentStep.current_line}
            highlightedLines={currentStep.highlighted_lines}
          />
          <MemoryPanel memoryView={currentStep.memory_view} />
          <HintsPanel hints={lesson.hints} />
        </div>
      </div>

      <QuizPanel quiz={lesson.quiz} onComplete={handleComplete} />

      {(isSavingCompletion || reward || completionError) && (
        <div className="glass-panel p-4" role="status">
          {isSavingCompletion && <p className="text-sm text-foreground/60">Saving your progress...</p>}
          {completionError && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-red-400">{completionError}</p>
              <button
                className="rounded-lg border border-border-glass px-3 py-1 text-sm hover:bg-accent/10"
                onClick={() => handleComplete(completionScore)}
              >
                Retry
              </button>
            </div>
          )}
          {reward && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">Lesson complete</p>
                <p className="text-lg font-semibold">
                  +{reward.lessons.find((item) => item.lesson_id === lesson.lesson_id)?.xp ?? 0} XP
                </p>
              </div>
              <div className="text-right text-sm text-foreground/70">
                <p>Level {reward.level} &middot; {reward.total_xp} total XP</p>
                <p>{reward.completed_lessons} lessons completed</p>
              </div>
              {reward.badges.length > 0 && (
                <div className="w-full border-t border-border-glass pt-3 text-sm">
                  Badges: {reward.badges.map((badge) => badge.name).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <GlassSummary summary={lesson.summary} objectives={lesson.learning_objectives} story={lesson.story} />
    </div>
  );
}

function GlassSummary({
  summary,
  objectives,
  story,
}: {
  summary: string;
  objectives: string[];
  story: string;
}) {
  return (
    <div className="glass-panel space-y-3 p-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">The story</h3>
        <p className="text-sm text-foreground/70">{story}</p>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">You&apos;ll learn</h3>
        <ul className="list-inside list-disc text-sm text-foreground/70">
          {objectives.map((objective, i) => (
            <li key={i}>{objective}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Summary</h3>
        <p className="text-sm text-foreground/70">{summary}</p>
      </div>
    </div>
  );
}

export function LessonPlayer({ lesson, sourceCode }: { lesson: Lesson; sourceCode: string }) {
  return (
    <LessonPlayerProvider lesson={lesson}>
      <LessonPlayerInner sourceCode={sourceCode} />
    </LessonPlayerProvider>
  );
}
