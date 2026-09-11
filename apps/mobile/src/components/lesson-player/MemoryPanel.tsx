import { StyleSheet, Text, View } from "react-native";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { useTheme } from "@/theme/ThemeProvider";
import type { MemoryView } from "@/types/lesson";

export function MemoryPanel({ memoryView }: { memoryView: MemoryView }) {
  const { theme } = useTheme();
  return (
    <GlassPanel>
      <View style={{ gap: 10 }}>
        <Text style={[styles.heading, { color: theme.foregroundMuted }]}>Variables</Text>
        <View style={{ gap: 4 }}>
          {memoryView.variables.map((variable) => (
            <View key={variable.name} style={[styles.row, { backgroundColor: `${theme.accent}0d` }]}>
              <Text style={{ fontFamily: "monospace", color: theme.foregroundMuted, fontSize: 13 }}>
                {variable.name}
              </Text>
              <Text style={{ fontFamily: "monospace", color: theme.foreground, fontWeight: "600", fontSize: 13 }}>
                {JSON.stringify(variable.value)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.heading, { color: theme.foregroundMuted, marginTop: 4 }]}>Call stack</Text>
        <View style={{ gap: 4 }}>
          {memoryView.call_stack.map((frame, idx) => (
            <View
              key={idx}
              style={[
                styles.frame,
                { borderColor: theme.borderGlass, backgroundColor: `${theme.accent}0d`, marginLeft: idx * 10 },
              ]}
            >
              <Text style={{ fontFamily: "monospace", fontSize: 11, color: theme.foreground }}>{frame}</Text>
            </View>
          ))}
        </View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  frame: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
});
