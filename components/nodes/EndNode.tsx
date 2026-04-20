"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type EndNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Flag01Icon, File01Icon } from "@hugeicons/core-free-icons";

export function EndNode({ id, data, selected }: NodeProps) {
  const nodeData = data as EndNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.END];

  return (
    <BaseNode
      id={id}
      type={NodeType.END}
      selected={selected}
      showTargetHandle={true}
      showSourceHandle={false}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={Flag01Icon}
            strokeWidth={2}
            className="size-4"
            style={{ color: config.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {nodeData.message || "End"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Workflow complete
          </p>
          {nodeData.summaryFlag && (
            <Badge variant="secondary" className="mt-1.5 text-[9px] flex items-center gap-1">
              <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-2.5" /> Summary enabled
            </Badge>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
