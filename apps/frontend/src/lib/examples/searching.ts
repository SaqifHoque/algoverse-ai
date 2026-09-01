import type { ExampleSnippet } from "@/lib/examples/types";

export const SEARCHING_EXAMPLES: ExampleSnippet[] = [
  {
    key: "linear_search",
    label: "Linear Search",
    category: "searching",
    source_code:
      "def linear_search(items, target):\n    for i in range(len(items)):\n        if items[i] == target:\n            return i\n    return -1\n",
    entrypoint: "linear_search",
    args: [[4, 2, 7, 1, 9], 7],
  },
  {
    key: "find_min_max",
    label: "Find Min and Max in One Pass",
    category: "searching",
    source_code:
      "def find_min_max(items):\n    lo = items[0]\n    hi = items[0]\n    for value in items[1:]:\n        if value < lo:\n            lo = value\n        if value > hi:\n            hi = value\n    return [lo, hi]\n",
    entrypoint: "find_min_max",
    args: [[5, 3, 8, 1, 9, 2]],
  },
];
