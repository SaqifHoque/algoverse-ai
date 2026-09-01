import type { ExampleSnippet } from "@/lib/examples/types";

// Trees use the familiar array representation: children of i are 2*i+1 and 2*i+2.
export const TREE_EXAMPLES: ExampleSnippet[] = [
  { key: "tree_preorder", label: "Tree Preorder Traversal", category: "trees", kind: "data_structure", description: "Visit root, then left subtree, then right subtree.", complexity: "O(n)", source_code: `def preorder(tree, index=0):
    if index >= len(tree) or tree[index] is None:
        return []
    left = preorder(tree, index * 2 + 1)
    right = preorder(tree, index * 2 + 2)
    return [tree[index]] + left + right
`, entrypoint: "preorder", args: [[8, 4, 12, 2, 6, 10, 14]] },
  { key: "tree_inorder", label: "Tree Inorder Traversal", category: "trees", kind: "data_structure", description: "Visit left subtree, root, then right subtree.", complexity: "O(n)", source_code: `def inorder(tree, index=0):
    if index >= len(tree) or tree[index] is None:
        return []
    left = inorder(tree, index * 2 + 1)
    right = inorder(tree, index * 2 + 2)
    return left + [tree[index]] + right
`, entrypoint: "inorder", args: [[8, 4, 12, 2, 6, 10, 14]] },
  { key: "tree_postorder", label: "Tree Postorder Traversal", category: "trees", kind: "data_structure", description: "Visit both children before their parent.", complexity: "O(n)", source_code: `def postorder(tree, index=0):
    if index >= len(tree) or tree[index] is None:
        return []
    left = postorder(tree, index * 2 + 1)
    right = postorder(tree, index * 2 + 2)
    return left + right + [tree[index]]
`, entrypoint: "postorder", args: [[8, 4, 12, 2, 6, 10, 14]] },
  { key: "tree_level_order", label: "Tree Level-Order Traversal", category: "trees", kind: "data_structure", description: "Use a queue to visit one tree level at a time.", complexity: "O(n)", source_code: `def level_order(tree):
    if not tree:
        return []
    queue = [0]
    result = []
    while queue:
        index = queue.pop(0)
        if index < len(tree) and tree[index] is not None:
            result.append(tree[index])
            queue.append(index * 2 + 1)
            queue.append(index * 2 + 2)
    return result
`, entrypoint: "level_order", args: [[8, 4, 12, 2, 6, 10, 14]] },
  { key: "tree_height", label: "Calculate Tree Height", category: "trees", kind: "data_structure", description: "Combine the heights of the left and right subtrees.", complexity: "O(n)", source_code: `def tree_height(tree, index=0):
    if index >= len(tree) or tree[index] is None:
        return 0
    left = tree_height(tree, index * 2 + 1)
    right = tree_height(tree, index * 2 + 2)
    return 1 + max(left, right)
`, entrypoint: "tree_height", args: [[8, 4, 12, 2, 6, null, 14, 1]] },
  { key: "tree_count_nodes", label: "Count Tree Nodes", category: "trees", kind: "data_structure", description: "Recursively count every non-empty node.", complexity: "O(n)", source_code: `def count_nodes(tree, index=0):
    if index >= len(tree) or tree[index] is None:
        return 0
    left = count_nodes(tree, index * 2 + 1)
    right = count_nodes(tree, index * 2 + 2)
    return 1 + left + right
`, entrypoint: "count_nodes", args: [[8, 4, 12, 2, 6, null, 14]] },
  { key: "tree_sum", label: "Sum Tree Values", category: "trees", kind: "data_structure", description: "Add each root to the sums of its children.", complexity: "O(n)", source_code: `def sum_tree(tree, index=0):
    if index >= len(tree) or tree[index] is None:
        return 0
    left = sum_tree(tree, index * 2 + 1)
    right = sum_tree(tree, index * 2 + 2)
    return tree[index] + left + right
`, entrypoint: "sum_tree", args: [[8, 4, 12, 2, 6, 10, 14]] },
  { key: "tree_contains", label: "Search a Binary Tree", category: "trees", kind: "data_structure", description: "Check the root, then search both subtrees.", complexity: "O(n)", source_code: `def tree_contains(tree, target, index=0):
    if index >= len(tree) or tree[index] is None:
        return False
    if tree[index] == target:
        return True
    return tree_contains(tree, target, index * 2 + 1) or tree_contains(tree, target, index * 2 + 2)
`, entrypoint: "tree_contains", args: [[8, 4, 12, 2, 6, 10, 14], 10] },
  { key: "bst_search", label: "Binary Search Tree Lookup", category: "trees", kind: "data_structure", description: "Choose only the left or right branch after each comparison.", complexity: "O(log n) balanced", source_code: `def bst_search(tree, target):
    index = 0
    while index < len(tree) and tree[index] is not None:
        if tree[index] == target:
            return index
        if target < tree[index]:
            index = index * 2 + 1
        else:
            index = index * 2 + 2
    return -1
`, entrypoint: "bst_search", args: [[8, 4, 12, 2, 6, 10, 14], 6] },
  { key: "tree_leaf_count", label: "Count Leaf Nodes", category: "trees", kind: "data_structure", description: "Recognize nodes that have no children.", complexity: "O(n)", source_code: `def count_leaves(tree, index=0):
    if index >= len(tree) or tree[index] is None:
        return 0
    left = index * 2 + 1
    right = index * 2 + 2
    left_empty = left >= len(tree) or tree[left] is None
    right_empty = right >= len(tree) or tree[right] is None
    if left_empty and right_empty:
        return 1
    return count_leaves(tree, left) + count_leaves(tree, right)
`, entrypoint: "count_leaves", args: [[8, 4, 12, 2, 6, null, 14]] },
];
