import { apiFetch } from "@/lib/api/client";
import { FIXTURES, type FixtureKey } from "@/lib/fixtures";
import type { Lesson } from "@/types/lesson";

const USE_FIXTURES = process.env.NEXT_PUBLIC_USE_FIXTURES === "true";

export async function getLesson(lessonId: string): Promise<Lesson> {
  if (USE_FIXTURES) {
    const fixture = FIXTURES[lessonId as FixtureKey];
    if (fixture) return fixture;
  }
  return apiFetch<Lesson>(`/lessons/${lessonId}`);
}
