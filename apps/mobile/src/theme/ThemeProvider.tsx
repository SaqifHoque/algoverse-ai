import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { darkTheme, lightTheme, type Theme } from "@/theme/tokens";

type ThemeOverride = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  override: ThemeOverride;
  setOverride: (value: ThemeOverride) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<ThemeOverride>("system");

  const resolvedName = override === "system" ? (systemScheme ?? "light") : override;
  const theme = resolvedName === "dark" ? darkTheme : lightTheme;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      override,
      setOverride,
      toggle: () => setOverride(resolvedName === "dark" ? "light" : "dark"),
    }),
    [theme, override, resolvedName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
