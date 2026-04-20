"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type GeminiEvalNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import { Brain02Icon } from "@hugeicons/core-free-icons";

export function GeminiEvalNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as GeminiEvalNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.GEMINI_EVAL];

  return (
    <BaseNode id={id} type={NodeType.GEMINI_EVAL} selected={selected}>
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={Brain02Icon}
            strokeWidth={2}
            className="size-4"
            style={{ color: config.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {nodeData.title || config.label}
          </p>
          <p className="text-[9px] font-medium mt-1 truncate">
            Input: {nodeData.resumeTextVariable}
          </p>
        </div>
      </div>
    </BaseNode>
  );
}
