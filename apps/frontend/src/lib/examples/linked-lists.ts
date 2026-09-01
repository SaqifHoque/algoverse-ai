import type { ExampleSnippet } from "@/lib/examples/types";

// Inputs stay JSON-friendly. Each lesson builds a tiny linked list before operating on it.
export const LINKED_LIST_EXAMPLES: ExampleSnippet[] = [
  { key: "linked_traverse", label: "Traverse a Linked List", category: "linked_lists", kind: "data_structure", description: "Follow next pointers from the head to the tail.", complexity: "O(n)", source_code: `def traverse(values):
    nodes = [{"value": value, "next": i + 1} for i, value in enumerate(values)]
    if nodes:
        nodes[-1]["next"] = None
    result = []
    current = 0 if nodes else None
    while current is not None:
        result.append(nodes[current]["value"])
        current = nodes[current]["next"]
    return result
`, entrypoint: "traverse", args: [[10, 20, 30, 40]] },
  { key: "linked_length", label: "Measure Linked List Length", category: "linked_lists", kind: "data_structure", description: "Count nodes while walking through links.", complexity: "O(n)", source_code: `def linked_length(next_indexes, head):
    length = 0
    current = head
    while current is not None:
        length += 1
        current = next_indexes[current]
    return length
`, entrypoint: "linked_length", args: [[1, 2, 3, null], 0] },
  { key: "linked_search", label: "Search a Linked List", category: "linked_lists", kind: "data_structure", description: "Stop when a node contains the target.", complexity: "O(n)", source_code: `def linked_search(values, next_indexes, target):
    current = 0 if values else None
    while current is not None:
        if values[current] == target:
            return current
        current = next_indexes[current]
    return -1
`, entrypoint: "linked_search", args: [[5, 8, 13, 21], [1, 2, 3, null], 13] },
  { key: "linked_prepend", label: "Prepend a Node", category: "linked_lists", kind: "data_structure", description: "Create a new head that points at the old head.", complexity: "O(1)", source_code: `def prepend(values, next_indexes, value):
    old_head = 0 if values else None
    values.append(value)
    next_indexes.append(old_head)
    new_head = len(values) - 1
    return [values, next_indexes, new_head]
`, entrypoint: "prepend", args: [[20, 30], [1, null], 10] },
  { key: "linked_append", label: "Append a Node", category: "linked_lists", kind: "data_structure", description: "Find the tail and attach one new node.", complexity: "O(n)", source_code: `def append_node(values, next_indexes, value):
    new_index = len(values)
    values.append(value)
    next_indexes.append(None)
    if new_index == 0:
        return [values, next_indexes]
    current = 0
    while next_indexes[current] is not None:
        current = next_indexes[current]
    next_indexes[current] = new_index
    return [values, next_indexes]
`, entrypoint: "append_node", args: [[10, 20, 30], [1, 2, null], 40] },
  { key: "linked_reverse", label: "Reverse Linked List Links", category: "linked_lists", kind: "data_structure", description: "Redirect each next pointer toward the previous node.", complexity: "O(n)", source_code: `def reverse_links(next_indexes, head):
    previous = None
    current = head
    while current is not None:
        following = next_indexes[current]
        next_indexes[current] = previous
        previous = current
        current = following
    return [next_indexes, previous]
`, entrypoint: "reverse_links", args: [[1, 2, 3, null], 0] },
  { key: "linked_middle", label: "Find the Middle Node", category: "linked_lists", kind: "data_structure", description: "Move one pointer twice as fast as the other.", complexity: "O(n)", source_code: `def middle_node(values, next_indexes):
    slow = 0
    fast = 0
    while fast is not None and next_indexes[fast] is not None:
        slow = next_indexes[slow]
        fast = next_indexes[next_indexes[fast]]
    return values[slow]
`, entrypoint: "middle_node", args: [[10, 20, 30, 40, 50], [1, 2, 3, 4, null]] },
  { key: "linked_cycle", label: "Detect a Cycle", category: "linked_lists", kind: "data_structure", description: "Use slow and fast pointers to spot a loop.", complexity: "O(n)", source_code: `def has_linked_cycle(next_indexes, head):
    slow = head
    fast = head
    while fast is not None and next_indexes[fast] is not None:
        slow = next_indexes[slow]
        fast = next_indexes[next_indexes[fast]]
        if slow == fast:
            return True
    return False
`, entrypoint: "has_linked_cycle", args: [[1, 2, 3, 1], 0] },
  { key: "linked_delete", label: "Delete the First Match", category: "linked_lists", kind: "data_structure", description: "Reconnect the node before the removed value.", complexity: "O(n)", source_code: `def delete_first(values, next_indexes, target):
    head = 0 if values else None
    previous = None
    current = head
    while current is not None:
        if values[current] == target:
            if previous is None:
                head = next_indexes[current]
            else:
                next_indexes[previous] = next_indexes[current]
            break
        previous = current
        current = next_indexes[current]
    return [next_indexes, head]
`, entrypoint: "delete_first", args: [[10, 20, 30, 40], [1, 2, 3, null], 30] },
  { key: "linked_merge", label: "Merge Sorted Linked Values", category: "linked_lists", kind: "data_structure", description: "Choose the smaller front node from two chains.", complexity: "O(n + m)", source_code: `def merge_linked_values(first, second):
    merged = []
    i = 0
    j = 0
    while i < len(first) and j < len(second):
        if first[i] <= second[j]:
            merged.append(first[i])
            i += 1
        else:
            merged.append(second[j])
            j += 1
    return merged + first[i:] + second[j:]
`, entrypoint: "merge_linked_values", args: [[1, 4, 7], [2, 3, 8]] },
];
