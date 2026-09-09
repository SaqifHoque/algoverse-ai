import { BinarySearchVisualizer } from "@/components/visualizers/binary-search/BinarySearchVisualizer";
import { BubbleSortVisualizer } from "@/components/visualizers/bubble-sort/BubbleSortVisualizer";
import { GenericVisualizer } from "@/components/visualizers/generic/GenericVisualizer";
import { RecursionVisualizer } from "@/components/visualizers/recursion/RecursionVisualizer";
import type { AlgorithmVisualizerComponent } from "@/components/visualizers/types";
import type { AlgorithmName } from "@/types/lesson";

const registry: Record<AlgorithmName, AlgorithmVisualizerComponent> = {
  bubble_sort: BubbleSortVisualizer,
  binary_search: BinarySearchVisualizer,
  fibonacci_recursive: RecursionVisualizer,
  custom: GenericVisualizer,
};

/** Adding a new named algorithm later means one new component + one registry line -- the
 * player shell never branches on algorithm identity. Any name not in the registry (including
 * "custom", and defensively any value the backend might ever send that the frontend doesn't
 * recognize yet) falls back to GenericVisualizer rather than crashing. */
export function resolveVisualizer(algorithmName: AlgorithmName): AlgorithmVisualizerComponent {
  return registry[algorithmName] ?? GenericVisualizer;
}
