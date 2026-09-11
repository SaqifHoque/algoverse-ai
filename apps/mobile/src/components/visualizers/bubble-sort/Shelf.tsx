import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { getHintColor } from "@/lib/animation/hintMapping";
import { useTheme } from "@/theme/ThemeProvider";
import type { AnimationHint } from "@/types/lesson";

// Fixed slot width + gap -- the horizontal distance between adjacent shelf slots. Used to
// compute the arc tween's start offset without a native layout-measurement round trip.
const SLOT_PITCH = 60;
const ARC_HEIGHT = 28;

/** The RN equivalent of the web app's GSAP-driven arc tween: a real scrub-seekable animation
 * driven by an external progress value (Reanimated shared value + interpolate), not a
 * fire-and-forget withTiming/withSpring. Architecturally the same shape as GSAP's
 * `.progress()` call -- just Reanimated's worklet/shared-value model instead of GSAP's
 * imperative DOM tweening. */
function useSwapArcStyle(progressWithinStep: number, deltaSlots: number) {
  const progress = useSharedValue(progressWithinStep);
  useEffect(() => {
    progress.value = progressWithinStep;
  }, [progressWithinStep, progress]);

  return useAnimatedStyle(() => {
    const x = interpolate(progress.value, [0, 1], [deltaSlots * SLOT_PITCH, 0]);
    const y = interpolate(progress.value, [0, 0.5, 1], [0, -ARC_HEIGHT, 0]);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
}

function ShelfItem({
  value,
  index,
  isCompare,
  isSwap,
  deltaSlots,
  progressWithinStep,
}: {
  value: number;
  index: number;
  isCompare: boolean;
  isSwap: boolean;
  deltaSlots: number;
  progressWithinStep: number;
}) {
  const { theme } = useTheme();
  const arcStyle = useSwapArcStyle(progressWithinStep, isSwap ? deltaSlots : 0);

  const borderColor = isSwap ? theme.swap : isCompare ? theme.compare : theme.borderGlass;
  const backgroundColor = isSwap ? `${theme.swap}22` : isCompare ? `${theme.compare}22` : theme.surfaceGlass;

  return (
    <Animated.View style={[styles.itemWrap, arcStyle]}>
      <View
        style={[
          styles.box,
          { height: 32 + value * 12, borderColor, backgroundColor, transform: [{ scale: isCompare && !isSwap ? 1.08 : 1 }] },
        ]}
      >
        <Text style={{ fontWeight: "700", color: theme.foreground }}>{value}</Text>
      </View>
      <Text style={{ fontSize: 10, color: theme.foregroundFaint }}>{index}</Text>
    </Animated.View>
  );
}

export function Shelf({
  items,
  hints,
  progressWithinStep,
}: {
  items: number[];
  hints: AnimationHint[];
  progressWithinStep: number;
}) {
  const compareIndices = new Set(hints.filter((h) => h.kind === "compare").flatMap((h) => h.target_indices));
  const swapHint = hints.find((h) => h.kind === "swap");
  const [swapI, swapJ] = swapHint?.target_indices ?? [];

  return (
    <View style={styles.row}>
      {items.map((value, index) => {
        const isSwap = index === swapI || index === swapJ;
        const deltaSlots = isSwap && swapI !== undefined && swapJ !== undefined ? (index === swapI ? swapJ - swapI : swapI - swapJ) : 0;
        return (
          <ShelfItem
            key={index}
            value={value}
            index={index}
            isCompare={compareIndices.has(index)}
            isSwap={isSwap}
            deltaSlots={deltaSlots}
            progressWithinStep={progressWithinStep}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    flex: 1,
    paddingBottom: 24,
  },
  itemWrap: { alignItems: "center", gap: 4 },
  box: {
    width: 44,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
