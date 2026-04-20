"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type AutomatedStepNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain01Icon, FlashIcon } from "@hugeicons/core-free-icons";

export function AutomatedStepNode({ id, data, selected }: NodeProps) {
  const nodeData = data as AutomatedStepNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.AUTOMATED_STEP];

  return (
    <BaseNode id={id} type={NodeType.AUTOMATED_STEP} selected={selected}>
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={AiBrain01Icon}
            strokeWidth={2}
            className="size-4"
            style={{ color: config.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {nodeData.title || "Automated Action"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            System action
          </p>
          {nodeData.actionId && (
            <Badge variant="secondary" className="mt-1.5 text-[9px] flex items-center gap-1">
              <HugeiconsIcon icon={FlashIcon} strokeWidth={2} className="size-2.5" /> {nodeData.actionId.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
