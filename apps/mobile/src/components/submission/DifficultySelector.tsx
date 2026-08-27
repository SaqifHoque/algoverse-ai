import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import type { Difficulty } from "@/types/lesson";

const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced"];

export function DifficultySelector({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { borderColor: theme.borderGlass }]}>
      {LEVELS.map((level) => {
        const selected = level === value;
        return (
          <Pressable
            key={level}
            onPress={() => onChange(level)}
            style={[styles.pill, { backgroundColor: selected ? theme.accent : "transparent" }]}
          >
            <Text style={{ fontSize: 12, color: selected ? "#fff" : theme.foregroundMuted, textTransform: "capitalize" }}>
              {level}
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
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
