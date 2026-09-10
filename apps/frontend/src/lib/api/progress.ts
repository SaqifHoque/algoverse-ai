import { apiFetch } from "@/lib/api/client";
import type { Difficulty, ProgressSummary } from "@/types/lesson";

const PLAYER_ID_KEY = "algoverse.player-id";
const FIXTURE_PROGRESS_KEY = "algoverse.fixture-progress";
const USE_FIXTURES = process.env.NEXT_PUBLIC_USE_FIXTURES === "true";

interface StoredLessonProgress {
  score: number;
  difficulty: Difficulty;
  completed_at: string;
}

function playerId(): string {
  const existing = window.localStorage.getItem(PLAYER_ID_KEY);
  if (existing) return existing;
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(PLAYER_ID_KEY, created);
  return created;
}

function localFixtureSummary(
  userId: string,
  lessonId: string,
  score: number,
  difficulty: Difficulty,
): ProgressSummary {
  const stored = JSON.parse(
    window.localStorage.getItem(FIXTURE_PROGRESS_KEY) ?? "{}",
  ) as Record<string, StoredLessonProgress>;
  const previous = stored[lessonId];
  stored[lessonId] = {
    score: Math.max(previous?.score ?? 0, score),
    difficulty,
    completed_at: previous?.completed_at ?? new Date().toISOString(),
  };
  window.localStorage.setItem(FIXTURE_PROGRESS_KEY, JSON.stringify(stored));

  const baseXp: Record<Difficulty, number> = { beginner: 50, intermediate: 75, advanced: 100 };
  const lessons = Object.entries(stored).map(([id, item]) => ({
    lesson_id: id,
    completed_at: item.completed_at,
    score: item.score,
    xp: baseXp[item.difficulty] + item.score,
  }));
  const totalXp = lessons.reduce((total, lesson) => total + lesson.xp, 0);
  const scores = lessons.map((lesson) => lesson.score);
  const badges = [
    ...(lessons.length > 0
      ? [{ id: "first_steps", name: "First Steps", description: "Complete your first lesson." }]
      : []),
    ...(scores.some((value) => value === 100)
      ? [{ id: "perfect_score", name: "Perfect Score", description: "Earn 100% on a lesson quiz." }]
      : []),
    ...(lessons.length >= 5
      ? [{ id: "dedicated_learner", name: "Dedicated Learner", description: "Complete five lessons." }]
      : []),
    ...(totalXp >= 1_000
      ? [{ id: "xp_explorer", name: "XP Explorer", description: "Earn 1,000 XP." }]
      : []),
  ];

  return {
    user_id: userId,
    total_xp: totalXp,
    level: Math.floor(totalXp / 250) + 1,
    completed_lessons: lessons.length,
    badges,
    lessons,
  };
}

export async function completeLesson(
  lessonId: string,
  score: number,
  difficulty: Difficulty,
): Promise<ProgressSummary> {
  const userId = playerId();
  if (USE_FIXTURES) return localFixtureSummary(userId, lessonId, score, difficulty);
  return apiFetch<ProgressSummary>(`/progress/lessons/${lessonId}/complete`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, score }),
  });
}
