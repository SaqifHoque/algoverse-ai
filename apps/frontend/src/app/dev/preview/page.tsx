"use client";

// Dev-only isolation route: renders each Visualizer standalone against the real captured
// fixtures, with step controls, independent of the submission flow or a live backend. This is
// the lighter alternative to installing Storybook that the plan called for -- worth upgrading
// to real Storybook once a 4th+ algorithm makes isolated component review pay for itself.

import { useState } from "react";

import { VisualizerStage } from "@/components/visualizers/VisualizerStage";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { FIXTURES, type FixtureKey } from "@/lib/fixtures";
import { LessonPlayerProvider, useLessonPlayerStore } from "@/stores/LessonPlayerContext";

const KEYS: FixtureKey[] = ["bubble_sort", "binary_search", "fibonacci_recursive"];

function StepControls() {
  const stepIndex = useLessonPlayerStore((s) => s.stepIndex);
  const progressWithinStep = useLessonPlayerStore((s) => s.progressWithinStep);
  const timelineLength = useLessonPlayerStore((s) => s.lesson.timeline.length);
  const actions = useLessonPlayerStore((s) => s.actions);

  return (
    <GlassPanel className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <button className="rounded-lg border px-2 py-1 text-sm" onClick={actions.prev}>
          &larr; prev
        </button>
        <span className="text-sm">
          step {stepIndex + 1} / {timelineLength}
        </span>
        <button className="rounded-lg border px-2 py-1 text-sm" onClick={actions.next}>
          next &rarr;
        </button>
      </div>
      <div>
        <label className="text-xs text-foreground/50">progressWithinStep (GSAP scrub)</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progressWithinStep}
          readOnly
          className="w-full"
          disabled
        />
        <p className="text-xs text-foreground/40">
          Use the real lesson page&apos;s scrubber/play button to see this drive the GSAP swap
          arc live -- this preview route is for layout/metaphor review, not full playback.
        </p>
      </div>
    </GlassPanel>
  );
}

export default function DevPreviewPage() {
  const [fixtureKey, setFixtureKey] = useState<FixtureKey>("bubble_sort");
  const lesson = FIXTURES[fixtureKey];

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-8">
      <h1 className="text-xl font-semibold">Visualizer dev preview</h1>
      <div className="flex gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setFixtureKey(key)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${key === fixtureKey ? "bg-accent text-white" : ""}`}
          >
            {key}
          </button>
        ))}
      </div>
      <LessonPlayerProvider lesson={lesson} key={fixtureKey}>
        <VisualizerStage />
        <StepControls />
      </LessonPlayerProvider>
    </main>
  );
}
