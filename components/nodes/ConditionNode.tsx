"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type ConditionNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { GitBranchIcon } from "@hugeicons/core-free-icons";
import { Handle, Position } from "@xyflow/react";

export function ConditionNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ConditionNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.CONDITION];

  return (
    <div className="relative">
      <BaseNode
        id={id}
        type={NodeType.CONDITION}
        selected={selected}
        showSourceHandle={false}
        showTargetHandle={true}
      >
        <div className="flex items-start gap-2.5">
          <div
            className="flex items-center justify-center size-8 rounded-lg shrink-0"
            style={{ backgroundColor: config.iconBg }}
          >
            <HugeiconsIcon
              icon={GitBranchIcon}
              strokeWidth={2}
              className="size-4"
              style={{ color: config.color }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {nodeData.title || "Condition"}
            </p>
            <div className="flex flex-col mt-1.5 gap-1">
              <code className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground w-fit font-mono">
                {nodeData.conditionVariable || "var"} {nodeData.conditionOperator || "=="} &quot;{nodeData.conditionValue || "val"}&quot;
              </code>
            </div>
          </div>
        </div>
      </BaseNode>

      {/* True Handle (Right side) */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="!w-2.5 !h-2.5 !rounded-full !border-2 !border-card !-right-1.5 !bg-emerald-500"
      />
      <div className="absolute top-1/2 -right-9 -translate-y-1/2 nodrag pointer-events-none">
         <span className="text-[8px] font-medium text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">T</span>
      </div>

      {/* False Handle (Left side) */}
      <Handle
        type="source"
        position={Position.Left}
        id="false"
        className="!w-2.5 !h-2.5 !rounded-full !border-2 !border-card !-left-1.5 !bg-red-500"
      />
      <div className="absolute top-1/2 -left-9 -translate-y-1/2 nodrag pointer-events-none">
         <span className="text-[8px] font-medium text-red-600 bg-red-50 px-1 py-0.5 rounded border border-red-200">F</span>
      </div>
    </div>
  );
}
