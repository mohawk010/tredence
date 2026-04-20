"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type StartNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon } from "@hugeicons/core-free-icons";

export function StartNode({ id, data, selected }: NodeProps) {
  const nodeData = data as StartNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.START];
  const metadataCount = Object.keys(nodeData.metadata || {}).length;

  return (
    <BaseNode
      id={id}
      type={NodeType.START}
      selected={selected}
      showTargetHandle={false}
      showSourceHandle={true}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={PlayIcon}
            strokeWidth={2}
            className="size-4"
            style={{ color: config.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {nodeData.title || "Start"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Workflow entry point
          </p>
          {metadataCount > 0 && (
            <Badge variant="secondary" className="mt-1.5 text-[9px]">
              {metadataCount} metadata field{metadataCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
