import type { Lesson } from "@/types/lesson";

import bubbleSort from "./data/bubble_sort.lesson.json";
import binarySearch from "./data/binary_search.lesson.json";
import fibonacciRecursive from "./data/fibonacci_recursive.lesson.json";

export const FIXTURES = {
  bubble_sort: bubbleSort as unknown as Lesson,
  binary_search: binarySearch as unknown as Lesson,
  fibonacci_recursive: fibonacciRecursive as unknown as Lesson,
} as const;

export type FixtureKey = keyof typeof FIXTURES;

export const FIXTURE_SOURCE_CODE: Record<FixtureKey, { source_code: string; entrypoint: string; args: unknown[] }> = {
  bubble_sort: {
    source_code:
      "def bubble_sort(items):\n    n = len(items)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if items[j] > items[j + 1]:\n                items[j], items[j + 1] = items[j + 1], items[j]\n    return items\n",
    entrypoint: "bubble_sort",
    args: [[5, 3, 1, 4, 2]],
  },
  binary_search: {
    source_code:
      "def binary_search(items, target):\n    low = 0\n    high = len(items) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if items[mid] == target:\n            return mid\n        if items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n",
    entrypoint: "binary_search",
    args: [[1, 3, 5, 7, 9, 11], 7],
  },
  fibonacci_recursive: {
    source_code:
      "def fibonacci_recursive(n):\n    if n <= 1:\n        return n\n    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)\n",
    entrypoint: "fibonacci_recursive",
    args: [6],
  },
};
