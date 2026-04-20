"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type PDFParseNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import { DocumentValidationIcon } from "@hugeicons/core-free-icons";

export function PDFParseNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as PDFParseNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.PDF_PARSE];

  return (
    <BaseNode id={id} type={NodeType.PDF_PARSE} selected={selected}>
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={DocumentValidationIcon}
            strokeWidth={2}
            className="size-4"
            style={{ color: config.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {nodeData.title || config.label}
          </p>
          <code className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground block mt-1.5 truncate">
            Source: {nodeData.fileUrlVariable}
          </code>
        </div>
      </div>
    </BaseNode>
  );
}
