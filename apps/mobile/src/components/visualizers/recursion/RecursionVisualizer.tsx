import { Text, View } from "react-native";

import { MirrorFrames } from "@/components/visualizers/recursion/MirrorFrames";
import { reconstructCallStack } from "@/components/visualizers/recursion/reconstructCallStack";
import type { VisualizerProps } from "@/components/visualizers/types";
import { useTheme } from "@/theme/ThemeProvider";

export function RecursionVisualizer({ allSteps, stepIndex }: VisualizerProps) {
  const { theme } = useTheme();
  const frames = reconstructCallStack(allSteps, stepIndex);

  return (
    <View style={{ flex: 1 }}>
      <MirrorFrames frames={frames} />
      <Text style={{ fontSize: 11, color: theme.foregroundFaint, textAlign: "center", paddingBottom: 8 }}>
        Each call is a smaller mirror nested inside the last.
      </Text>
    </View>
  );
}
