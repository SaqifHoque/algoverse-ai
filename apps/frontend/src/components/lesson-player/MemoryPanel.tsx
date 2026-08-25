import { motion } from "framer-motion";

import { GlassPanel } from "@/components/ui/GlassPanel";
import type { MemoryView } from "@/types/lesson";

export function MemoryPanel({ memoryView }: { memoryView: MemoryView }) {
  return (
    <GlassPanel className="space-y-3 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Variables</h3>
      <div className="space-y-1.5">
        {memoryView.variables.map((variable) => (
          <motion.div
            key={variable.name}
            layout
            className="flex items-center justify-between rounded-lg bg-accent/5 px-3 py-1.5 text-sm"
          >
            <span className="font-mono text-foreground/70">{variable.name}</span>
            <span className="font-mono font-medium">{JSON.stringify(variable.value)}</span>
          </motion.div>
        ))}
      </div>
      <h3 className="pt-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Call stack</h3>
      <div className="flex flex-col gap-1">
        {memoryView.call_stack.map((frame, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-border-glass bg-accent/5 px-3 py-1 font-mono text-xs"
            style={{ marginLeft: idx * 10 }}
          >
            {frame}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
