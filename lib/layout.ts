import dagre from "dagre";
import type { WorkflowNode, WorkflowEdge } from "./types";
import { Position } from "@xyflow/react";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 260; // Approximate width of BaseNode
const nodeHeight = 120; // Approximate average height

export function getAutoLayoutedElements(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  direction: "TB" | "LR" = "TB"
): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      selected: false,
    };

    return newNode as WorkflowNode;
  });

  return { nodes: newNodes, edges };
}
