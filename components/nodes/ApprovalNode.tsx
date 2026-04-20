"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type ApprovalNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon, LockIcon } from "@hugeicons/core-free-icons";

export function ApprovalNode({ id, data, selected }: NodeProps) {
  const nodeData = data as ApprovalNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.APPROVAL];

  return (
    <BaseNode id={id} type={NodeType.APPROVAL} selected={selected}>
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={CheckmarkBadge01Icon}
            strokeWidth={2}
            className="size-4"
            style={{ color: config.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {nodeData.title || "Approval Required"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Approval step
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {nodeData.approverRole && (
              <Badge variant="outline" className="text-[9px] flex items-center gap-1">
                <HugeiconsIcon icon={LockIcon} strokeWidth={2} className="size-2.5" /> {nodeData.approverRole}
              </Badge>
            )}
            {nodeData.autoApproveThreshold > 0 && (
              <Badge variant="secondary" className="text-[9px]">
                Auto {"<="} {nodeData.autoApproveThreshold}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
