import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import type { AlgorithmName } from "@/types/lesson";

const ALGORITHMS: { key: AlgorithmName; label: string; emoji: string }[] = [
  { key: "bubble_sort", label: "Bubble Sort", emoji: "🫧" },
  { key: "binary_search", label: "Binary Search", emoji: "📖" },
  { key: "fibonacci_recursive", label: "Fibonacci", emoji: "🪞" },
  { key: "custom", label: "Custom", emoji: "🧩" },
];

export function AlgorithmPicker({
  value,
  onChange,
}: {
  value: AlgorithmName;
  onChange: (value: AlgorithmName) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {ALGORITHMS.map((algo) => {
        const selected = algo.key === value;
        return (
          <Pressable
            key={algo.key}
            onPress={() => onChange(algo.key)}
            style={[
              styles.card,
              {
                borderColor: selected ? theme.accent : theme.borderGlass,
                backgroundColor: selected ? `${theme.accent}18` : "transparent",
              },
            ]}
          >
            <Text style={{ fontSize: 22 }}>{algo.emoji}</Text>
            <Text style={{ fontSize: 12, fontWeight: "600", color: theme.foreground, marginTop: 4 }}>
              {algo.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    flexGrow: 1,
    flexBasis: "45%",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
