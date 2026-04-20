"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type CSVTriggerNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload04Icon } from "@hugeicons/core-free-icons";

export function CSVTriggerNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CSVTriggerNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.CSV_TRIGGER];

  return (
    <BaseNode
      id={id}
      type={NodeType.CSV_TRIGGER}
      selected={selected}
      showSourceHandle={true}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={Upload04Icon}
            strokeWidth={2}
            className="size-4"
            style={{ color: config.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {nodeData.title || config.label}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate leading-tight">
            Triggers iteration over rows
          </p>
        </div>
      </div>
    </BaseNode>
  );
}
