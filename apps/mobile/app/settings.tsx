import { useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { apiFetch, resolveBaseUrl } from "@/lib/api/client";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTheme } from "@/theme/ThemeProvider";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const backendBaseUrl = useSettingsStore((s) => s.backendBaseUrl);
  const useFixturesOverride = useSettingsStore((s) => s.useFixturesOverride);
  const actions = useSettingsStore((s) => s.actions);

  const [urlInput, setUrlInput] = useState(backendBaseUrl);
  const [testResult, setTestResult] = useState<"idle" | "testing" | "ok" | "failed">("idle");
  const [testDetail, setTestDetail] = useState<string | null>(null);

  async function handleTestConnection() {
    actions.setBackendBaseUrl(urlInput);
    setTestResult("testing");
    setTestDetail(null);
    try {
      const health = await apiFetch<{ status: string }>("/health");
      setTestResult(health.status === "ok" ? "ok" : "failed");
    } catch (err) {
      setTestResult("failed");
      setTestDetail(err instanceof Error ? err.message : String(err));
    }
  }

  let effectiveUrl = "not configured -- physical devices need this set explicitly";
  try {
    effectiveUrl = resolveBaseUrl();
  } catch {
    // NoBackendUrlConfiguredError -- keep the placeholder message above
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      <View style={styles.content}>
        <GlassPanel>
          <View style={{ gap: 12 }}>
            <Text style={[styles.label, { color: theme.foregroundMuted }]}>Backend URL</Text>
            <Text style={{ fontSize: 12, color: theme.foregroundFaint }}>
              A phone can&apos;t reach your computer via &quot;localhost&quot; -- use your
              computer&apos;s LAN IP instead, e.g. http://192.168.x.x:8000/api/v1. Currently
              effective: {effectiveUrl}
            </Text>
            <TextInput
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="http://192.168.1.23:8000/api/v1"
              placeholderTextColor={theme.foregroundFaint}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { color: theme.foreground, borderColor: theme.borderGlass }]}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button variant="ghost" onPress={() => { setUrlInput(""); actions.resetToDefault(); }} style={{ flex: 1 }}>
                Reset
              </Button>
              <Button onPress={handleTestConnection} loading={testResult === "testing"} style={{ flex: 1 }}>
                Test connection
              </Button>
            </View>
            {testResult === "ok" && <Text style={{ color: theme.push, fontSize: 12 }}>Connected successfully.</Text>}
            {testResult === "failed" && (
              <Text style={{ color: theme.pop, fontSize: 12 }}>Could not reach backend. {testDetail}</Text>
            )}
          </View>
        </GlassPanel>

        <GlassPanel>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.label, { color: theme.foregroundMuted }]}>Use fixture mode</Text>
              <Text style={{ fontSize: 12, color: theme.foregroundFaint }}>
                Render the 3 captured demo lessons without a live backend.
              </Text>
            </View>
            <Switch
              value={useFixturesOverride ?? process.env.EXPO_PUBLIC_USE_FIXTURES === "true"}
              onValueChange={(v) => actions.setUseFixturesOverride(v)}
            />
          </View>
        </GlassPanel>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
});
