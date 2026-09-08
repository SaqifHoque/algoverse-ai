import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export function GlassPanel({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: theme.radiusLg,
          borderColor: theme.borderGlass,
          backgroundColor: theme.surfaceGlass,
          ...theme.shadow,
        },
        style,
      ]}
    >
      <BlurView intensity={20} tint={theme.name} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    padding: 16,
  },
});
