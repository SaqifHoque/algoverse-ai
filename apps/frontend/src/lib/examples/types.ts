export type ExampleCategory =
  | "arrays"
  | "strings"
  | "linked_lists"
  | "stacks_queues"
  | "trees"
  | "pointers"
  | "hashing"
  | "searching"
  | "sorting"
  | "graphs"
  | "recursion"
  | "dynamic_programming"
  | "greedy"
  | "math";

export type ExampleKind = "data_structure" | "algorithm";

export interface ExampleSnippet {
  key: string;
  label: string;
  category: ExampleCategory;
  source_code: string;
  entrypoint: string;
  args: unknown[];
  kind?: ExampleKind;
  description?: string;
  complexity?: string;
}

export const CATEGORY_LABELS: Record<ExampleCategory, string> = {
  arrays: "Arrays & Lists",
  strings: "Strings",
  linked_lists: "Linked Lists",
  stacks_queues: "Stacks & Queues",
  trees: "Trees & Binary Search Trees",
  pointers: "Two Pointers / Sliding Window",
  hashing: "Hash Map",
  searching: "Searching",
  sorting: "Sorting",
  graphs: "Graphs (BFS / DFS)",
  recursion: "Recursion & Backtracking",
  dynamic_programming: "Dynamic Programming",
  greedy: "Greedy Algorithms",
  math: "Math & Number Algorithms",
};
