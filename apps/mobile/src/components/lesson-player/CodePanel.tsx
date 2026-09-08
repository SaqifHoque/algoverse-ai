import { Platform, StyleSheet, Text, View } from "react-native";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { useTheme } from "@/theme/ThemeProvider";

const MONO_FONT = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

const PY_KEYWORDS = new Set([
  "def", "return", "if", "elif", "else", "while", "for", "in", "break", "continue",
  "import", "from", "as", "not", "and", "or", "is", "None", "True", "False", "lambda",
]);

function tokenizeLine(line: string): { text: string; kind: "keyword" | "number" | "plain" }[] {
  const tokens: { text: string; kind: "keyword" | "number" | "plain" }[] = [];
  const parts = line.split(/(\s+|[()[\]{}:,+\-*/%<>=]+)/);
  for (const part of parts) {
    if (!part) continue;
    if (PY_KEYWORDS.has(part)) tokens.push({ text: part, kind: "keyword" });
    else if (/^\d+$/.test(part)) tokens.push({ text: part, kind: "number" });
    else tokens.push({ text: part, kind: "plain" });
  }
  return tokens;
}

export function CodePanel({
  sourceCode,
  currentLine,
  highlightedLines,
}: {
  sourceCode: string;
  currentLine: number;
  highlightedLines: number[];
}) {
  const { theme } = useTheme();
  const lines = sourceCode.split("\n");
  const highlighted = new Set(highlightedLines);

  return (
    <GlassPanel>
      <View>
        {lines.map((line, idx) => {
          const lineNo = idx + 1;
          const isActive = lineNo === currentLine || highlighted.has(lineNo);
          return (
            <View
              key={lineNo}
              style={[styles.line, isActive && { backgroundColor: `${theme.accent}22` }]}
            >
              <Text style={[styles.lineNo, { color: theme.foregroundFaint }]}>{lineNo}</Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 13 }}>
                {tokenizeLine(line).map((tok, i) => (
                  <Text
                    key={i}
                    style={{
                      color:
                        tok.kind === "keyword" ? theme.accent2 : tok.kind === "number" ? theme.accent : theme.foreground,
                      fontWeight: tok.kind === "keyword" ? "700" : "400",
                    }}
                  >
                    {tok.text}
                  </Text>
                ))}
              </Text>
            </View>
          );
        })}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  lineNo: {
    width: 20,
    textAlign: "right",
    fontSize: 12,
  },
});
