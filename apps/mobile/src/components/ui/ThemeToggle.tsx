import { IconButton } from "@/components/ui/Button";
import { useTheme } from "@/theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <IconButton onPress={toggle}>{theme.name === "dark" ? "🌙" : "☀️"}</IconButton>;
}
