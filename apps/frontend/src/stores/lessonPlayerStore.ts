import { createStore } from "zustand/vanilla";

import type { Lesson } from "@/types/lesson";

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export interface PendingInteraction {
  stepIndex: number;
  kind: string;
}

export interface LessonPlayerState {
  lesson: Lesson;
  stepIndex: number;
  progressWithinStep: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  pendingInteraction: PendingInteraction | null;
  quizAnswers: Record<number, number>;
  voiceEnabled: boolean;
  soundEnabled: boolean;
  isFullscreen: boolean;
  actions: {
    play: () => void;
    pause: () => void;
    toggle: () => void;
    next: () => void;
    prev: () => void;
    seekToStep: (index: number) => void;
    tick: (deltaSeconds: number) => void;
    setSpeed: (speed: PlaybackSpeed) => void;
    setPendingInteraction: (interaction: PendingInteraction | null) => void;
    resolveInteraction: () => void;
    answerQuiz: (questionIndex: number, choiceIndex: number) => void;
    toggleVoice: () => void;
    toggleSound: () => void;
    toggleFullscreen: () => void;
  };
}

const SECONDS_PER_STEP = 1.6;

export function createLessonPlayerStore(lesson: Lesson) {
  return createStore<LessonPlayerState>((set, get) => ({
    lesson,
    stepIndex: 0,
    progressWithinStep: 0,
    isPlaying: false,
    speed: 1,
    pendingInteraction: null,
    quizAnswers: {},
    voiceEnabled: false,
    soundEnabled: false,
    isFullscreen: false,
    actions: {
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
      next: () =>
        set((s) => ({
          stepIndex: Math.min(s.stepIndex + 1, s.lesson.timeline.length - 1),
          progressWithinStep: 0,
        })),
      prev: () =>
        set((s) => ({
          stepIndex: Math.max(s.stepIndex - 1, 0),
          progressWithinStep: 0,
        })),
      seekToStep: (index) =>
        set((s) => ({
          stepIndex: Math.min(Math.max(index, 0), s.lesson.timeline.length - 1),
          progressWithinStep: 0,
        })),
      tick: (deltaSeconds) => {
        const s = get();
        if (!s.isPlaying || s.pendingInteraction) return;
        const advance = deltaSeconds * s.speed / SECONDS_PER_STEP;
        const nextProgress = s.progressWithinStep + advance;
        if (nextProgress >= 1) {
          const isLastStep = s.stepIndex >= s.lesson.timeline.length - 1;
          if (isLastStep) {
            set({ progressWithinStep: 1, isPlaying: false });
          } else {
            set({ stepIndex: s.stepIndex + 1, progressWithinStep: 0 });
          }
        } else {
          set({ progressWithinStep: nextProgress });
        }
      },
      setSpeed: (speed) => set({ speed }),
      setPendingInteraction: (interaction) => set({ pendingInteraction: interaction, isPlaying: interaction ? false : get().isPlaying }),
      resolveInteraction: () => set({ pendingInteraction: null }),
      answerQuiz: (questionIndex, choiceIndex) =>
        set((s) => ({ quizAnswers: { ...s.quizAnswers, [questionIndex]: choiceIndex } })),
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
    },
  }));
}

export type LessonPlayerStore = ReturnType<typeof createLessonPlayerStore>;
