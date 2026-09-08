import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CodePanel } from "@/components/lesson-player/CodePanel";
import { HintsPanel } from "@/components/lesson-player/HintsPanel";
import { MemoryPanel } from "@/components/lesson-player/MemoryPanel";
import { NarrationPanel } from "@/components/lesson-player/NarrationPanel";
import { PlaybackControls } from "@/components/lesson-player/PlaybackControls";
import { QuizPanel } from "@/components/lesson-player/QuizPanel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { VisualizerStage } from "@/components/visualizers/VisualizerStage";
import { useLessonPlayback } from "@/hooks/useLessonPlayback";
import { LessonPlayerProvider, useLessonPlayerStore } from "@/stores/LessonPlayerContext";
import { useTheme } from "@/theme/ThemeProvider";
import type { Lesson } from "@/types/lesson";

function LessonPlayerInner() {
  useLessonPlayback();
  const { theme } = useTheme();
  const lesson = useLessonPlayerStore((s) => s.lesson);
  const stepIndex = useLessonPlayerStore((s) => s.stepIndex);
  const isFocusMode = useLessonPlayerStore((s) => s.isFocusMode);
  const currentStep = lesson.timeline[stepIndex]!;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {!isFocusMode && (
          <View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: theme.foreground }}>{lesson.title}</Text>
            <Text style={{ fontSize: 12, color: theme.foregroundMuted }}>
              {lesson.algorithm_name} · {lesson.difficulty} · {lesson.complexity_overall}
            </Text>
          </View>
        )}

        <VisualizerStage />
        <PlaybackControls />
        <NarrationPanel step={currentStep} />

        {!isFocusMode && (
          <>
            <CodePanel
              sourceCode={lesson.source_code}
              currentLine={currentStep.current_line}
              highlightedLines={currentStep.highlighted_lines}
            />
            <MemoryPanel memoryView={currentStep.memory_view} />
            <HintsPanel hints={lesson.hints} />
            <QuizPanel quiz={lesson.quiz} />

            <GlassPanel>
              <View style={{ gap: 10 }}>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: theme.foregroundMuted }}>
                    The story
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.foregroundMuted }}>{lesson.story}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: theme.foregroundMuted }}>
                    Summary
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.foregroundMuted }}>{lesson.summary}</Text>
                </View>
              </View>
            </GlassPanel>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  return (
    <LessonPlayerProvider lesson={lesson}>
      <LessonPlayerInner />
    </LessonPlayerProvider>
  );
}
