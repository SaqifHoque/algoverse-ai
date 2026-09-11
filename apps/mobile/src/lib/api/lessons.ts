import { apiFetch } from "@/lib/api/client";
import { FIXTURES, type FixtureKey } from "@/lib/fixtures";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Lesson } from "@/types/lesson";

function useFixtures(): boolean {
  const override = useSettingsStore.getState().useFixturesOverride;
  if (override !== null) return override;
  return process.env.EXPO_PUBLIC_USE_FIXTURES === "true";
}

export async function getLesson(lessonId: string): Promise<Lesson> {
  if (useFixtures()) {
    const fixture = FIXTURES[lessonId as FixtureKey];
    if (fixture) return fixture;
  }
  return apiFetch<Lesson>(`/lessons/${lessonId}`);
}
