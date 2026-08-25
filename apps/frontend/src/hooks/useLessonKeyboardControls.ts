"use client";

import { useEffect } from "react";

import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";
import type { PlaybackSpeed } from "@/stores/lessonPlayerStore";

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export function useLessonKeyboardControls() {
  const actions = useLessonPlayerStore((s) => s.actions);
  const speed = useLessonPlayerStore((s) => s.speed);
  const timelineLength = useLessonPlayerStore((s) => s.lesson.timeline.length);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      switch (event.key) {
        case " ":
          event.preventDefault();
          actions.toggle();
          break;
        case "ArrowRight":
        case "l":
          actions.next();
          break;
        case "ArrowLeft":
        case "h":
          actions.prev();
          break;
        case "ArrowUp": {
          const idx = SPEEDS.indexOf(speed);
          if (idx < SPEEDS.length - 1) actions.setSpeed(SPEEDS[idx + 1]!);
          break;
        }
        case "ArrowDown": {
          const idx = SPEEDS.indexOf(speed);
          if (idx > 0) actions.setSpeed(SPEEDS[idx - 1]!);
          break;
        }
        case "f":
          actions.toggleFullscreen();
          break;
        case "m":
          actions.toggleSound();
          break;
        case "v":
          actions.toggleVoice();
          break;
        case "Escape":
          if (document.fullscreenElement) actions.toggleFullscreen();
          break;
        default:
          if (event.key >= "0" && event.key <= "9") {
            const decile = Number(event.key) / 10;
            actions.seekToStep(Math.round(decile * (timelineLength - 1)));
          }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions, speed, timelineLength]);
}
