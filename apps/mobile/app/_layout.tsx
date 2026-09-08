import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useTheme } from "@/theme/ThemeProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";

function ThemedStack() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.foreground,
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: "AlgoVerse AI" }} />
      <Stack.Screen name="submissions/pending" options={{ title: "Generating...", headerBackVisible: false }} />
      <Stack.Screen name="lessons/[lessonId]" options={{ title: "Lesson" }} />
      <Stack.Screen name="settings" options={{ title: "Settings", presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemedStack />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
