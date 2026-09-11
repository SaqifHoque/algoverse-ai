import Slider from "@react-native-community/slider";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { IconButton } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useVoiceNarration } from "@/hooks/useVoiceNarration";
import { useLessonPlayerStore } from "@/stores/LessonPlayerContext";
import { useTheme } from "@/theme/ThemeProvider";
import type { PlaybackSpeed } from "@/stores/lessonPlayerStore";

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export function PlaybackControls() {
  const { theme } = useTheme();
  const isPlaying = useLessonPlayerStore((s) => s.isPlaying);
  const stepIndex = useLessonPlayerStore((s) => s.stepIndex);
  const timelineLength = useLessonPlayerStore((s) => s.lesson.timeline.length);
  const speed = useLessonPlayerStore((s) => s.speed);
  const isFocusMode = useLessonPlayerStore((s) => s.isFocusMode);
  const actions = useLessonPlayerStore((s) => s.actions);
  const voice = useVoiceNarration();
  const sound = useSoundEffects();
  const [speedModalOpen, setSpeedModalOpen] = useState(false);

  return (
    <GlassPanel>
      <View style={{ gap: 10 }}>
        <Slider
          minimumValue={0}
          maximumValue={Math.max(timelineLength - 1, 0)}
          step={1}
          value={stepIndex}
          onValueChange={(v) => actions.seekToStep(v)}
          minimumTrackTintColor={theme.accent}
          thumbTintColor={theme.accent}
        />
        <View style={styles.row}>
          <View style={styles.group}>
            <IconButton onPress={actions.prev}>⏮</IconButton>
            <IconButton onPress={actions.toggle}>{isPlaying ? "⏸" : "▶"}</IconButton>
            <IconButton onPress={actions.next}>⏭</IconButton>
            <IconButton onPress={() => actions.seekToStep(0)}>⟲</IconButton>
          </View>

          <Text style={{ fontSize: 11, color: theme.foregroundFaint }}>
            {stepIndex + 1} / {timelineLength}
          </Text>

          <View style={styles.group}>
            <IconButton onPress={() => setSpeedModalOpen(true)} onLongPress={() => setSpeedModalOpen(true)}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: theme.foreground }}>{speed}x</Text>
            </IconButton>
            <IconButton onPress={voice.toggle} active={voice.isEnabled}>
              🔊
            </IconButton>
            <IconButton onPress={sound.toggle} active={sound.isEnabled}>
              🔔
            </IconButton>
            <IconButton onPress={actions.toggleFocusMode} active={isFocusMode}>
              ⛶
            </IconButton>
          </View>
        </View>
      </View>

      <Modal visible={speedModalOpen} transparent animationType="fade" onRequestClose={() => setSpeedModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSpeedModalOpen(false)}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.borderGlass }]}>
            {SPEEDS.map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  actions.setSpeed(s);
                  setSpeedModalOpen(false);
                }}
                style={[styles.speedOption, s === speed && { backgroundColor: `${theme.accent}22` }]}
              >
                <Text style={{ color: theme.foreground, fontWeight: "600" }}>{s}x</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  group: { flexDirection: "row", gap: 6 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8,
    gap: 4,
    minWidth: 140,
  },
  speedOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
});
