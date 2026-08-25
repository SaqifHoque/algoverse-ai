"use client";

import { clsx } from "clsx";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { IconButton } from "@/components/ui/Button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useVoiceNarration } from "@/hooks/useVoiceNarration";
import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";
import type { PlaybackSpeed } from "@/stores/lessonPlayerStore";

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export function PlaybackControls() {
  const isPlaying = useLessonPlayerStore((s) => s.isPlaying);
  const stepIndex = useLessonPlayerStore((s) => s.stepIndex);
  const timelineLength = useLessonPlayerStore((s) => s.lesson.timeline.length);
  const speed = useLessonPlayerStore((s) => s.speed);
  const isFullscreen = useLessonPlayerStore((s) => s.isFullscreen);
  const actions = useLessonPlayerStore((s) => s.actions);
  const voice = useVoiceNarration();
  const sound = useSoundEffects();

  return (
    <GlassPanel className="flex flex-col gap-3 p-3">
      <input
        type="range"
        min={0}
        max={timelineLength - 1}
        value={stepIndex}
        onChange={(e) => actions.seekToStep(Number(e.target.value))}
        className="w-full accent-[rgb(var(--accent))]"
        aria-label="Timeline scrubber"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IconButton aria-label="Previous step" onClick={actions.prev} disabled={stepIndex === 0}>
            ⏮
          </IconButton>
          <IconButton aria-label={isPlaying ? "Pause" : "Play"} onClick={actions.toggle}>
            {isPlaying ? "⏸" : "▶"}
          </IconButton>
          <IconButton
            aria-label="Next step"
            onClick={actions.next}
            disabled={stepIndex === timelineLength - 1}
          >
            ⏭
          </IconButton>
          <IconButton aria-label="Replay" onClick={() => actions.seekToStep(0)}>
            ⟲
          </IconButton>
        </div>

        <span className="text-xs text-foreground/50">
          Step {stepIndex + 1} / {timelineLength}
        </span>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full border border-border-glass text-xs">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => actions.setSpeed(s)}
                className={clsx(
                  "px-2 py-1 transition-colors",
                  s === speed ? "bg-accent text-white" : "hover:bg-accent/10",
                )}
              >
                {s}x
              </button>
            ))}
          </div>
          <IconButton
            aria-label="Toggle voice narration"
            onClick={voice.toggle}
            className={voice.isEnabled ? "text-accent" : "text-foreground/40"}
          >
            🔊
          </IconButton>
          <IconButton
            aria-label="Toggle sound effects"
            onClick={sound.toggle}
            className={sound.isEnabled ? "text-accent" : "text-foreground/40"}
          >
            🔔
          </IconButton>
          <IconButton aria-label="Toggle fullscreen" onClick={actions.toggleFullscreen}>
            {isFullscreen ? "⤦" : "⛶"}
          </IconButton>
        </div>
      </div>
    </GlassPanel>
  );
}
