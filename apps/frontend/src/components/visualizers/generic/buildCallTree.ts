import type { LessonStep } from "@/types/lesson";

export interface VisualCallNode {
  id: string;
  parentId: string | null;
  depth: number;
  functionName: string;
  detail: string;
  startStep: number;
  endStep: number | null;
}

function shortValue(value: unknown): string {
  const text = JSON.stringify(value);
  if (text === undefined) return String(value);
  return text.length > 32 ? `${text.slice(0, 29)}…` : text;
}

/** Replays the structural recurse_in/recurse_out events generated from the real Python trace.
 * Unlike the old call-stack view, this keeps completed and future sibling calls, producing the
 * complete call tree instead of only the currently active branch. */
export function buildCallTree(steps: LessonStep[]): VisualCallNode[] {
  const nodes: VisualCallNode[] = [];
  let activeByDepth: string[] = [];

  steps.forEach((step, stepIndex) => {
    for (const hint of step.animation_hints) {
      const depth = hint.target_indices[0] ?? step.memory_view.call_stack.length;
      if (hint.kind === "recurse_in") {
        for (let closingDepth = activeByDepth.length; closingDepth >= depth; closingDepth--) {
          const closing = nodes.find((candidate) => candidate.id === activeByDepth[closingDepth - 1]);
          if (closing && closing.endStep === null) closing.endStep = Math.max(closing.startStep, stepIndex - 1);
        }
        activeByDepth = activeByDepth.slice(0, Math.max(0, depth - 1));
        const id = `call-${nodes.length}`;
        const functionName = step.memory_view.call_stack[depth - 1] ?? step.memory_view.call_stack.at(-1) ?? "call";
        const detail = step.memory_view.variables
          .filter((variable) => hint.target_vars.includes(variable.name))
          .slice(0, 3)
          .map((variable) => `${variable.name}=${shortValue(variable.value)}`)
          .join(", ");
        nodes.push({
          id,
          parentId: depth > 1 ? activeByDepth[depth - 2] ?? null : null,
          depth,
          functionName,
          detail,
          startStep: stepIndex,
          endStep: null,
        });
        activeByDepth[depth - 1] = id;
      } else if (hint.kind === "recurse_out") {
        for (let closingDepth = activeByDepth.length; closingDepth >= depth; closingDepth--) {
          const node = nodes.find((candidate) => candidate.id === activeByDepth[closingDepth - 1]);
          if (node && node.endStep === null) node.endStep = stepIndex;
        }
        activeByDepth = activeByDepth.slice(0, Math.max(0, depth - 1));
      }
    }
  });

  return nodes;
}
