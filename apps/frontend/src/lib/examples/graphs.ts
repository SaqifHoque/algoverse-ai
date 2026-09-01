import type { ExampleSnippet } from "@/lib/examples/types";

// Graph is an adjacency list. JSON object keys are always strings once parsed on the backend,
// so node labels are kept as strings throughout (rather than mixing int/str identity).
const SAMPLE_GRAPH = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D"],
  D: ["B", "C", "E"],
  E: ["D"],
};

export const GRAPH_EXAMPLES: ExampleSnippet[] = [
  {
    key: "bfs",
    label: "Breadth-First Search (BFS)",
    category: "graphs",
    source_code:
      "def bfs(graph, start):\n    visited = [start]\n    queue = [start]\n    order = []\n    while queue:\n        node = queue.pop(0)\n        order.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.append(neighbor)\n                queue.append(neighbor)\n    return order\n",
    entrypoint: "bfs",
    args: [SAMPLE_GRAPH, "A"],
  },
  {
    key: "dfs",
    label: "Depth-First Search (DFS, recursive)",
    category: "graphs",
    source_code:
      "def dfs(graph, node, visited=None):\n    if visited is None:\n        visited = []\n    if node in visited:\n        return visited\n    visited.append(node)\n    for neighbor in graph[node]:\n        dfs(graph, neighbor, visited)\n    return visited\n",
    entrypoint: "dfs",
    args: [SAMPLE_GRAPH, "A"],
  },
];
