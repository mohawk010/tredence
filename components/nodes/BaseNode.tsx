"use client";

import React from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { NodeType } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { SharedNodeData } from "@/lib/types";

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
  const nodeData = useWorkflowStore((s) => s.nodes.find((n) => n.id === id)?.data) as SharedNodeData | undefined;
  const executionStatus = nodeData?.executionStatus;

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

      {/* Execution Status — border glow + top badge */}
      {executionStatus && (
        <>
          {/* Colored ring on the whole node */}
          <div className={cn(
            "absolute inset-0 rounded-lg pointer-events-none transition-all duration-300",
            executionStatus === "running" && "ring-2 ring-blue-400/70 shadow-[0_0_12px_2px_rgba(96,165,250,0.35)]",
            executionStatus === "success" && "ring-2 ring-green-400/70 shadow-[0_0_12px_2px_rgba(74,222,128,0.35)]",
            executionStatus === "failed"  && "ring-2 ring-red-500/70 shadow-[0_0_12px_2px_rgba(239,68,68,0.4)]",
            executionStatus === "skipped" && "ring-1 ring-muted-foreground/30",
          )} />

          {/* Status pill at top-right */}
          <div className={cn(
            "absolute -top-3 right-3 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm border border-background/80",
            executionStatus === "running" && "bg-blue-500 text-white",
            executionStatus === "success" && "bg-green-500 text-white",
            executionStatus === "failed"  && "bg-red-500 text-white",
            executionStatus === "skipped" && "bg-muted-foreground/60 text-white",
          )}>
            {executionStatus === "running" && <><Spinner className="size-2.5 text-white" /> Running</>}
            {executionStatus === "success" && <><HugeiconsIcon icon={Tick02Icon} strokeWidth={3} className="size-2.5" /> Success</>}
            {executionStatus === "failed"  && <><HugeiconsIcon icon={Cancel01Icon} strokeWidth={3} className="size-2.5" /> Failed</>}
            {executionStatus === "skipped" && <>— Skipped</>}
          </div>
        </>
      )}

      {/* Node content */}
      <div className="py-2.5 pl-4 pr-3">{children}</div>

      {/* Handles */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5! h-2.5! rounded-full! border-2! border-card! -top-1.5! bg-muted-foreground/40! hover:bg-foreground/60!"
        />
      )}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5! h-2.5! rounded-full! border-2! border-card! -bottom-1.5! bg-muted-foreground/40! hover:bg-foreground/60!"
        />
      )}
    </div>
  );
}
