import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";

import type { CallFrame } from "@/components/visualizers/recursion/reconstructCallStack";
import { useTheme } from "@/theme/ThemeProvider";
import type { Theme } from "@/theme/tokens";

/** RN has no maintained React Flow port, and pulling in a general graph-layout engine isn't
 * justified for 3 fixture algorithms -- this renders each call frame as a card nested inside
 * its parent's, using Reanimated layout animations (entering/exiting/layout) as frames
 * push/pop. Arguably fits the "nested mirrors" metaphor more literally than a node graph would
 * on a narrow phone width. Driven by the same reconstructCallStack() as the web version. */
export function MirrorFrames({ frames }: { frames: CallFrame[] }) {
  const { theme } = useTheme();

  const nested = frames.reduceRight<ReactNode>((inner, frame) => {
    return (
      <Animated.View
        key={frame.depth}
        entering={FadeInDown.duration(220)}
        exiting={FadeOutUp.duration(180)}
        layout={LinearTransition}
        style={[styles.frame, { borderColor: theme.accent, backgroundColor: `${theme.accent}12` }]}
      >
        <Text style={{ fontSize: 11, fontFamily: "monospace", color: theme.foreground }}>
          fibonacci_recursive(n={String(frame.n)})
        </Text>
        {inner}
      </Animated.View>
    );
  }, null);

  if (frames.length === 0) {
    return <EmptyState theme={theme} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={{ flex: 1 }}>
      {nested}
    </ScrollView>
  );
}

function EmptyState({ theme }: { theme: Theme }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: theme.foregroundFaint, fontSize: 12 }}>No active call frames at this step.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 12, flexGrow: 1 },
  frame: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
});
