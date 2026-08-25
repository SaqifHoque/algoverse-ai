import { clsx } from "clsx";

import { GlassPanel } from "@/components/ui/GlassPanel";

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
  const lines = sourceCode.split("\n");
  const highlighted = new Set(highlightedLines);

  return (
    <GlassPanel className="overflow-x-auto p-4">
      <pre className="font-mono text-sm leading-6">
        {lines.map((line, idx) => {
          const lineNo = idx + 1;
          const isActive = lineNo === currentLine || highlighted.has(lineNo);
          return (
            <div
              key={lineNo}
              className={clsx(
                "flex gap-4 rounded px-2 transition-colors duration-300",
                isActive && "bg-accent/15",
              )}
            >
              <span className="w-6 shrink-0 select-none text-right text-foreground/40">{lineNo}</span>
              <span>
                {tokenizeLine(line).map((tok, i) => (
                  <span
                    key={i}
                    className={clsx(
                      tok.kind === "keyword" && "text-accent-2 font-semibold",
                      tok.kind === "number" && "text-accent",
                    )}
                  >
                    {tok.text}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </pre>
    </GlassPanel>
  );
}
