"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";

import { createLessonPlayerStore, type LessonPlayerState, type LessonPlayerStore } from "@/stores/lessonPlayerStore";
import type { Lesson } from "@/types/lesson";

const LessonPlayerStoreContext = createContext<LessonPlayerStore | null>(null);

export function LessonPlayerProvider({ lesson, children }: { lesson: Lesson; children: ReactNode }) {
  const storeRef = useRef<LessonPlayerStore>();
  if (!storeRef.current) {
    storeRef.current = createLessonPlayerStore(lesson);
  }
  return <LessonPlayerStoreContext.Provider value={storeRef.current}>{children}</LessonPlayerStoreContext.Provider>;
}

export function useLessonPlayerStore<T>(selector: (state: LessonPlayerState) => T): T {
  const store = useContext(LessonPlayerStoreContext);
  if (!store) throw new Error("useLessonPlayerStore must be used within a LessonPlayerProvider");
  return useStore(store, selector);
}
