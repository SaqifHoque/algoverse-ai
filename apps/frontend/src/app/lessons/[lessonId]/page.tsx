import { notFound } from "next/navigation";

import { LessonPlayer } from "@/components/lesson-player/LessonPlayer";
import { getLesson } from "@/lib/api/lessons";

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const lesson = await getLesson(params.lessonId).catch(() => null);
  if (!lesson) notFound();

  return <LessonPlayer lesson={lesson} sourceCode={lesson.source_code} />;
}
