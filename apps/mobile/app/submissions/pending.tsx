import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useSubmissionStore } from "@/stores/submissionStore";
import { useTheme } from "@/theme/ThemeProvider";

const PHASES = ["Tracing execution...", "Analyzing patterns...", "Generating narration..."];

export default function SubmissionPendingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const status = useSubmissionStore((s) => s.status);
  const lessonId = useSubmissionStore((s) => s.lessonId);
  const error = useSubmissionStore((s) => s.error);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === "completed" && lessonId) {
      router.replace(`/lessons/${lessonId}`);
    }
  }, [status, lessonId, router]);

  useEffect(() => {
    if (status === "idle") {
      router.replace("/");
    }
  }, [status, router]);

  const phase = PHASES[Math.min(Math.floor(elapsed / 8), PHASES.length - 1)];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, justifyContent: "center" }}>
      <View style={styles.content}>
        <GlassPanel>
          <View style={{ alignItems: "center", gap: 12 }}>
            {status === "failed" ? (
              <>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.pop }}>Something went wrong</Text>
                <Text style={{ fontSize: 13, color: theme.foregroundMuted, textAlign: "center" }}>{error}</Text>
                <Button variant="ghost" onPress={() => router.replace("/")}>
                  Back to editor
                </Button>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color={theme.accent} />
                <Text style={{ fontWeight: "600", color: theme.foreground }}>{phase}</Text>
                <Text style={{ fontSize: 12, color: theme.foregroundFaint, textAlign: "center" }}>
                  This runs on a local model on your machine -- it can take up to ~30-60s. Keep
                  the app open while it generates.
                </Text>
                {elapsed > 20 && (
                  <Text style={{ fontSize: 12, color: theme.foregroundFaint }}>Still working, thanks for your patience...</Text>
                )}
              </>
            )}
          </View>
        </GlassPanel>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
});
