"use client";

import React, { useState, useEffect } from "react";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { serializeWorkflow } from "@/lib/serialization";
import { useWorkflows } from "@/hooks/useWorkflows";
import { useSimulate } from "@/hooks/useSimulate";
import { NodeType } from "@/lib/types";
import { WorkflowLibraryDialog } from "@/components/forms/WorkflowLibraryDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { UndoIcon, RedoIcon, CloudUploadIcon, CloudDownloadIcon, PlayIcon, Delete02Icon, Sun01Icon, Moon02Icon, AiBrain01Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { ExecutionDataDrawer } from "@/components/canvas/ExecutionDataDrawer";

export function CanvasToolbar() {
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
  
  const { simulate, isSimulating } = useSimulate();
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionDrawer, setExecutionDrawer] = useState<{
    open: boolean;
    csvContent?: string;
    csvFileName?: string;
    executionResults?: import("@/components/canvas/ExecutionDataDrawer").CandidateResult[];
    isExecuting?: boolean;
    executingIndex?: number;
  }>({ open: false });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRunSimulation = async () => {
    // Clear all node statuses
    nodes.forEach((n) => updateNodeData(n.id, { executionStatus: undefined, executionMessage: undefined }));

    const csvNode = nodes.find((n) => n.type === NodeType.CSV_TRIGGER);
    const csvData = csvNode?.data as { fileContent?: string; fileName?: string } | undefined;

    // ── REAL EXECUTION (CSV data present) ─────────────────────────
    if (csvData?.fileContent) {
      setIsExecuting(true);
      setExecutionDrawer({
        open: true,
        csvContent: csvData.fileContent,
        csvFileName: csvData.fileName,
        isExecuting: true,
        executingIndex: 0,
      });

      const results: import("@/components/canvas/ExecutionDataDrawer").CandidateResult[] = [];

      try {
        const res = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, csvContent: csvData.fileContent }),
        });

        if (!res.ok || !res.body) throw new Error("Execute API failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line);

              if (event.type === "node_status") {
                updateNodeData(event.nodeId, {
                  executionStatus: event.status,
                  executionMessage: event.message,
                });
              }

              if (event.type === "candidate_start") {
                setExecutionDrawer((prev) => ({ ...prev, executingIndex: event.index }));
              }

              if (event.type === "candidate_done") {
                results.push(event as import("@/components/canvas/ExecutionDataDrawer").CandidateResult);
                setExecutionDrawer((prev) => ({
                  ...prev,
                  executionResults: [...results],
                }));
              }

              if (event.type === "candidate_error") {
                results.push({ name: event.name, email: "", fitScore: 0, recommendation: "REVIEW", error: true });
              }
            } catch {
              // skip malformed line
            }
          }
        }
      } catch (err) {
        console.error("Execution failed:", err);
        const startNode = nodes.find((n) => n.type === NodeType.START);
        if (startNode) updateNodeData(startNode.id, { executionStatus: "failed", executionMessage: "Execution failed" });
      } finally {
        setIsExecuting(false);
        setExecutionDrawer((prev) => ({ ...prev, isExecuting: false, executionResults: results }));
      }
      return;
    }

    // ── SIMULATION FALLBACK (no CSV) ──────────────────────────────
    const startNode = nodes.find((n) => n.type === NodeType.START);
    if (startNode) updateNodeData(startNode.id, { executionStatus: "running" });

    const result = await simulate(nodes, edges);

    if (!result) {
      if (startNode) updateNodeData(startNode.id, { executionStatus: "failed", executionMessage: "Could not reach simulation server." });
      return;
    }
    if (!result.success && result.steps.length === 0) {
      const msg = result.errors?.[0] || "Workflow validation failed.";
      if (startNode) updateNodeData(startNode.id, { executionStatus: "failed", executionMessage: msg });
      return;
    }
    if (startNode) updateNodeData(startNode.id, { executionStatus: undefined });

    for (const step of result.steps) {
      updateNodeData(step.nodeId, { executionStatus: "running" });
      await new Promise((r) => setTimeout(r, 700));
      const status = step.status === "success" ? "success" : step.status === "skipped" ? "skipped" : "failed";
      updateNodeData(step.nodeId, { executionStatus: status, executionMessage: step.message });
      if (step.status === "error") break;
    }
  };

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
        <Button
          variant="default"
          size="default"
          onClick={handleRunSimulation}
          disabled={isSimulating || isExecuting}
        >
          {(isSimulating || isExecuting) ? (
            <Spinner className="size-3.5 mr-2 text-white" />
          ) : (
            <HugeiconsIcon icon={PlayIcon} strokeWidth={2} className="size-3.5 mr-2" />
          )}
          {isExecuting ? "Running..." : isSimulating ? "Testing..." : "Test Workflow"}
        </Button>
      </div>

      <WorkflowLibraryDialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen} />

      {/* Execution Data Drawer — fixed at bottom of viewport, over the canvas */}
      <ExecutionDataDrawer
        open={executionDrawer.open}
        onClose={() => setExecutionDrawer({ open: false })}
        csvContent={executionDrawer.csvContent}
        csvFileName={executionDrawer.csvFileName}
        executionResults={executionDrawer.executionResults}
        isExecuting={executionDrawer.isExecuting}
        executingIndex={executionDrawer.executingIndex}
      />
    </div>
  );
}
