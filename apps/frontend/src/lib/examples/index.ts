import { GRAPH_EXAMPLES } from "@/lib/examples/graphs";
import { ARRAY_EXAMPLES } from "@/lib/examples/arrays";
import { STRING_EXAMPLES } from "@/lib/examples/strings";
import { LINKED_LIST_EXAMPLES } from "@/lib/examples/linked-lists";
import { STACK_QUEUE_EXAMPLES } from "@/lib/examples/stacks-queues";
import { TREE_EXAMPLES } from "@/lib/examples/trees";
import { RECURSION_EXAMPLES } from "@/lib/examples/recursion";
import { DYNAMIC_PROGRAMMING_EXAMPLES } from "@/lib/examples/dynamic-programming";
import { GREEDY_EXAMPLES } from "@/lib/examples/greedy";
import { MATH_EXAMPLES } from "@/lib/examples/math";
import { HASHING_EXAMPLES } from "@/lib/examples/hashing";
import { POINTER_EXAMPLES } from "@/lib/examples/pointers";
import { SEARCHING_EXAMPLES } from "@/lib/examples/searching";
import { SORTING_EXAMPLES } from "@/lib/examples/sorting";
import { CATEGORY_LABELS, type ExampleCategory, type ExampleKind, type ExampleSnippet } from "@/lib/examples/types";

export type { ExampleCategory, ExampleKind, ExampleSnippet };
export { CATEGORY_LABELS };

// Each category lives in its own module (pointers.ts, hashing.ts, searching.ts, sorting.ts,
// graphs.ts) -- this file only aggregates them. Add a new category by creating a new module
// and listing it in CATEGORY_ORDER/the spread below; add a snippet to an existing category by
// editing that category's own file.
const CATEGORY_ORDER: ExampleCategory[] = [
  "arrays", "strings", "linked_lists", "stacks_queues", "trees",
  "hashing", "graphs", "searching", "sorting", "pointers",
  "recursion", "dynamic_programming", "greedy", "math",
];

export const EXAMPLE_SNIPPETS: ExampleSnippet[] = [
  ...ARRAY_EXAMPLES,
  ...STRING_EXAMPLES,
  ...LINKED_LIST_EXAMPLES,
  ...STACK_QUEUE_EXAMPLES,
  ...TREE_EXAMPLES,
  ...POINTER_EXAMPLES,
  ...HASHING_EXAMPLES,
  ...SEARCHING_EXAMPLES,
  ...SORTING_EXAMPLES,
  ...GRAPH_EXAMPLES,
  ...RECURSION_EXAMPLES,
  ...DYNAMIC_PROGRAMMING_EXAMPLES,
  ...GREEDY_EXAMPLES,
  ...MATH_EXAMPLES,
];

export function groupExamplesByCategory(): { category: ExampleCategory; label: string; snippets: ExampleSnippet[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    snippets: EXAMPLE_SNIPPETS.filter((s) => s.category === category),
  }));
}
