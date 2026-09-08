import { Pressable, Text, View } from "react-native";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";
import { useTheme } from "@/theme/ThemeProvider";
import type { QuizQuestion } from "@/types/lesson";

function QuizItem({ question, index }: { question: QuizQuestion; index: number }) {
  const { theme } = useTheme();
  const answer = useLessonPlayerStore((s) => s.quizAnswers[index]);
  const answerQuiz = useLessonPlayerStore((s) => s.actions.answerQuiz);
  const answered = answer !== undefined;

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontWeight: "600", color: theme.foreground }}>{question.question}</Text>
      <View style={{ gap: 6 }}>
        {question.choices.map((choice, choiceIndex) => {
          const isCorrect = choiceIndex === question.correct_index;
          const isSelected = answer === choiceIndex;
          let borderColor = theme.borderGlass;
          let backgroundColor = "transparent";
          if (answered && isCorrect) {
            borderColor = theme.push;
            backgroundColor = `${theme.push}22`;
          } else if (answered && isSelected) {
            borderColor = theme.pop;
            backgroundColor = `${theme.pop}22`;
          }
          return (
            <Pressable
              key={choiceIndex}
              disabled={answered}
              onPress={() => answerQuiz(index, choiceIndex)}
              style={{ borderWidth: 1, borderColor, backgroundColor, borderRadius: 10, padding: 10 }}
            >
              <Text style={{ color: theme.foreground, fontSize: 13 }}>{choice}</Text>
            </Pressable>
          );
        })}
      </View>
      {answered && <Text style={{ fontSize: 12, color: theme.foregroundMuted }}>{question.explanation}</Text>}
    </View>
  );
}

export function QuizPanel({ quiz }: { quiz: QuizQuestion[] }) {
  const { theme } = useTheme();
  if (quiz.length === 0) return null;
  return (
    <GlassPanel>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: theme.foregroundMuted }}>
          Quiz
        </Text>
        {quiz.map((q, i) => (
          <QuizItem key={i} question={q} index={i} />
        ))}
      </View>
    </GlassPanel>
  );
}
