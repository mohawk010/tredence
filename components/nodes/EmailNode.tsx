"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type EmailNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";

export function EmailNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as EmailNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.EMAIL];

  return (
    <BaseNode id={id} type={NodeType.EMAIL} selected={selected}>
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={Mail01Icon}
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
            To: {nodeData.to}
          </p>
        </div>
      </div>
    </BaseNode>
  );
}
