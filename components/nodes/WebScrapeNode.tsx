"use client";

import React from "react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeType, type WebScrapeNodeData } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import { BrowserIcon } from "@hugeicons/core-free-icons";

export function WebScrapeNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as WebScrapeNodeData;
  const config = NODE_TYPE_CONFIGS[NodeType.WEB_SCRAPE];

  return (
    <BaseNode id={id} type={NodeType.WEB_SCRAPE} selected={selected}>
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-lg shrink-0"
          style={{ backgroundColor: config.iconBg }}
        >
          <HugeiconsIcon
            icon={BrowserIcon}
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
            Scrapes URL using Puppeteer
          </p>
          {nodeData.url && (
            <code className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground block mt-1.5 truncate">
              URL: {nodeData.url}
            </code>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
