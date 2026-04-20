"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { NodeType, type SimulationStep } from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  Cancel01Icon,
  Clock01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";

interface ExecutionTimelineProps {
  steps: SimulationStep[];
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock01Icon,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "Pending",
  },
  running: {
    icon: Clock01Icon,
    color: "text-blue-500",
    bg: "bg-blue-50",
    label: "Running",
  },
  success: {
    icon: Tick02Icon,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    label: "Success",
  },
  error: {
    icon: Cancel01Icon,
    color: "text-red-500",
    bg: "bg-red-50",
    label: "Failed",
  },
  skipped: {
    icon: Alert02Icon,
    color: "text-amber-500",
    bg: "bg-amber-50",
    label: "Skipped",
  },
};

export function ExecutionTimeline({ steps }: ExecutionTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs text-muted-foreground">No steps to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const statusConfig = STATUS_CONFIG[step.status];
        const nodeConfig = NODE_TYPE_CONFIGS[step.nodeType] || NODE_TYPE_CONFIGS[NodeType.TASK];
        const isLast = index === steps.length - 1;

        return (
          <div key={step.nodeId + index} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center size-6 rounded-full border-2 shrink-0",
                  statusConfig.bg
                )}
                style={{ borderColor: nodeConfig.color }}
              >
                <HugeiconsIcon
                  icon={statusConfig.icon}
                  strokeWidth={2}
                  className={cn("size-3", statusConfig.color)}
                />
              </div>
              {!isLast && (
                <div className="w-px flex-1 min-h-[24px] bg-border" />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-4", isLast && "pb-0")}>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-foreground">
                  {step.title}
                </p>
                <Badge
                  variant={
                    step.status === "error"
                      ? "destructive"
                      : step.status === "success"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-[9px]"
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {step.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
