import { BinarySearchVisualizer } from "@/components/visualizers/binary-search/BinarySearchVisualizer";
import { BubbleSortVisualizer } from "@/components/visualizers/bubble-sort/BubbleSortVisualizer";
import { RecursionVisualizer } from "@/components/visualizers/recursion/RecursionVisualizer";
import type { AlgorithmVisualizerComponent } from "@/components/visualizers/types";
import type { AlgorithmName } from "@/types/lesson";

const registry: Record<AlgorithmName, AlgorithmVisualizerComponent> = {
  bubble_sort: BubbleSortVisualizer,
  binary_search: BinarySearchVisualizer,
  fibonacci_recursive: RecursionVisualizer,
};

/** Adding a 4th algorithm later means one new component + one registry line -- the player
 * shell never branches on algorithm identity. */
export function resolveVisualizer(algorithmName: AlgorithmName): AlgorithmVisualizerComponent {
  return registry[algorithmName];
}
