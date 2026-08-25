"use client";

import { useMemo } from "react";
import ReactFlow, { Background, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

import type { CallFrame } from "@/components/visualizers/recursion/reconstructCallStack";

export function CallStackFlow({ frames }: { frames: CallFrame[] }) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = frames.map((frame, idx) => ({
      id: `depth-${frame.depth}`,
      position: { x: idx * 40, y: idx * 90 },
      data: { label: `fibonacci_recursive(n=${String(frame.n)})` },
      style: {
        borderRadius: 16,
        border: "2px solid rgb(99 102 241)",
        background: "rgb(99 102 241 / 0.1)",
        padding: 10,
        fontFamily: "monospace",
        fontSize: 12,
        width: 220,
      },
    }));
    const edges: Edge[] = frames.slice(1).map((frame) => ({
      id: `edge-${frame.depth}`,
      source: `depth-${frame.depth - 1}`,
      target: `depth-${frame.depth}`,
      animated: true,
    }));
    return { nodes, edges };
  }, [frames]);

  return (
    <div className="h-full w-full">
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background />
      </ReactFlow>
    </div>
  );
}
