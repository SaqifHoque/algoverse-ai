import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";

import { AlgorithmPicker } from "@/components/submission/AlgorithmPicker";
import { DifficultySelector } from "@/components/submission/DifficultySelector";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { FIXTURE_SOURCE_CODE } from "@/lib/fixtures";
import { useSubmissionStore } from "@/stores/submissionStore";
import { useTheme } from "@/theme/ThemeProvider";
import type { AlgorithmName, Difficulty } from "@/types/lesson";

const MONO_FONT = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

export function CodeSubmissionForm() {
  const router = useRouter();
  const { theme } = useTheme();
  const submit = useSubmissionStore((s) => s.actions.submit);

  const [algorithmName, setAlgorithmName] = useState<AlgorithmName>("bubble_sort");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [sourceCode, setSourceCode] = useState(FIXTURE_SOURCE_CODE.bubble_sort.source_code);
  const [entrypoint, setEntrypoint] = useState(FIXTURE_SOURCE_CODE.bubble_sort.entrypoint);
  const [argsText, setArgsText] = useState(JSON.stringify(FIXTURE_SOURCE_CODE.bubble_sort.args));
  const [argsError, setArgsError] = useState<string | null>(null);

  function handleAlgorithmChange(next: AlgorithmName) {
    setAlgorithmName(next);
    const template = FIXTURE_SOURCE_CODE[next];
    setSourceCode(template.source_code);
    setEntrypoint(template.entrypoint);
    setArgsText(JSON.stringify(template.args));
    setArgsError(null);
  }

  async function handleSubmit() {
    let args: unknown[];
    try {
      args = JSON.parse(argsText);
      if (!Array.isArray(args)) throw new Error("must be a JSON array");
    } catch (err) {
      setArgsError(`Arguments must be a valid JSON array, e.g. [[5,3,1,4,2]] -- ${err instanceof Error ? err.message : err}`);
      return;
    }
    setArgsError(null);

    router.push("/submissions/pending");
    await submit({ sourceCode, entrypoint, algorithmName, args, difficulty });
  }

  return (
    <GlassPanel>
      <View style={{ gap: 16 }}>
        <AlgorithmPicker value={algorithmName} onChange={handleAlgorithmChange} />

        <View style={styles.rowBetween}>
          <Text style={[styles.label, { color: theme.foregroundMuted }]}>Your Python solution</Text>
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
        </View>

        <TextInput
          value={sourceCode}
          onChangeText={setSourceCode}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.codeInput,
            { fontFamily: MONO_FONT, color: theme.foreground, borderColor: theme.borderGlass },
          ]}
        />

        <Text style={[styles.hint, { color: theme.foregroundFaint }]}>
          Edited the code into something else? Update entrypoint/arguments below to match.
        </Text>

        <View style={{ gap: 8 }}>
          <View>
            <Text style={[styles.label, { color: theme.foregroundMuted }]}>Entrypoint function name</Text>
            <TextInput
              value={entrypoint}
              onChangeText={setEntrypoint}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.textInput, { fontFamily: MONO_FONT, color: theme.foreground, borderColor: theme.borderGlass }]}
            />
          </View>
          <View>
            <Text style={[styles.label, { color: theme.foregroundMuted }]}>Arguments (JSON array)</Text>
            <TextInput
              value={argsText}
              onChangeText={setArgsText}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.textInput, { fontFamily: MONO_FONT, color: theme.foreground, borderColor: theme.borderGlass }]}
            />
          </View>
        </View>

        {argsError && <Text style={{ color: theme.pop, fontSize: 12 }}>{argsError}</Text>}

        <Button onPress={handleSubmit}>Turn this into a lesson</Button>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", marginBottom: 4 },
  hint: { fontSize: 11 },
  codeInput: {
    minHeight: 180,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    textAlignVertical: "top",
  },
  textInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 13,
  },
});
