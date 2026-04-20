"use client";

import React, { useState } from "react";
import { NodeType } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  Task01Icon,
  CheckmarkBadge01Icon,
  AiBrain01Icon,
  GitBranchIcon,
  Flag01Icon,
  Upload04Icon,
  BrowserIcon,
  DocumentValidationIcon,
  Brain02Icon,
  Mail01Icon,
  Search01Icon
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";

const NODE_ICONS = {
  [NodeType.START]: PlayIcon,
  [NodeType.TASK]: Task01Icon,
  [NodeType.APPROVAL]: CheckmarkBadge01Icon,
  [NodeType.AUTOMATED_STEP]: AiBrain01Icon,
  [NodeType.CONDITION]: GitBranchIcon,
  [NodeType.END]: Flag01Icon,
  [NodeType.CSV_TRIGGER]: Upload04Icon,
  [NodeType.WEB_SCRAPE]: BrowserIcon,
  [NodeType.PDF_PARSE]: DocumentValidationIcon,
  [NodeType.GEMINI_EVAL]: Brain02Icon,
  [NodeType.EMAIL]: Mail01Icon,
};

const NODE_ORDER: NodeType[] = [
  NodeType.START,
  NodeType.CSV_TRIGGER,
  NodeType.TASK,
  NodeType.APPROVAL,
  NodeType.AUTOMATED_STEP,
  NodeType.WEB_SCRAPE,
  NodeType.PDF_PARSE,
  NodeType.GEMINI_EVAL,
  NodeType.EMAIL,
  NodeType.CONDITION,
  NodeType.END,
];

export function NodePalette() {
  const { onDragStart } = useDragAndDrop();
  const [search, setSearch] = useState("");

  const filteredNodes = NODE_ORDER.filter((type) => {
    const config = NODE_TYPE_CONFIGS[type];
    const term = search.toLowerCase();
    return (
      config.label.toLowerCase().includes(term) ||
      config.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3">
        <div className="relative">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..." 
            className="h-7 text-xs pl-7"
          />
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-2">
          {filteredNodes.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-4">No nodes found</p>
          ) : (
            filteredNodes.map((type) => {
              const config = NODE_TYPE_CONFIGS[type];
              const Icon = NODE_ICONS[type];
              return (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => onDragStart(e, type)}
                  className="flex items-center gap-2.5 p-2 rounded-lg border border-border/50 bg-card cursor-grab active:cursor-grabbing hover:border-border hover:shadow-sm transition-all duration-150 select-none"
                  style={{
                    borderLeftWidth: "3px",
                    borderLeftColor: config.color,
                  }}
                >
                  <div
                    className="flex items-center justify-center size-6 rounded-md shrink-0"
                    style={{ backgroundColor: config.iconBg }}
                  >
                    <HugeiconsIcon
                      icon={Icon}
                      strokeWidth={2}
                      className="size-3.5"
                      style={{ color: config.color }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {config.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {config.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
