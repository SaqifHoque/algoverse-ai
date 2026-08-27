import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LessonPlayer } from "@/components/lesson-player/LessonPlayer";
import { getLesson } from "@/lib/api/lessons";
import { useTheme } from "@/theme/ThemeProvider";
import type { Lesson } from "@/types/lesson";

// expo-router has no server-component equivalent to the web app's async page function --
// fetching happens in a client-side effect instead, with its own loading/error state.
export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { theme } = useTheme();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLesson(lessonId)
      .then((l) => {
        if (!cancelled) setLesson(l);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ color: theme.pop, fontWeight: "700", marginBottom: 8 }}>Couldn&apos;t load this lesson</Text>
        <Text style={{ color: theme.foregroundMuted, fontSize: 13, textAlign: "center" }}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return <LessonPlayer lesson={lesson} />;
}
