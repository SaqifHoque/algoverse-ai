"use client";

import { clsx } from "clsx";
import { useEffect, useRef } from "react";

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

export function QuizPanel({ quiz, onComplete }: { quiz: QuizQuestion[]; onComplete: (score: number) => void }) {
  const answers = useLessonPlayerStore((s) => s.quizAnswers);
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current || quiz.length === 0 || Object.keys(answers).length < quiz.length) return;
    const correct = quiz.filter((question, index) => answers[index] === question.correct_index).length;
    reported.current = true;
    onComplete(Math.round((correct / quiz.length) * 100));
  }, [answers, onComplete, quiz]);

  if (quiz.length === 0) {
    return (
      <GlassPanel className="flex items-center justify-between gap-4 p-4">
        <div>
          <h3 className="font-medium">Lesson complete?</h3>
          <p className="text-sm text-foreground/60">Record your progress and collect the lesson XP.</p>
        </div>
        <button
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            if (!reported.current) {
              reported.current = true;
              onComplete(0);
            }
          }}
        >
          Complete lesson
        </button>
      </GlassPanel>
    );
  }
  return (
    <GlassPanel className="space-y-4 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Quiz</h3>
      {quiz.map((question, index) => (
        <QuizItem key={index} question={question} index={index} />
      ))}
    </GlassPanel>
  );
}
