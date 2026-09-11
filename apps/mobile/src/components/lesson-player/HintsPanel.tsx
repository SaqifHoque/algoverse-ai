import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useTheme } from "@/theme/ThemeProvider";
import type { Hint } from "@/types/lesson";

export function HintsPanel({ hints }: { hints: Hint[] }) {
  const { theme } = useTheme();
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const onRequestHints = hints.filter((h) => h.trigger === "on_request");
  if (onRequestHints.length === 0) return null;

  return (
    <GlassPanel>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: theme.foregroundMuted }}>
          Hints
        </Text>
        {onRequestHints.map((hint, index) =>
          revealed.has(index) ? (
            <Text key={index} style={{ fontSize: 13, color: theme.foregroundMuted }}>
              {hint.text}
            </Text>
          ) : (
            <Button key={index} variant="ghost" onPress={() => setRevealed(new Set(revealed).add(index))}>
              Reveal hint {index + 1}
            </Button>
          ),
        )}
      </View>
    </GlassPanel>
  );
}
