import type { ExampleSnippet } from "@/lib/examples/types";

export const RECURSION_EXAMPLES: ExampleSnippet[] = [
  { key: "recursive_countdown", label: "Recursive Countdown", category: "recursion", kind: "algorithm", description: "Watch calls descend to a base case and return.", complexity: "O(n)", source_code: `def countdown(n):
    if n == 0:
        return [0]
    return [n] + countdown(n - 1)
`, entrypoint: "countdown", args: [5] },
  { key: "recursive_factorial", label: "Recursive Factorial", category: "recursion", kind: "algorithm", description: "Multiply a number by the solution to a smaller problem.", complexity: "O(n)", source_code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
`, entrypoint: "factorial", args: [5] },
  { key: "recursive_sum", label: "Recursive Array Sum", category: "recursion", kind: "algorithm", description: "Add the first value to the sum of the remainder.", complexity: "O(n)", source_code: `def recursive_sum(items):
    if not items:
        return 0
    return items[0] + recursive_sum(items[1:])
`, entrypoint: "recursive_sum", args: [[2, 4, 6, 8]] },
  { key: "recursive_reverse", label: "Recursive String Reverse", category: "recursion", kind: "algorithm", description: "Reverse the suffix before adding the first character.", complexity: "O(n²)", source_code: `def recursive_reverse(text):
    if len(text) <= 1:
        return text
    return recursive_reverse(text[1:]) + text[0]
`, entrypoint: "recursive_reverse", args: ["hello"] },
  { key: "recursive_power", label: "Recursive Power", category: "recursion", kind: "algorithm", description: "Repeatedly multiply by the base.", complexity: "O(n)", source_code: `def power(base, exponent):
    if exponent == 0:
        return 1
    return base * power(base, exponent - 1)
`, entrypoint: "power", args: [3, 4] },
  { key: "recursive_gcd", label: "Euclidean GCD", category: "recursion", kind: "algorithm", description: "Replace a pair with the divisor and remainder.", complexity: "O(log n)", source_code: `def recursive_gcd(a, b):
    if b == 0:
        return a
    return recursive_gcd(b, a % b)
`, entrypoint: "recursive_gcd", args: [48, 18] },
  { key: "recursive_binary_search", label: "Recursive Binary Search", category: "recursion", kind: "algorithm", description: "Discard half the search range with each call.", complexity: "O(log n)", source_code: `def recursive_binary_search(items, target, low=0, high=None):
    if high is None:
        high = len(items) - 1
    if low > high:
        return -1
    middle = (low + high) // 2
    if items[middle] == target:
        return middle
    if target < items[middle]:
        return recursive_binary_search(items, target, low, middle - 1)
    return recursive_binary_search(items, target, middle + 1, high)
`, entrypoint: "recursive_binary_search", args: [[1, 3, 5, 7, 9, 11], 9] },
  { key: "backtrack_subsets", label: "Generate All Subsets", category: "recursion", kind: "algorithm", description: "Choose whether to include each value.", complexity: "O(2ⁿ)", source_code: `def all_subsets(items):
    result = []
    def choose(index, current):
        if index == len(items):
            result.append(current[:])
            return
        choose(index + 1, current)
        current.append(items[index])
        choose(index + 1, current)
        current.pop()
    choose(0, [])
    return result
`, entrypoint: "all_subsets", args: [[1, 2, 3]] },
  { key: "backtrack_binary_strings", label: "Generate Binary Strings", category: "recursion", kind: "algorithm", description: "Explore two choices at every position.", complexity: "O(2ⁿ)", source_code: `def binary_strings(length):
    result = []
    def build(current):
        if len(current) == length:
            result.append(current)
            return
        build(current + "0")
        build(current + "1")
    build("")
    return result
`, entrypoint: "binary_strings", args: [3] },
  { key: "backtrack_paths", label: "Grid Paths with Recursion", category: "recursion", kind: "algorithm", description: "Count paths by trying right and down moves.", complexity: "O(2ⁿ⁺ᵐ)", source_code: `def count_grid_paths(rows, columns):
    if rows == 1 or columns == 1:
        return 1
    return count_grid_paths(rows - 1, columns) + count_grid_paths(rows, columns - 1)
`, entrypoint: "count_grid_paths", args: [3, 4] },
];
