import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getHintColor, HINT_LABELS } from "@/lib/animation/hintMapping";
import { useTheme } from "@/theme/ThemeProvider";
import type { VisualizerProps } from "@/components/visualizers/types";

/** Fallback for "custom"/unrecognized algorithm shapes: renders whatever the real execution
 * trace contains (variables + call stack) generically. Mirrors the web app's
 * GenericVisualizer.tsx. */
export function GenericVisualizer({ currentStep }: VisualizerProps) {
  const { theme } = useTheme();
  const { memory_view, animation_hints } = currentStep;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12, padding: 4 }}>
      {animation_hints.length > 0 && (
        <View style={styles.hintRow}>
          {animation_hints.map((hint, i) => {
            const color = getHintColor(hint.kind, theme);
            return (
              <View key={i} style={[styles.hintPill, { backgroundColor: `${color}22` }]}>
                <Text style={{ fontSize: 11, color, fontWeight: "600" }}>
                  {HINT_LABELS[hint.kind]}: {hint.description}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.grid}>
        {memory_view.variables.map((variable) => (
          <View key={variable.name} style={[styles.card, { borderColor: theme.borderGlass, backgroundColor: theme.surfaceGlass }]}>
            <Text style={{ fontSize: 11, color: theme.foregroundFaint }}>{variable.name}</Text>
            <Text style={{ fontFamily: "monospace", fontWeight: "700", color: theme.foreground }} numberOfLines={1}>
              {JSON.stringify(variable.value)}
            </Text>
          </View>
        ))}
      </View>

      {memory_view.call_stack.length > 1 && (
        <Text style={{ fontSize: 11, color: theme.foregroundFaint }}>
          call stack: {memory_view.call_stack.join(" -> ")}
        </Text>
      )}

      <Text style={{ fontSize: 11, color: theme.foregroundFaint, textAlign: "center" }}>
        This code doesn&apos;t match a known visual metaphor, so it&apos;s shown generically.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hintRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  hintPill: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    minWidth: "30%",
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
});
