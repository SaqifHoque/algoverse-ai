import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ children, onPress, variant = "primary", disabled, loading, style }: ButtonProps) {
  const { theme } = useTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? theme.accent : "transparent",
          borderColor: isPrimary ? theme.accent : theme.borderGlass,
          opacity: pressed ? 0.8 : disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : theme.foreground} />
      ) : typeof children === "string" ? (
        <Text style={{ color: isPrimary ? "#fff" : theme.foreground, fontWeight: "600", fontSize: 14 }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function IconButton({
  children,
  onPress,
  onLongPress,
  active,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  active?: boolean;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.icon,
        {
          borderColor: theme.borderGlass,
          backgroundColor: active ? `${theme.accent}22` : "transparent",
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={{ fontSize: 16, color: active ? theme.accent : theme.foregroundMuted }}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
});
