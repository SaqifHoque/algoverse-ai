"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { IconButton } from "@/components/ui/Button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <IconButton aria-label="Toggle theme" />;

  return (
    <IconButton
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? "🌙" : "☀️"}
    </IconButton>
  );
}
