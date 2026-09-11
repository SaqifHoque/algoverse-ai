import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CodeSubmissionForm } from "@/components/submission/CodeSubmissionForm";
import { IconButton } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/theme/ThemeProvider";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <IconButton onPress={() => router.push("/settings")}>⚙️</IconButton>
          <ThemeToggle />
        </View>

        <Text style={[styles.title, { color: theme.foreground }]}>
          Algo<Text style={{ color: theme.accent }}>Verse</Text> AI
        </Text>
        <Text style={[styles.subtitle, { color: theme.foregroundMuted }]}>
          Paste an algorithm. Watch it come alive as an interactive lesson -- powered entirely by
          a local AI model on your machine.
        </Text>

        <CodeSubmissionForm />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 8 },
});
