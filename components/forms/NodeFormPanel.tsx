"use client";

import React from "react";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { NodeType } from "@/lib/types";
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedStepNodeData,
  ConditionNodeData,
  EndNodeData,
} from "@/lib/types";
import { NODE_TYPE_CONFIGS } from "@/lib/constants";
import { StartNodeForm } from "./StartNodeForm";
import { TaskNodeForm } from "./TaskNodeForm";
import { ApprovalNodeForm } from "./ApprovalNodeForm";
import { AutomatedStepNodeForm } from "./AutomatedStepNodeForm";
import { ConditionNodeForm } from "./ConditionNodeForm";
import { EndNodeForm } from "./EndNodeForm";
import { CSVTriggerNodeForm } from "./CSVTriggerNodeForm";
import { WebScrapeNodeForm } from "./WebScrapeNodeForm";
import { PDFParseNodeForm } from "./PDFParseNodeForm";
import { GeminiEvalNodeForm } from "./GeminiEvalNodeForm";
import { EmailNodeForm } from "./EmailNodeForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Delete02Icon, PlayIcon } from "@hugeicons/core-free-icons";

// Type imports for new nodes
import type {
  CSVTriggerNodeData,
  WebScrapeNodeData,
  PDFParseNodeData,
  GeminiEvalNodeData,
  EmailNodeData,
} from "@/lib/types";

export function NodeFormPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const clearSelection = useWorkflowStore((s) => s.clearSelection);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode || !selectedNodeId) {
    return null;
  }

  const nodeType = selectedNode.type as NodeType;
  const config = NODE_TYPE_CONFIGS[nodeType];

  const handleChange = (data: Record<string, unknown>) => {
    updateNodeData(selectedNodeId, data);
  };

  const handleDelete = () => {
    deleteNode(selectedNodeId);
    clearSelection();
  };

  const handleTestStep = async () => {
    try {
      const response = await fetch("/api/simulate/node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: nodeType,
          data: selectedNode.data,
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(`Success: ${result.result}\n\nData: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      alert("Failed to connect to simulation server.");
    }
  };

  const renderForm = () => {
    switch (nodeType) {
      case NodeType.START:
        return <StartNodeForm data={selectedNode.data as StartNodeData} onChange={handleChange} />;
      case NodeType.TASK:
        return <TaskNodeForm data={selectedNode.data as TaskNodeData} onChange={handleChange} />;
      case NodeType.APPROVAL:
        return <ApprovalNodeForm data={selectedNode.data as ApprovalNodeData} onChange={handleChange} />;
      case NodeType.AUTOMATED_STEP:
        return <AutomatedStepNodeForm data={selectedNode.data as AutomatedStepNodeData} onChange={handleChange} />;
      case NodeType.CONDITION:
        return <ConditionNodeForm data={selectedNode.data as unknown as ConditionNodeData} onChange={handleChange} />;
      case NodeType.END:
        return <EndNodeForm data={selectedNode.data as EndNodeData} onChange={handleChange} />;
      case NodeType.CSV_TRIGGER:
        return <CSVTriggerNodeForm data={selectedNode.data as unknown as CSVTriggerNodeData} onChange={handleChange} />;
      case NodeType.WEB_SCRAPE:
        return <WebScrapeNodeForm data={selectedNode.data as unknown as WebScrapeNodeData} onChange={handleChange} />;
      case NodeType.PDF_PARSE:
        return <PDFParseNodeForm data={selectedNode.data as unknown as PDFParseNodeData} onChange={handleChange} />;
      case NodeType.GEMINI_EVAL:
        return <GeminiEvalNodeForm data={selectedNode.data as unknown as GeminiEvalNodeData} onChange={handleChange} />;
      case NodeType.EMAIL:
        return <EmailNodeForm data={selectedNode.data as unknown as EmailNodeData} onChange={handleChange} />;
      default:
        return <p className="text-xs text-muted-foreground">Unknown node type</p>;
    }
  };

  return (
    <div className="w-[320px] border-l bg-card flex flex-col h-full animate-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <h3 className="text-sm font-semibold">{config.label} Node</h3>
          <Badge variant="outline" className="text-[9px]">
            {selectedNodeId.slice(0, 8)}
          </Badge>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={clearSelection}>
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        </Button>
      </div>

      {/* Form content */}
      <ScrollArea className="flex-1">
        <div className="p-4">{renderForm()}</div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        {nodeType !== NodeType.START && nodeType !== NodeType.END && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200"
            onClick={handleTestStep}
          >
            <HugeiconsIcon icon={PlayIcon} strokeWidth={2} className="size-3.5 mr-1" />
            Test Step Output
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleDelete}
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5 mr-1" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}
