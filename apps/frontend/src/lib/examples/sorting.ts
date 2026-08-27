import type { ExampleSnippet } from "@/lib/examples/types";

export const SORTING_EXAMPLES: ExampleSnippet[] = [
  {
    key: "selection_sort",
    label: "Selection Sort",
    category: "sorting",
    source_code:
      "def selection_sort(items):\n    n = len(items)\n    for i in range(n):\n        min_idx = i\n        for j in range(i + 1, n):\n            if items[j] < items[min_idx]:\n                min_idx = j\n        items[i], items[min_idx] = items[min_idx], items[i]\n    return items\n",
    entrypoint: "selection_sort",
    args: [[5, 3, 8, 1, 9, 2]],
  },
  {
    key: "insertion_sort",
    label: "Insertion Sort",
    category: "sorting",
    source_code:
      "def insertion_sort(items):\n    for i in range(1, len(items)):\n        key = items[i]\n        j = i - 1\n        while j >= 0 and items[j] > key:\n            items[j + 1] = items[j]\n            j -= 1\n        items[j + 1] = key\n    return items\n",
    entrypoint: "insertion_sort",
    args: [[5, 3, 8, 1, 9, 2]],
  },
  {
    key: "merge_sort",
    label: "Merge Sort (recursive)",
    category: "sorting",
    source_code:
      "def merge_sort(items):\n    if len(items) <= 1:\n        return items\n    mid = len(items) // 2\n    left = merge_sort(items[:mid])\n    right = merge_sort(items[mid:])\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result\n",
    entrypoint: "merge_sort",
    args: [[5, 3, 8, 1, 9, 2]],
  },
  {
    key: "quick_sort",
    label: "Quick Sort (recursive, in-place)",
    category: "sorting",
    source_code:
      "def quick_sort(items, low=0, high=None):\n    if high is None:\n        high = len(items) - 1\n    if low < high:\n        pivot = items[high]\n        i = low - 1\n        for j in range(low, high):\n            if items[j] <= pivot:\n                i += 1\n                items[i], items[j] = items[j], items[i]\n        items[i + 1], items[high] = items[high], items[i + 1]\n        pivot_index = i + 1\n        quick_sort(items, low, pivot_index - 1)\n        quick_sort(items, pivot_index + 1, high)\n    return items\n",
    entrypoint: "quick_sort",
    args: [[5, 3, 8, 1, 9, 2]],
  },
];
