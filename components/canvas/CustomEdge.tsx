"use client";

import React from "react";
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const deleteEdge = useWorkflowStore((s) => s.deleteEdge);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "var(--border)",
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="group absolute pointer-events-auto nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <Button
            variant="destructive"
            size="icon-xs"
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              deleteEdge(id);
            }}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
