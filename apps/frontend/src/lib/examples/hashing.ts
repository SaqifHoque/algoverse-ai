import type { ExampleSnippet } from "@/lib/examples/types";

export const HASHING_EXAMPLES: ExampleSnippet[] = [
  {
    key: "two_sum",
    label: "Two Sum (Hash Map)",
    category: "hashing",
    source_code:
      "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n",
    entrypoint: "two_sum",
    args: [[2, 7, 11, 15], 9],
  },
  {
    key: "first_unique_char",
    label: "First Unique Character (Frequency Map)",
    category: "hashing",
    source_code:
      "def first_unique_char(s):\n    counts = {}\n    for ch in s:\n        counts[ch] = counts.get(ch, 0) + 1\n    for i, ch in enumerate(s):\n        if counts[ch] == 1:\n            return i\n    return -1\n",
    entrypoint: "first_unique_char",
    args: ["leetcode"],
  },
];
