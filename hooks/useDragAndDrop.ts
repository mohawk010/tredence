"use client";

import { useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { NodeType } from "@/lib/types";
import { useWorkflowStore } from "./useWorkflowStore";

export function useDragAndDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);
  const dragTypeRef = useRef<NodeType | null>(null);

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: NodeType) => {
      dragTypeRef.current = nodeType;
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow") as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  return { onDragStart, onDragOver, onDrop };
}
