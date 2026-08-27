"use client";

import { motion } from "framer-motion";
import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

import type { VisualizerProps } from "@/components/visualizers/types";

type RecordValue = Record<string, unknown>;
const isRecord = (value: unknown): value is RecordValue => Boolean(value) && typeof value === "object" && !Array.isArray(value);

function short(value: unknown, limit = 24): string {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (text === undefined) return String(value);
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function StructureFlow({ nodes, edges, title, traversal = false }: { nodes: Node[]; edges: Edge[]; title: string; traversal?: boolean }) {
  return (
    <div className="relative h-full min-h-[360px] w-full">
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg bg-surface/85 px-3 py-2 shadow-sm backdrop-blur">
        <div className="text-xs font-semibold">{title}</div>
        <div className="text-[10px] text-foreground/45">Whole structure · scroll to zoom</div>
        {traversal && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-foreground/55">
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />active</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />neighbor</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400" />frontier</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />visited</span>
          </div>
        )}
      </div>
      <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.25 }} nodesDraggable={false} nodesConnectable={false} proOptions={{ hideAttribution: true }} minZoom={0.1}>
        <Background gap={22} size={1} color="rgb(120 120 130 / .16)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

function objectTree(value: unknown): { nodes: Node[]; edges: Edge[] } | null {
  if (!isRecord(value)) return null;
  const hasTreeShape = "left" in value || "right" in value || Array.isArray(value.children);
  if (!hasTreeShape) return null;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let leaf = 0;
  let nodeNumber = 0;
  function visit(item: unknown, depth: number, parent: string | null, edgeLabel: string): number | null {
    if (item === null || item === undefined || (typeof item === "string" && item.startsWith("<"))) return null;
    const id = `tree-${nodeNumber++}`;
    const record = isRecord(item) ? item : null;
    const label = record ? record.val ?? record.value ?? record.key ?? record.name ?? record.__type__ ?? "node" : item;
    const children: [string, unknown][] = record
      ? [
          ...(record.left !== undefined ? [["L", record.left] as [string, unknown]] : []),
          ...(record.right !== undefined ? [["R", record.right] as [string, unknown]] : []),
          ...(Array.isArray(record.children) ? record.children.map((child, index) => [String(index), child] as [string, unknown]) : []),
        ]
      : [];
    const childXs = children.map(([name, child]) => visit(child, depth + 1, id, name)).filter((x): x is number => x !== null);
    const x = childXs.length ? (childXs[0]! + childXs[childXs.length - 1]!) / 2 : leaf++ * 170;
    nodes.push({ id, position: { x, y: depth * 110 }, data: { label: short(label) }, style: { minWidth: 72, borderRadius: 18, border: "2px solid rgb(99 102 241 / .65)", background: "rgb(99 102 241 / .12)", color: "inherit", fontFamily: "monospace", fontWeight: 700, textAlign: "center" } });
    if (parent) edges.push({ id: `${parent}-${id}`, source: parent, target: id, label: edgeLabel, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "rgb(99 102 241 / .5)" } });
    return x;
  }
  visit(value, 0, null, "");
  return nodes.length ? { nodes, edges } : null;
}

function arrayTree(items: unknown[], activeIndex: number | null, visitedValues: Set<string>): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const levels = Math.max(1, Math.ceil(Math.log2(items.length + 1)));
  items.forEach((value, index) => {
    if (value === null) return;
    const depth = Math.floor(Math.log2(index + 1));
    const firstAtDepth = 2 ** depth - 1;
    const position = index - firstAtDepth;
    const gap = 150 * 2 ** Math.max(0, levels - depth - 2);
    const active = activeIndex === index;
    const visited = visitedValues.has(String(value));
    nodes.push({ id: `array-tree-${index}`, position: { x: position * gap, y: depth * 115 }, data: { label: short(value) }, style: { minWidth: 64, borderRadius: 999, border: active ? "3px solid rgb(99 102 241)" : visited ? "2px solid rgb(34 197 94)" : "2px solid rgb(99 102 241 / .35)", background: active ? "rgb(99 102 241 / .25)" : visited ? "rgb(34 197 94 / .14)" : "rgb(99 102 241 / .08)", color: "inherit", fontFamily: "monospace", fontWeight: 700, textAlign: "center", boxShadow: active ? "0 0 0 7px rgb(99 102 241 / .10)" : "none", transition: "all .3s ease" } });
    if (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (items[parent] !== null) edges.push({ id: `array-tree-edge-${index}`, source: `array-tree-${parent}`, target: `array-tree-${index}`, style: { stroke: "rgb(99 102 241 / .5)" } });
    }
  });
  return { nodes, edges };
}

function collectionValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (isRecord(value)) return Object.entries(value).filter(([, enabled]) => Boolean(enabled)).map(([key]) => key);
  return [];
}

function traversalState(variables: VisualizerProps["currentStep"]["memory_view"]["variables"], graphKeys: string[]) {
  const scalar = (pattern: RegExp) => variables.find((variable) => pattern.test(variable.name) && (typeof variable.value === "string" || typeof variable.value === "number"))?.value;
  const gather = (pattern: RegExp) => new Set(variables.filter((variable) => pattern.test(variable.name)).flatMap((variable) => collectionValues(variable.value)));
  const current = scalar(/^(node|current|vertex|u)$/i) ?? scalar(/^(source|start)$/i);
  const candidate = scalar(/^(neighbor|neighbour|next|v)$/i);
  return {
    current: current !== undefined && graphKeys.includes(String(current)) ? String(current) : null,
    candidate: candidate !== undefined && graphKeys.includes(String(candidate)) ? String(candidate) : null,
    visited: gather(/visited|seen|explored|closed/i),
    processed: gather(/order|result|path|processed/i),
    frontier: gather(/queue|stack|frontier|open|heap/i),
  };
}

function adjacencyGraph(graph: RecordValue, variables: VisualizerProps["currentStep"]["memory_view"]["variables"]): { nodes: Node[]; edges: Edge[] } {
  const keys = Object.keys(graph);
  const radius = Math.max(130, keys.length * 22);
  const state = traversalState(variables, keys);
  const nodes: Node[] = keys.map((key, index) => {
    const status = key === state.current ? "active" : key === state.candidate ? "neighbor" : state.processed.has(key) ? "processed" : state.frontier.has(key) ? "frontier" : state.visited.has(key) ? "visited" : "unvisited";
    const colors = status === "active"
      ? { border: "rgb(99 102 241)", background: "rgb(99 102 241 / .28)", shadow: "0 0 0 9px rgb(99 102 241 / .12)" }
      : status === "neighbor"
        ? { border: "rgb(251 191 36)", background: "rgb(251 191 36 / .20)", shadow: "0 0 0 6px rgb(251 191 36 / .10)" }
        : status === "frontier"
          ? { border: "rgb(56 189 248)", background: "rgb(56 189 248 / .16)", shadow: "none" }
          : status === "processed"
            ? { border: "rgb(34 197 94)", background: "rgb(34 197 94 / .20)", shadow: "none" }
            : status === "visited"
              ? { border: "rgb(34 197 94 / .7)", background: "rgb(34 197 94 / .10)", shadow: "none" }
              : { border: "rgb(120 120 130 / .35)", background: "rgb(120 120 130 / .06)", shadow: "none" };
    return {
      id: key,
      position: { x: Math.cos((index / keys.length) * Math.PI * 2) * radius, y: Math.sin((index / keys.length) * Math.PI * 2) * radius },
      data: { label: <div className="text-center"><div>{key}</div><div className="mt-0.5 text-[8px] font-normal uppercase opacity-55">{status}</div></div> },
      style: { width: 70, height: 70, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, border: `3px solid ${colors.border}`, background: colors.background, boxShadow: colors.shadow, color: "inherit", fontFamily: "monospace", fontWeight: 700, transition: "all .3s ease" },
    };
  });
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (const [from, neighbors] of Object.entries(graph)) {
    if (!Array.isArray(neighbors)) continue;
    for (const neighbor of neighbors) {
      const to = String(neighbor);
      if (!keys.includes(to)) continue;
      const pair = [from, to].sort().join("::");
      if (seen.has(pair)) continue;
      seen.add(pair);
      const active = (from === state.current && to === state.candidate) || (to === state.current && from === state.candidate);
      const traversed = (state.visited.has(from) || state.processed.has(from)) && (state.visited.has(to) || state.processed.has(to));
      edges.push({ id: pair, source: from, target: to, animated: active, style: { stroke: active ? "rgb(251 191 36)" : traversed ? "rgb(34 197 94 / .7)" : "rgb(120 120 130 / .28)", strokeWidth: active ? 5 : traversed ? 3 : 2, transition: "all .3s ease" } });
    }
  }
  return { nodes, edges };
}

function ArrayView({ name, items, pointers, activeIndices, changedIndices }: { name: string; items: unknown[]; pointers: { name: string; value: number }[]; activeIndices: Set<number>; changedIndices: Set<number> }) {
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-auto px-4">
      <div className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">{name} · {items.length} items</div>
      <div className="flex min-w-max items-end gap-2 pb-16">
        {items.map((item, index) => {
          const labels = pointers.filter((pointer) => pointer.value === index);
          const active = activeIndices.has(index);
          const changed = changedIndices.has(index);
          return (
            <div key={index} className="relative flex flex-col items-center">
              <motion.div layout animate={{ y: active ? -6 : 0, scale: changed ? 1.08 : 1 }} className={`flex h-16 min-w-16 items-center justify-center rounded-xl border-2 px-3 font-mono text-sm font-bold shadow-sm transition-colors ${active ? "border-accent bg-accent/25 ring-4 ring-accent/10" : changed ? "border-emerald-500 bg-emerald-500/15" : "border-accent/25 bg-accent/5"}`}>{short(item, 14)}</motion.div>
              <span className="mt-1 font-mono text-[10px] text-foreground/35">{index}</span>
              {labels.length > 0 && <div className="absolute top-[92px] flex flex-col items-center"><span className="text-accent">↑</span><span className="font-mono text-[10px] font-bold text-accent">{labels.map((item) => item.name).join(" · ")}</span></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DataStructureVisualizer({ lesson, currentStep, previousStep }: VisualizerProps) {
  const variables = currentStep.memory_view.variables;
  const arrays = variables.filter((variable) => Array.isArray(variable.value));
  const records = variables.filter((variable) => isRecord(variable.value));
  const pointers = variables.filter((variable): variable is typeof variable & { value: number } => typeof variable.value === "number").map((variable) => ({ name: variable.name, value: variable.value }));

  const objectCandidate = records.map((variable) => ({ variable, tree: objectTree(variable.value) })).find((candidate) => candidate.tree);
  if (objectCandidate?.tree) return <StructureFlow {...objectCandidate.tree} title={`${objectCandidate.variable.name} · object tree`} />;

  const adjacency = records.find((variable) => {
    const values = Object.values(variable.value as RecordValue);
    return values.length > 0 && values.every(Array.isArray);
  });
  if (adjacency) return <StructureFlow {...adjacencyGraph(adjacency.value as RecordValue, variables)} title={`${adjacency.name} · dynamic traversal`} traversal />;

  const treeArray = arrays.find((variable) => /tree|heap|root|node/i.test(variable.name)) ?? (/(left|right|2\s*\*|preorder|inorder|postorder)/i.test(lesson.source_code) ? arrays[0] : undefined);
  const visitedValues = new Set(variables.filter((variable) => /visited|order|result|path/i.test(variable.name)).flatMap((variable) => collectionValues(variable.value)));
  const activeTreeIndex = pointers.find((pointer) => /^(index|current|node|i|root)$/i.test(pointer.name))?.value ?? null;
  if (treeArray) return <StructureFlow {...arrayTree(treeArray.value as unknown[], activeTreeIndex, visitedValues)} title={`${treeArray.name} · dynamic tree traversal`} traversal />;

  const primaryArray = arrays.sort((a, b) => (b.value as unknown[]).length - (a.value as unknown[]).length)[0];
  if (primaryArray) {
    const activeIndices = new Set(currentStep.animation_hints.flatMap((hint) => hint.target_indices));
    pointers.forEach((pointer) => activeIndices.add(pointer.value));
    const previousArray = previousStep?.memory_view.variables.find((variable) => variable.name === primaryArray.name)?.value;
    const changedIndices = new Set<number>();
    if (Array.isArray(previousArray)) (primaryArray.value as unknown[]).forEach((value, index) => { if (JSON.stringify(value) !== JSON.stringify(previousArray[index])) changedIndices.add(index); });
    return <ArrayView name={primaryArray.name} items={primaryArray.value as unknown[]} pointers={pointers} activeIndices={activeIndices} changedIndices={changedIndices} />;
  }

  if (records[0]) {
    return (
      <div className="flex h-full flex-col justify-center overflow-auto p-6">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/40">{records[0].name} · key/value map</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(records[0].value as RecordValue).map(([key, value]) => {
            const previousRecord = previousStep?.memory_view.variables.find((variable) => variable.name === records[0]!.name)?.value;
            const changed = isRecord(previousRecord) && JSON.stringify(previousRecord[key]) !== JSON.stringify(value);
            return <motion.div layout animate={{ scale: changed ? 1.04 : 1 }} key={key} className={`overflow-hidden rounded-xl border ${changed ? "border-emerald-500 bg-emerald-500/15" : "border-border-glass bg-accent/5"}`}><div className="border-b border-border-glass px-3 py-1.5 font-mono text-[10px] text-accent">{key}</div><div className="truncate px-3 py-3 font-mono text-sm font-semibold">{short(value)}</div></motion.div>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full content-center gap-3 overflow-auto p-6 sm:grid-cols-2 lg:grid-cols-3">
      {variables.map((variable) => <motion.div layout key={variable.name} className="rounded-xl border border-border-glass bg-accent/5 p-4"><div className="font-mono text-[10px] text-foreground/40">{variable.name}</div><div className="mt-2 truncate font-mono text-sm font-semibold">{short(variable.value, 60)}</div></motion.div>)}
    </div>
  );
}
