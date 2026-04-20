"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { useWorkflows, type WorkflowRecord } from "@/hooks/useWorkflows";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudUploadIcon,
  CloudDownloadIcon,
  Delete02Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";

interface WorkflowLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowLibraryDialog({
  open,
  onOpenChange,
}: WorkflowLibraryDialogProps) {
  const { workflows, isLoading, error, deleteWorkflow } = useWorkflows();
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);

  const handleLoad = (record: WorkflowRecord) => {
    // Basic conversion mapping JSON structures back back to elements. 
    // Prisma JSON typings need generic bypass for safe hydration.
    const nodes = record.nodes as any[];
    const edges = record.edges as any[];
    loadWorkflow(nodes, edges, record.name, record.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={CloudDownloadIcon} strokeWidth={2} className="size-4 text-primary" />
            Cloud Workflow Library
          </DialogTitle>
          <DialogDescription>
            Open an existing workflow template from the database
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Spinner className="size-6 mb-2" />
            <p className="text-sm">Fetching workflows...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
            <HugeiconsIcon icon={CloudUploadIcon} className="size-8 mb-3 opacity-20" />
            <p className="text-sm font-medium">No workflows found</p>
            <p className="text-xs">Save a local workflow to the cloud first.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-4 px-4 h-[300px]">
            <div className="space-y-3">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-start justify-between p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <h4 className="text-sm font-semibold truncate text-foreground cursor-pointer hover:underline" onClick={() => handleLoad(wf)}>
                      {wf.name}
                    </h4>
                    {wf.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {wf.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        Nodes: {(wf.nodes as any[]).length}
                      </span>
                      <span className="flex items-center gap-1">
                        Updated {formatDistanceToNow(new Date(wf.updatedAt))} ago
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => handleLoad(wf)}>
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this workflow?")) {
                          deleteWorkflow(wf.id);
                        }
                      }}
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
