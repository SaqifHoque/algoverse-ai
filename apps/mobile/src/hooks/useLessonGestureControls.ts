import { useMemo } from "react";
import { Directions, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";

/** Touch replacement for the web app's useLessonKeyboardControls: tap the visualizer to
 * play/pause, swipe left/right to step forward/back.
 *
 * Gesture Handler's FlingGestureHandlerEventPayload carries no `direction` field -- a single
 * Fling gesture only reports x/y/absoluteX/absoluteY, never which configured direction
 * actually fired. So detecting left vs. right requires two separate Fling recognizers, one
 * configured per direction, distinguished by which one's onEnd callback runs -- not one Fling
 * gesture with a direction check inside the callback (confirmed against the installed
 * react-native-gesture-handler source, not assumed).
 *
 * Composed with Gesture.Exclusive so a swipe on the visualizer doesn't also register as a tap,
 * and so it doesn't fight the timeline scrubber's own drag gesture when both are mounted in
 * the same screen. */
export function useLessonGestureControls() {
  const actions = useLessonPlayerStore((s) => s.actions);

  return useMemo(() => {
    const swipeLeft = Gesture.Fling()
      .direction(Directions.LEFT)
      .onEnd(() => {
        runOnJS(actions.next)();
      });

    const swipeRight = Gesture.Fling()
      .direction(Directions.RIGHT)
      .onEnd(() => {
        runOnJS(actions.prev)();
      });

    const tap = Gesture.Tap().onEnd(() => {
      runOnJS(actions.toggle)();
    });

    return Gesture.Exclusive(Gesture.Race(swipeLeft, swipeRight), tap);
  }, [actions]);
}
