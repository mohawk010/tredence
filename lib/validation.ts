import type { WorkflowNode, WorkflowEdge, ValidationError } from "./types";
import { NodeType } from "./types";

/**
 * Detect cycles in the workflow graph using DFS.
 */
export function detectCycles(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[][] {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    const list = adj.get(e.source);
    if (list) list.push(e.target);
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(nodeId: string, path: string[]): void {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path]);
      } else if (recStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
      }
    }

    recStack.delete(nodeId);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  }

  return cycles;
}

/**
 * Find nodes that have no connections (orphan nodes).
 */
export function findOrphans(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
  const connected = new Set<string>();
  edges.forEach((e) => {
    connected.add(e.source);
    connected.add(e.target);
  });

  return nodes
    .filter((n) => !connected.has(n.id))
    .map((n) => n.id);
}

/**
 * Topological sort of the workflow graph.
 * Returns null if the graph has cycles.
 */
export function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] | null {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  const nodeMap = new Map<string, WorkflowNode>();

  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
    nodeMap.set(n.id, n);
  });

  edges.forEach((e) => {
    const list = adj.get(e.source);
    if (list) list.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const sorted: WorkflowNode[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeMap.get(id);
    if (node) sorted.push(node);

    const neighbors = adj.get(id) || [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return sorted.length === nodes.length ? sorted : null;
}

/**
 * Full structural validation of the workflow.
 */
export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for empty workflow
  if (nodes.length === 0) {
    errors.push({
      message: "Workflow is empty. Add at least a Start and End node.",
      severity: "error",
    });
    return errors;
  }

  // Check for Start nodes
  const startNodes = nodes.filter((n) => n.type === NodeType.START);
  if (startNodes.length === 0) {
    errors.push({
      message: "Workflow must have exactly one Start node.",
      severity: "error",
    });
  } else if (startNodes.length > 1) {
    startNodes.slice(1).forEach((n) => {
      errors.push({
        nodeId: n.id,
        message: "Only one Start node is allowed.",
        severity: "error",
      });
    });
  }

  // Check for End nodes
  const endNodes = nodes.filter((n) => n.type === NodeType.END);
  if (endNodes.length === 0) {
    errors.push({
      message: "Workflow must have at least one End node.",
      severity: "error",
    });
  }

  // Start node should have no incoming edges
  startNodes.forEach((sn) => {
    const incoming = edges.filter((e) => e.target === sn.id);
    if (incoming.length > 0) {
      errors.push({
        nodeId: sn.id,
        message: "Start node must not have incoming connections.",
        severity: "error",
      });
    }
  });

  // End nodes should have no outgoing edges
  endNodes.forEach((en) => {
    const outgoing = edges.filter((e) => e.source === en.id);
    if (outgoing.length > 0) {
      errors.push({
        nodeId: en.id,
        message: "End node must not have outgoing connections.",
        severity: "error",
      });
    }
  });

  // Check for orphan nodes
  const orphans = findOrphans(nodes, edges);
  // Allow single-node workflows, only warn for multi-node
  if (nodes.length > 1) {
    orphans.forEach((id) => {
      const node = nodes.find((n) => n.id === id);
      errors.push({
        nodeId: id,
        message: `Node "${(node?.data as { title?: string })?.title || id}" is not connected to any other node.`,
        severity: "warning",
      });
    });
  }

  // Check for cycles
  const cycles = detectCycles(nodes, edges);
  if (cycles.length > 0) {
    errors.push({
      message: `Workflow contains ${cycles.length} cycle(s). Cycles are not allowed.`,
      severity: "error",
    });
  }

  // Check required fields
  nodes.forEach((node) => {
    const data = node.data as Record<string, unknown>;
    if ("title" in data && (!data.title || (data.title as string).trim() === "")) {
      errors.push({
        nodeId: node.id,
        message: `Node is missing a required title.`,
        severity: "warning",
      });
    }
  });

  return errors;
}
