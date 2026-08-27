import type { ExampleSnippet } from "@/lib/examples/types";

export const DYNAMIC_PROGRAMMING_EXAMPLES: ExampleSnippet[] = [
  { key: "dp_fibonacci", label: "Fibonacci with a Table", category: "dynamic_programming", kind: "algorithm", description: "Reuse the previous two answers instead of repeating work.", complexity: "O(n)", source_code: `def fibonacci_table(n):
    if n <= 1:
        return n
    table = [0, 1]
    for i in range(2, n + 1):
        table.append(table[i - 1] + table[i - 2])
    return table[n]
`, entrypoint: "fibonacci_table", args: [8] },
  { key: "dp_climb_stairs", label: "Climbing Stairs", category: "dynamic_programming", kind: "algorithm", description: "Reach each step from either of the two before it.", complexity: "O(n)", source_code: `def climb_stairs(n):
    if n <= 2:
        return n
    one_step_back = 2
    two_steps_back = 1
    for _ in range(3, n + 1):
        current = one_step_back + two_steps_back
        two_steps_back = one_step_back
        one_step_back = current
    return one_step_back
`, entrypoint: "climb_stairs", args: [6] },
  { key: "dp_house_robber", label: "House Robber", category: "dynamic_programming", kind: "algorithm", description: "Choose between skipping and taking each value.", complexity: "O(n)", source_code: `def max_non_adjacent_sum(values):
    previous = 0
    current = 0
    for value in values:
        best = max(current, previous + value)
        previous = current
        current = best
    return current
`, entrypoint: "max_non_adjacent_sum", args: [[2, 7, 9, 3, 1]] },
  { key: "dp_min_cost_stairs", label: "Minimum Cost Stairs", category: "dynamic_programming", kind: "algorithm", description: "Store the cheapest cost to reach each step.", complexity: "O(n)", source_code: `def min_cost_stairs(cost):
    before_two = 0
    before_one = 0
    for value in cost:
        current = value + min(before_one, before_two)
        before_two = before_one
        before_one = current
    return min(before_one, before_two)
`, entrypoint: "min_cost_stairs", args: [[10, 15, 20]] },
  { key: "dp_coin_change", label: "Minimum Coins", category: "dynamic_programming", kind: "algorithm", description: "Build the best answer for every smaller amount.", complexity: "O(amount · coins)", source_code: `def minimum_coins(coins, amount):
    table = [amount + 1] * (amount + 1)
    table[0] = 0
    for value in range(1, amount + 1):
        for coin in coins:
            if coin <= value:
                table[value] = min(table[value], table[value - coin] + 1)
    return table[amount] if table[amount] <= amount else -1
`, entrypoint: "minimum_coins", args: [[1, 3, 4], 6] },
  { key: "dp_subset_sum", label: "Subset Sum", category: "dynamic_programming", kind: "algorithm", description: "Track which totals can be made so far.", complexity: "O(n · target)", source_code: `def can_make_sum(items, target):
    possible = [False] * (target + 1)
    possible[0] = True
    for value in items:
        for total in range(target, value - 1, -1):
            if possible[total - value]:
                possible[total] = True
    return possible[target]
`, entrypoint: "can_make_sum", args: [[3, 4, 5], 9] },
  { key: "dp_longest_increasing", label: "Longest Increasing Subsequence", category: "dynamic_programming", kind: "algorithm", description: "Extend the best sequence ending at earlier values.", complexity: "O(n²)", source_code: `def longest_increasing_length(items):
    lengths = [1] * len(items)
    for i in range(len(items)):
        for j in range(i):
            if items[j] < items[i]:
                lengths[i] = max(lengths[i], lengths[j] + 1)
    return max(lengths) if lengths else 0
`, entrypoint: "longest_increasing_length", args: [[10, 9, 2, 5, 3, 7, 101, 18]] },
  { key: "dp_grid_paths", label: "Grid Paths with a Table", category: "dynamic_programming", kind: "algorithm", description: "Add paths from above and from the left.", complexity: "O(rows · columns)", source_code: `def grid_paths(rows, columns):
    table = [[1] * columns for _ in range(rows)]
    for row in range(1, rows):
        for column in range(1, columns):
            table[row][column] = table[row - 1][column] + table[row][column - 1]
    return table[-1][-1]
`, entrypoint: "grid_paths", args: [3, 4] },
  { key: "dp_word_break", label: "Word Break", category: "dynamic_programming", kind: "algorithm", description: "Mark prefixes that can be split into known words.", complexity: "O(n²)", source_code: `def can_split(text, words):
    possible = [False] * (len(text) + 1)
    possible[0] = True
    for end in range(1, len(text) + 1):
        for start in range(end):
            if possible[start] and text[start:end] in words:
                possible[end] = True
                break
    return possible[-1]
`, entrypoint: "can_split", args: ["applepenapple", ["apple", "pen"]] },
  { key: "dp_max_subarray", label: "Maximum Subarray Sum", category: "dynamic_programming", kind: "algorithm", description: "Decide whether to extend or restart the running segment.", complexity: "O(n)", source_code: `def maximum_subarray(items):
    current = items[0]
    best = items[0]
    for value in items[1:]:
        current = max(value, current + value)
        best = max(best, current)
    return best
`, entrypoint: "maximum_subarray", args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]] },
];
