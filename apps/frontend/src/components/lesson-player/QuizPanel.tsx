"use client";

import { clsx } from "clsx";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";
import type { QuizQuestion } from "@/types/lesson";

function QuizItem({ question, index }: { question: QuizQuestion; index: number }) {
  const answer = useLessonPlayerStore((s) => s.quizAnswers[index]);
  const answerQuiz = useLessonPlayerStore((s) => s.actions.answerQuiz);
  const answered = answer !== undefined;

  return (
    <div className="space-y-2">
      <p className="font-medium">{question.question}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {question.choices.map((choice, choiceIndex) => {
          const isCorrect = choiceIndex === question.correct_index;
          const isSelected = answer === choiceIndex;
          return (
            <button
              key={choiceIndex}
              onClick={() => !answered && answerQuiz(index, choiceIndex)}
              disabled={answered}
              className={clsx(
                "rounded-xl border border-border-glass px-3 py-2 text-left text-sm transition-colors",
                !answered && "hover:bg-accent/10",
                answered && isCorrect && "border-emerald-400 bg-emerald-400/10",
                answered && isSelected && !isCorrect && "border-red-400 bg-red-400/10",
              )}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {answered && <p className="text-sm text-foreground/60">{question.explanation}</p>}
    </div>
  );
}

export function QuizPanel({ quiz }: { quiz: QuizQuestion[] }) {
  if (quiz.length === 0) return null;
  return (
    <GlassPanel className="space-y-4 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Quiz</h3>
      {quiz.map((question, index) => (
        <QuizItem key={index} question={question} index={index} />
      ))}
    </GlassPanel>
  );
}
