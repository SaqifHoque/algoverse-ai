import { useEffect } from "react";
import { Text, View } from "react-native";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { useVoiceNarration } from "@/hooks/useVoiceNarration";
import { useTheme } from "@/theme/ThemeProvider";
import type { LessonStep } from "@/types/lesson";

export function NarrationPanel({ step }: { step: LessonStep }) {
  const { theme } = useTheme();
  const voice = useVoiceNarration();

  useEffect(() => {
    if (voice.isEnabled) {
      voice.speak(step.narration, { stepIndex: step.step_index });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.step_index, voice.isEnabled]);

  return (
    <GlassPanel>
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: theme.foreground }}>{step.narration}</Text>
        {step.why_this_happens ? (
          <Text style={{ fontSize: 13, color: theme.foregroundMuted }}>{step.why_this_happens}</Text>
        ) : null}
        {step.complexity_note ? (
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: `${theme.accent}1a`,
              borderRadius: 999,
              paddingVertical: 4,
              paddingHorizontal: 10,
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: theme.accent }}>{step.complexity_note}</Text>
          </View>
        ) : null}
      </View>
    </GlassPanel>
  );
}
