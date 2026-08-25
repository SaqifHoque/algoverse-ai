import type { LessonStep } from "@/types/lesson";

export interface CallFrame {
  depth: number;
  n: unknown;
  returnValue?: unknown;
}

/** The backend's memory_view only ever carries the CURRENTLY executing frame's locals, so to
 * show the whole call stack (each depth's own `n`) we replay recurse_in/recurse_out hints
 * across every step seen so far and reconstruct which frame held which value at each depth. */
export function reconstructCallStack(allSteps: LessonStep[], uptoIndex: number): CallFrame[] {
  const stack: CallFrame[] = [];

  for (let i = 0; i <= uptoIndex && i < allSteps.length; i++) {
    const step = allSteps[i]!;
    for (const hint of step.animation_hints) {
      if (hint.kind === "recurse_in") {
        const depth = hint.target_indices[0] ?? stack.length + 1;
        const nVar = step.memory_view.variables.find((v) => v.name === "n");
        stack[depth - 1] = { depth, n: nVar?.value };
      } else if (hint.kind === "recurse_out") {
        const depth = hint.target_indices[0] ?? stack.length;
        stack.length = Math.min(stack.length, depth - 1);
      }
    }
  }

  return stack.filter(Boolean);
}
