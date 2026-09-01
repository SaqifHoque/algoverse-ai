import type { ExampleSnippet } from "@/lib/examples/types";

export const ARRAY_EXAMPLES: ExampleSnippet[] = [
  { key: "array_sum", label: "Sum Every Value", category: "arrays", kind: "data_structure", description: "Walk through an array and build a running total.", complexity: "O(n)", source_code: `def array_sum(items):
    total = 0
    for value in items:
        total += value
    return total
`, entrypoint: "array_sum", args: [[4, 2, 7, 1]] },
  { key: "array_average", label: "Calculate the Average", category: "arrays", kind: "data_structure", description: "Combine a loop, a total, and the array length.", complexity: "O(n)", source_code: `def average(items):
    total = 0
    for value in items:
        total += value
    return total / len(items)
`, entrypoint: "average", args: [[4, 6, 8, 10]] },
  { key: "array_count_even", label: "Count Even Numbers", category: "arrays", kind: "data_structure", description: "Practice filtering values with a condition.", complexity: "O(n)", source_code: `def count_even(items):
    count = 0
    for value in items:
        if value % 2 == 0:
            count += 1
    return count
`, entrypoint: "count_even", args: [[1, 2, 4, 7, 8]] },
  { key: "array_remove_duplicates", label: "Remove Duplicates", category: "arrays", kind: "data_structure", description: "Build a new list while preserving order.", complexity: "O(n²)", source_code: `def remove_duplicates(items):
    result = []
    for value in items:
        if value not in result:
            result.append(value)
    return result
`, entrypoint: "remove_duplicates", args: [[3, 1, 3, 2, 1, 4]] },
  { key: "array_rotate_left", label: "Rotate Left Once", category: "arrays", kind: "data_structure", description: "Move the first item to the back.", complexity: "O(n)", source_code: `def rotate_left(items):
    if len(items) <= 1:
        return items
    first = items[0]
    for i in range(len(items) - 1):
        items[i] = items[i + 1]
    items[-1] = first
    return items
`, entrypoint: "rotate_left", args: [[1, 2, 3, 4, 5]] },
  { key: "array_second_largest", label: "Find the Second Largest", category: "arrays", kind: "data_structure", description: "Track two best values during one pass.", complexity: "O(n)", source_code: `def second_largest(items):
    largest = None
    second = None
    for value in items:
        if largest is None or value > largest:
            second = largest
            largest = value
        elif value != largest and (second is None or value > second):
            second = value
    return second
`, entrypoint: "second_largest", args: [[5, 1, 9, 7, 9, 3]] },
  { key: "array_prefix_sums", label: "Build Prefix Sums", category: "arrays", kind: "data_structure", description: "Store the running total at each position.", complexity: "O(n)", source_code: `def prefix_sums(items):
    result = []
    total = 0
    for value in items:
        total += value
        result.append(total)
    return result
`, entrypoint: "prefix_sums", args: [[2, 4, 1, 3]] },
  { key: "array_merge_sorted", label: "Merge Two Sorted Arrays", category: "arrays", kind: "data_structure", description: "Use two indexes to combine sorted values.", complexity: "O(n + m)", source_code: `def merge_sorted(left, right):
    result = []
    i = 0
    j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    return result + left[i:] + right[j:]
`, entrypoint: "merge_sorted", args: [[1, 4, 7], [2, 3, 8]] },
  { key: "array_move_zeroes", label: "Move Zeroes to the End", category: "arrays", kind: "data_structure", description: "Compact non-zero values with a write pointer.", complexity: "O(n)", source_code: `def move_zeroes(items):
    write = 0
    for read in range(len(items)):
        if items[read] != 0:
            items[write], items[read] = items[read], items[write]
            write += 1
    return items
`, entrypoint: "move_zeroes", args: [[0, 1, 0, 3, 12]] },
  { key: "array_missing_number", label: "Find the Missing Number", category: "arrays", kind: "data_structure", description: "Compare the expected and actual sums.", complexity: "O(n)", source_code: `def missing_number(items):
    n = len(items)
    expected = n * (n + 1) // 2
    actual = 0
    for value in items:
        actual += value
    return expected - actual
`, entrypoint: "missing_number", args: [[3, 0, 1]] },
];
