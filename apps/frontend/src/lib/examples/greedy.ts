import type { ExampleSnippet } from "@/lib/examples/types";

export const GREEDY_EXAMPLES: ExampleSnippet[] = [
  { key: "greedy_change", label: "Greedy Coin Change", category: "greedy", kind: "algorithm", description: "Take as many large coins as possible first.", complexity: "O(number of coins)", source_code: `def greedy_change(amount, coins):
    result = []
    for coin in coins:
        while amount >= coin:
            result.append(coin)
            amount -= coin
    return result
`, entrypoint: "greedy_change", args: [87, [25, 10, 5, 1]] },
  { key: "greedy_activity", label: "Activity Selection", category: "greedy", kind: "algorithm", description: "Always choose the compatible activity that ends first.", complexity: "O(n log n)", source_code: `def select_activities(activities):
    activities.sort(key=lambda item: item[1])
    selected = []
    last_end = -1
    for start, end in activities:
        if start >= last_end:
            selected.append([start, end])
            last_end = end
    return selected
`, entrypoint: "select_activities", args: [[[1, 3], [2, 5], [4, 7], [6, 9], [8, 10]]] },
  { key: "greedy_boats", label: "Rescue Boats", category: "greedy", kind: "algorithm", description: "Pair the lightest person with the heaviest when possible.", complexity: "O(n log n)", source_code: `def rescue_boats(weights, limit):
    weights.sort()
    light = 0
    heavy = len(weights) - 1
    boats = 0
    while light <= heavy:
        if weights[light] + weights[heavy] <= limit:
            light += 1
        heavy -= 1
        boats += 1
    return boats
`, entrypoint: "rescue_boats", args: [[3, 2, 2, 1], 3] },
  { key: "greedy_cookies", label: "Assign Cookies", category: "greedy", kind: "algorithm", description: "Give the smallest sufficient cookie to each child.", complexity: "O(n log n)", source_code: `def assign_cookies(needs, cookies):
    needs.sort()
    cookies.sort()
    child = 0
    for cookie in cookies:
        if child < len(needs) and cookie >= needs[child]:
            child += 1
    return child
`, entrypoint: "assign_cookies", args: [[1, 2, 3], [1, 1, 3]] },
  { key: "greedy_jumps", label: "Can Reach the End", category: "greedy", kind: "algorithm", description: "Keep the farthest reachable array index.", complexity: "O(n)", source_code: `def can_reach_end(jumps):
    farthest = 0
    for index in range(len(jumps)):
        if index > farthest:
            return False
        farthest = max(farthest, index + jumps[index])
    return True
`, entrypoint: "can_reach_end", args: [[2, 3, 1, 1, 4]] },
  { key: "greedy_min_jumps", label: "Minimum Jumps", category: "greedy", kind: "algorithm", description: "Delay each jump until the current reach is exhausted.", complexity: "O(n)", source_code: `def minimum_jumps(jumps):
    count = 0
    current_end = 0
    farthest = 0
    for index in range(len(jumps) - 1):
        farthest = max(farthest, index + jumps[index])
        if index == current_end:
            count += 1
            current_end = farthest
    return count
`, entrypoint: "minimum_jumps", args: [[2, 3, 1, 1, 4]] },
  { key: "greedy_stock", label: "Stock Profit from Every Rise", category: "greedy", kind: "algorithm", description: "Collect every positive day-to-day price change.", complexity: "O(n)", source_code: `def total_stock_profit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit
`, entrypoint: "total_stock_profit", args: [[7, 1, 5, 3, 6, 4]] },
  { key: "greedy_partition_labels", label: "Partition Labels", category: "greedy", kind: "algorithm", description: "End a segment only after every included letter's final appearance.", complexity: "O(n)", source_code: `def partition_sizes(text):
    last = {}
    for i, ch in enumerate(text):
        last[ch] = i
    result = []
    start = 0
    end = 0
    for i, ch in enumerate(text):
        end = max(end, last[ch])
        if i == end:
            result.append(end - start + 1)
            start = i + 1
    return result
`, entrypoint: "partition_sizes", args: ["ababcbacadefegdehijhklij"] },
  { key: "greedy_platforms", label: "Minimum Train Platforms", category: "greedy", kind: "algorithm", description: "Sweep through sorted arrivals and departures.", complexity: "O(n log n)", source_code: `def minimum_platforms(arrivals, departures):
    arrivals.sort()
    departures.sort()
    i = 0
    j = 0
    active = 0
    best = 0
    while i < len(arrivals):
        if arrivals[i] < departures[j]:
            active += 1
            best = max(best, active)
            i += 1
        else:
            active -= 1
            j += 1
    return best
`, entrypoint: "minimum_platforms", args: [[900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]] },
  { key: "greedy_largest_number", label: "Largest Number from Digits", category: "greedy", kind: "algorithm", description: "Place larger digits first.", complexity: "O(n log n)", source_code: `def largest_from_digits(digits):
    digits.sort(reverse=True)
    result = ""
    for digit in digits:
        result += str(digit)
    return result
`, entrypoint: "largest_from_digits", args: [[3, 1, 9, 4, 7]] },
];
