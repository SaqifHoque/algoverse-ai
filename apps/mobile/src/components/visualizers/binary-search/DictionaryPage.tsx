import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { useTheme } from "@/theme/ThemeProvider";
import type { Theme } from "@/theme/tokens";

function Chip({
  value,
  index,
  inRange,
  isMid,
  theme,
}: {
  value: number;
  index: number;
  inRange: boolean;
  isMid: boolean;
  theme: Theme;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: withTiming(inRange ? 1 : 0.3, { duration: 250 }),
    transform: [{ scale: withTiming(isMid ? 1.15 : 1, { duration: 250 }) }],
  }));

  return (
    <Animated.View
      style={[
        styles.chip,
        style,
        { borderColor: isMid ? theme.accent : theme.borderGlass, backgroundColor: isMid ? `${theme.accent}22` : theme.surfaceGlass },
      ]}
    >
      {isMid && <Text style={[styles.midLabel, { color: theme.accent }]}>mid</Text>}
      <Text style={{ fontWeight: "700", color: theme.foreground }}>{value}</Text>
      <Text style={{ fontSize: 9, color: theme.foregroundFaint }}>{index}</Text>
    </Animated.View>
  );
}

export function DictionaryPage({
  items,
  low,
  high,
  mid,
  target,
}: {
  items: number[];
  low: number | undefined;
  high: number | undefined;
  mid: number | undefined;
  target: number | undefined;
}) {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Text style={{ fontSize: 13, color: theme.foregroundMuted }}>
        Looking for <Text style={{ fontWeight: "700", color: theme.accent }}>{target}</Text>
      </Text>
      <View style={styles.grid}>
        {items.map((value, index) => (
          <Chip
            key={index}
            value={value}
            index={index}
            inRange={low !== undefined && high !== undefined && index >= low && index <= high}
            isMid={index === mid}
            theme={theme}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Text style={{ fontSize: 11, color: theme.foregroundFaint }}>low = {low ?? "-"}</Text>
        <Text style={{ fontSize: 11, color: theme.foregroundFaint }}>high = {high ?? "-"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  chip: {
    width: 44,
    paddingVertical: 10,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
  },
  midLabel: { position: "absolute", top: -16, fontSize: 10, fontWeight: "700" },
});
