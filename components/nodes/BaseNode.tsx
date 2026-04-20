"use client";

import React from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { NodeType } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface BaseNodeProps {
  id: string;
  type: NodeType;
  selected?: boolean;
  children: React.ReactNode;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
}

export function BaseNode({
  id,
  type,
  selected,
  children,
  showSourceHandle = true,
  showTargetHandle = true,
}: BaseNodeProps) {
  const config = NODE_TYPE_CONFIGS[type];
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
  const { getNode } = useReactFlow();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative min-w-[200px] max-w-[280px] rounded-lg bg-card transition-all duration-150",
        "border border-border/60",
        "hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
        selected && "border-foreground/25 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_12px_rgba(0,0,0,0.08)]"
      )}
    >
      {/* Thin left accent strip */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ backgroundColor: config.color }}
      />

      {/* Delete button */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="destructive"
          size="icon-xs"
          onClick={handleDelete}
          className="rounded-full shadow-sm size-5"
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" />
        </Button>
      </div>

      {/* Node content */}
      <div className="py-2.5 pl-4 pr-3">{children}</div>

      {/* Handles */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2.5 !h-2.5 !rounded-full !border-2 !border-card !-top-1.5 !bg-muted-foreground/40 hover:!bg-foreground/60"
        />
      )}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !rounded-full !border-2 !border-card !-bottom-1.5 !bg-muted-foreground/40 hover:!bg-foreground/60"
        />
      )}
    </div>
  );
}
