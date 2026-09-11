import { Text, View } from "react-native";

import { DictionaryPage } from "@/components/visualizers/binary-search/DictionaryPage";
import type { VisualizerProps } from "@/components/visualizers/types";
import { useTheme } from "@/theme/ThemeProvider";

function findVar(step: VisualizerProps["currentStep"], name: string): unknown {
  return step.memory_view.variables.find((v) => v.name === name)?.value;
}

export function BinarySearchVisualizer({ currentStep }: VisualizerProps) {
  const { theme } = useTheme();
  const items = Array.isArray(findVar(currentStep, "items")) ? (findVar(currentStep, "items") as number[]) : [];
  const low = findVar(currentStep, "low") as number | undefined;
  const high = findVar(currentStep, "high") as number | undefined;
  const mid = findVar(currentStep, "mid") as number | undefined;
  const target = findVar(currentStep, "target") as number | undefined;

  return (
    <View style={{ flex: 1 }}>
      <DictionaryPage items={items} low={low} high={high} mid={mid} target={target} />
      <Text style={{ fontSize: 11, color: theme.foregroundFaint, textAlign: "center", paddingBottom: 8 }}>
        Like flipping to the middle of a dictionary and narrowing which half to check next.
      </Text>
    </View>
  );
}
