"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type TaskNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Task01Icon, UserIcon, Calendar03Icon } from "@hugeicons/core-free-icons";

export function TaskNode({ id, data, selected }: NodeProps) {
  const nodeData = data as TaskNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.TASK];

  return (
    <BaseNode id={id} type={NodeType.TASK} selected={selected}>
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={Task01Icon}
            strokeWidth={2}
            className="size-4"
            style={{ color: config.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {nodeData.title || "New Task"}
          </p>
          {nodeData.description && (
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
              {nodeData.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {nodeData.assignee && (
              <Badge variant="outline" className="text-[9px] flex items-center gap-1">
                <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-2.5" /> {nodeData.assignee}
              </Badge>
            )}
            {nodeData.dueDate && (
              <Badge variant="outline" className="text-[9px] flex items-center gap-1">
                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-2.5" /> {nodeData.dueDate}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
