"use client";

import React from "react";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { useSimulate } from "@/hooks/useSimulate";
import { useValidation } from "@/hooks/useValidation";
import { ExecutionTimeline } from "./ExecutionTimeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  Alert02Icon,
  Tick02Icon,
  Cancel01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface SandboxPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SandboxPanel({ open, onOpenChange }: SandboxPanelProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const { validationErrors, hasErrors, isValid } = useValidation(nodes, edges);
  const { result, isSimulating, error, simulate, reset } = useSimulate();

  const handleSimulate = async () => {
    reset();
    await simulate(nodes, edges);
  };

  const errorList = validationErrors.filter((e) => e.severity === "error");
  const warningList = validationErrors.filter((e) => e.severity === "warning");

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out",
        open ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Handle bar to drag/close */}
      <div className="flex justify-center">
        <button
          onClick={() => onOpenChange(false)}
          className="flex items-center gap-1 px-3 py-1 text-[10px] font-medium text-muted-foreground bg-card border border-b-0 border-border rounded-t-lg hover:bg-muted transition-colors"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
          Close Panel
        </button>
      </div>

      <div className="bg-card border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-foreground">Execution</h3>
              <Badge
                variant={isValid ? "secondary" : "destructive"}
                className="text-[9px]"
              >
                {isValid ? (
                  <span className="flex items-center gap-1">
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-2.5" />
                    Valid
                  </span>
                ) : (
                  `${errorList.length} error(s)`
                )}
              </Badge>
              {result && (
                <Badge
                  variant={result.success ? "secondary" : "destructive"}
                  className="text-[9px]"
                >
                  {result.success ? (
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-2.5" />
                      Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" />
                      Failed
                    </span>
                  )}
                </Badge>
              )}
            </div>

            <Button
              size="sm"
              onClick={handleSimulate}
              disabled={isSimulating || hasErrors}
            >
              {isSimulating ? (
                <>
                  <Spinner className="size-3" />
                  Running...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={PlayIcon} strokeWidth={2} className="size-3" />
                  Run Test
                </>
              )}
            </Button>
          </div>

          {/* Content area */}
          <ScrollArea className="max-h-[240px]">
            <div className="space-y-3">
              {/* Errors */}
              {errorList.length > 0 && (
                <div className="space-y-1.5">
                  {errorList.map((err, i) => (
                    <Alert key={i} variant="destructive" className="py-1.5 px-3">
                      <AlertDescription className="text-[11px] flex items-start gap-2">
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          strokeWidth={2}
                          className="size-3 shrink-0 mt-0.5"
                        />
                        {err.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {warningList.length > 0 && (
                <div className="space-y-1.5">
                  {warningList.map((warn, i) => (
                    <Alert key={i} className="py-1.5 px-3 border-amber-200 bg-amber-50/50">
                      <AlertDescription className="text-[11px] flex items-start gap-2 text-amber-700">
                        <HugeiconsIcon
                          icon={Alert02Icon}
                          strokeWidth={2}
                          className="size-3 shrink-0 mt-0.5"
                        />
                        {warn.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* All valid, no results yet */}
              {isValid && errorList.length === 0 && warningList.length === 0 && !result && (
                <p className="text-[11px] text-muted-foreground py-2">
                  Workflow is valid. Click Run Test to simulate execution.
                </p>
              )}

              {/* API error */}
              {error && (
                <Alert variant="destructive" className="py-1.5 px-3">
                  <AlertDescription className="text-[11px]">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Timeline results */}
              {result && (
                <div>
                  <Separator className="mb-3" />
                  <ExecutionTimeline steps={result.steps} />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
