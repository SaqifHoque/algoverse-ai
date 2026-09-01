import type { ExampleSnippet } from "@/lib/examples/types";

export const STACK_QUEUE_EXAMPLES: ExampleSnippet[] = [
  { key: "stack_push_pop", label: "Stack Push and Pop", category: "stacks_queues", kind: "data_structure", description: "See last-in, first-out behavior.", complexity: "O(n)", source_code: `def stack_demo(items):
    stack = []
    for item in items:
        stack.append(item)
    removed = []
    while stack:
        removed.append(stack.pop())
    return removed
`, entrypoint: "stack_demo", args: [["A", "B", "C"]] },
  { key: "stack_reverse", label: "Reverse with a Stack", category: "stacks_queues", kind: "data_structure", description: "Push characters, then pop them in reverse order.", complexity: "O(n)", source_code: `def reverse_with_stack(text):
    stack = []
    for ch in text:
        stack.append(ch)
    result = ""
    while stack:
        result += stack.pop()
    return result
`, entrypoint: "reverse_with_stack", args: ["stack"] },
  { key: "stack_balanced", label: "Balanced Parentheses", category: "stacks_queues", kind: "data_structure", description: "Match each closing bracket to the latest opening bracket.", complexity: "O(n)", source_code: `def balanced_parentheses(text):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return len(stack) == 0
`, entrypoint: "balanced_parentheses", args: ["{[()()]}"] },
  { key: "stack_min", label: "Minimum Value Stack", category: "stacks_queues", kind: "data_structure", description: "Maintain a second stack of minimum values.", complexity: "O(n)", source_code: `def minimum_after_each_push(items):
    stack = []
    minimums = []
    answers = []
    for value in items:
        stack.append(value)
        if not minimums or value <= minimums[-1]:
            minimums.append(value)
        answers.append(minimums[-1])
    return answers
`, entrypoint: "minimum_after_each_push", args: [[5, 3, 7, 2, 6]] },
  { key: "queue_fifo", label: "Queue First-In, First-Out", category: "stacks_queues", kind: "data_structure", description: "Add at the back and remove from the front.", complexity: "O(n²) with list front removal", source_code: `def queue_demo(items):
    queue = []
    for item in items:
        queue.append(item)
    served = []
    while queue:
        served.append(queue.pop(0))
    return served
`, entrypoint: "queue_demo", args: [["Ada", "Grace", "Linus"]] },
  { key: "queue_round_robin", label: "Round-Robin Queue", category: "stacks_queues", kind: "data_structure", description: "Rotate unfinished jobs to the back.", complexity: "O(total work)", source_code: `def round_robin(jobs, quantum):
    queue = [[name, time] for name, time in jobs]
    finished = []
    while queue:
        job = queue.pop(0)
        job[1] -= quantum
        if job[1] <= 0:
            finished.append(job[0])
        else:
            queue.append(job)
    return finished
`, entrypoint: "round_robin", args: [[["A", 3], ["B", 5], ["C", 2]], 2] },
  { key: "queue_hot_potato", label: "Hot Potato Queue", category: "stacks_queues", kind: "data_structure", description: "Rotate a queue and eliminate one player each round.", complexity: "O(n·k)", source_code: `def hot_potato(players, passes):
    queue = players[:]
    while len(queue) > 1:
        for _ in range(passes):
            queue.append(queue.pop(0))
        queue.pop(0)
    return queue[0]
`, entrypoint: "hot_potato", args: [["A", "B", "C", "D", "E"], 3] },
  { key: "queue_sliding_average", label: "Moving Average Queue", category: "stacks_queues", kind: "data_structure", description: "Keep only the latest values in a fixed-size queue.", complexity: "O(n)", source_code: `def moving_averages(items, size):
    queue = []
    total = 0
    result = []
    for value in items:
        queue.append(value)
        total += value
        if len(queue) > size:
            total -= queue.pop(0)
        result.append(total / len(queue))
    return result
`, entrypoint: "moving_averages", args: [[1, 10, 3, 5, 8], 3] },
  { key: "deque_palindrome", label: "Palindrome with a Deque", category: "stacks_queues", kind: "data_structure", description: "Compare values removed from both ends.", complexity: "O(n²) with a list", source_code: `def deque_palindrome(text):
    deque = list(text)
    while len(deque) > 1:
        if deque.pop(0) != deque.pop():
            return False
    return True
`, entrypoint: "deque_palindrome", args: ["level"] },
  { key: "two_stacks_queue", label: "Queue Using Two Stacks", category: "stacks_queues", kind: "data_structure", description: "Transfer values to reverse stack order into queue order.", complexity: "O(n)", source_code: `def queue_with_two_stacks(items):
    incoming = []
    outgoing = []
    for item in items:
        incoming.append(item)
    while incoming:
        outgoing.append(incoming.pop())
    result = []
    while outgoing:
        result.append(outgoing.pop())
    return result
`, entrypoint: "queue_with_two_stacks", args: [[1, 2, 3, 4]] },
];
