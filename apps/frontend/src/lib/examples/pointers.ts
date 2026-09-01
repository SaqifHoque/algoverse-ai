import type { ExampleSnippet } from "@/lib/examples/types";

export const POINTER_EXAMPLES: ExampleSnippet[] = [
  {
    key: "two_pointer_reverse",
    label: "Two Pointer: Reverse Array In Place",
    category: "pointers",
    source_code:
      "def reverse_array(items):\n    left = 0\n    right = len(items) - 1\n    while left < right:\n        items[left], items[right] = items[right], items[left]\n        left += 1\n        right -= 1\n    return items\n",
    entrypoint: "reverse_array",
    args: [[1, 2, 3, 4, 5]],
  },
  {
    key: "sliding_window",
    label: "Sliding Window: Max Sum Subarray of Size K",
    category: "pointers",
    source_code:
      "def max_sum_subarray(items, k):\n    window_sum = sum(items[:k])\n    best = window_sum\n    for i in range(k, len(items)):\n        window_sum += items[i] - items[i - k]\n        if window_sum > best:\n            best = window_sum\n    return best\n",
    entrypoint: "max_sum_subarray",
    args: [[2, 1, 5, 1, 3, 2], 3],
  },
  {
    key: "fast_slow_cycle",
    label: "Fast/Slow Pointers: Tortoise and Hare Cycle Detection",
    category: "pointers",
    source_code:
      "def has_cycle(next_map, start):\n    slow = start\n    fast = start\n    while fast is not None and next_map.get(fast) is not None:\n        slow = next_map[slow]\n        fast = next_map.get(next_map[fast])\n        if slow == fast:\n            return True\n    return False\n",
    entrypoint: "has_cycle",
    // JSON object keys are always strings once parsed on the backend -- values are kept as
    // strings too so node identity stays consistent through the traversal (no int/str mismatch).
    args: [{ "0": "1", "1": "2", "2": "3", "3": "1" }, "0"],
  },
];
