import { Text, View } from "react-native";

import { Shelf } from "@/components/visualizers/bubble-sort/Shelf";
import type { VisualizerProps } from "@/components/visualizers/types";
import { useTheme } from "@/theme/ThemeProvider";

export function BubbleSortVisualizer({ currentStep, progressWithinStep }: VisualizerProps) {
  const { theme } = useTheme();
  const itemsVar = currentStep.memory_view.variables.find((v) => v.name === "items");
  const items = Array.isArray(itemsVar?.value) ? (itemsVar!.value as number[]) : [];

  return (
    <View style={{ flex: 1 }}>
      <Shelf items={items} hints={currentStep.animation_hints} progressWithinStep={progressWithinStep} />
      <Text style={{ fontSize: 11, color: theme.foregroundFaint, textAlign: "center", paddingBottom: 8 }}>
        Objects on a shelf -- taller boxes are bigger numbers.
      </Text>
    </View>
  );
}
