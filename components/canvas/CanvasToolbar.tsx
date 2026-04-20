"use client";

import React, { useState, useEffect } from "react";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { serializeWorkflow } from "@/lib/serialization";
import { useWorkflows } from "@/hooks/useWorkflows";
import { WorkflowLibraryDialog } from "@/components/forms/WorkflowLibraryDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UndoIcon,
  RedoIcon,
  CloudUploadIcon,
  CloudDownloadIcon,
  PlayIcon,
  Delete02Icon,
  Sun01Icon,
  Moon02Icon,
  AiBrain01Icon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";

interface CanvasToolbarProps {
  onOpenSandbox: () => void;
}

export function CanvasToolbar({ onOpenSandbox }: CanvasToolbarProps) {
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const setWorkflowId = useWorkflowStore((s) => s.setWorkflowId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);
  const past = useWorkflowStore((s) => s.past);
  const future = useWorkflowStore((s) => s.future);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const clearWorkflow = useWorkflowStore((s) => s.clearWorkflow);
  const [isEditingName, setIsEditingName] = useState(false);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { saveWorkflow } = useWorkflows();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveToCloud = async () => {
    try {
      setIsSaving(true);
      const workflow = serializeWorkflow(nodes, edges, workflowName);
      const saved = await saveWorkflow(workflow.name, workflow.nodes, workflow.edges, workflowId);
      setWorkflowId(saved.id);
      loadWorkflow(nodes, edges, saved.name, saved.id);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save workflow to cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoLayout = () => {
    import("@/lib/layout").then(({ getAutoLayoutedElements }) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getAutoLayoutedElements(
        nodes,
        edges,
        "TB"
      );
      loadWorkflow(layoutedNodes, layoutedEdges, workflowName, workflowId);
    });
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-card/80 backdrop-blur-sm">
      {/* Left: Workflow name */}
      <div className="flex items-center gap-3">
        {isEditingName ? (
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
            className="h-7 w-[200px] text-sm font-semibold"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {workflowName}
          </button>
        )}
      </div>

      {/* Center: Controls */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleAutoLayout}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4"><path d="M4.5 1C4.22386 1 4 1.22386 4 1.5V3.5C4 3.77614 4.22386 4 4.5 4H10.5C10.7761 4 11 3.77614 11 3.5V1.5C11 1.22386 10.7761 1 10.5 1H4.5ZM4.5 11C4.22386 11 4 11.22386 4 11.5V13.5C4 13.7761 4.22386 14 4.5 14H10.5C10.7761 14 11 13.7761 11 13.5V11.5C11 11.22386 10.7761 11 10.5 11H4.5ZM2.5 6C2.22386 6 2 6.22386 2 6.5V8.5C2 8.77614 2.22386 9 2.5 9H5.5C5.77614 9 6 8.77614 6 8.5V6.5C6 6.22386 5.77614 6 5.5 6H2.5ZM9.5 6C9.22386 6 9 6.22386 9 6.5V8.5C9 8.77614 9.22386 9 9.5 9H12.5C12.7761 9 13 8.77614 13 8.5V6.5C13 6.22386 12.7761 6 12.5 6H9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Auto Layout</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Templates */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 font-medium"
              onClick={() => {
                const proceed = confirm("Load Recruitment Template? This will clear the current canvas.");
                if (proceed) {
                  useWorkflowStore.getState().loadRecruitmentTemplate?.();
                }
              }}
            >
              <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="size-4 text-purple-500" />
              Recruitment Template
            </Button>
          </TooltipTrigger>
          <TooltipContent>Load the AI Recruitment Pipeline</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {!mounted ? null : theme === "dark" ? (
                <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} />
              ) : (
                <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Theme</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={undo}
              disabled={past.length === 0}
            >
              <HugeiconsIcon icon={UndoIcon} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={redo}
              disabled={future.length === 0}
            >
              <HugeiconsIcon icon={RedoIcon} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={handleSaveToCloud} disabled={isSaving}>
              {isSaving ? <Spinner className="size-3.5" /> : <HugeiconsIcon icon={CloudUploadIcon} strokeWidth={2} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{workflowId ? "Save Changes" : "Save to Cloud"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsLibraryOpen(true)}
            >
              <HugeiconsIcon icon={CloudDownloadIcon} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open from Database</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={clearWorkflow}>
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Canvas</TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Simulate */}
      <div className="flex items-center gap-2">
        <Button variant="default" size="default" onClick={onOpenSandbox}>
          <HugeiconsIcon icon={PlayIcon} strokeWidth={2} className="size-3.5" />
          Test Workflow
        </Button>
      </div>

      <WorkflowLibraryDialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen} />
    </div>
  );
}
