"use client";

import React, { useCallback } from "react";
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, type NodeTypes, type EdgeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { StartNode } from "@/components/nodes/StartNode";
import { TaskNode } from "@/components/nodes/TaskNode";
import { ApprovalNode } from "@/components/nodes/ApprovalNode";
import { AutomatedStepNode } from "@/components/nodes/AutomatedStepNode";
import { ConditionNode } from "@/components/nodes/ConditionNode";
import { EndNode } from "@/components/nodes/EndNode";
import { CSVTriggerNode } from "@/components/nodes/CSVTriggerNode";
import { WebScrapeNode } from "@/components/nodes/WebScrapeNode";
import { PDFParseNode } from "@/components/nodes/PDFParseNode";
import { GeminiEvalNode } from "@/components/nodes/GeminiEvalNode";
import { EmailNode } from "@/components/nodes/EmailNode";
import { CustomEdge } from "@/components/canvas/CustomEdge";

const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automatedStep: AutomatedStepNode,
  condition: ConditionNode,
  end: EndNode,
  csvTrigger: CSVTriggerNode,
  webScrape: WebScrapeNode,
  pdfParse: PDFParseNode,
  geminiEval: GeminiEvalNode,
  email: EmailNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const defaultEdgeOptions = {
  type: "custom",
  animated: true,
};

export function WorkflowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
  const clearSelection = useWorkflowStore((s) => s.clearSelection);

  const { onDragOver, onDrop } = useDragAndDrop();

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const handlePaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        className="bg-muted/30"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border)"
        />
        <Controls
          className="rounded-lg! border! border-border! bg-card! shadow-md! [&>button]:border-border! [&>button]:bg-card! [&>button]:text-foreground! [&>button:hover]:bg-muted!"
        />
        <MiniMap
          className="rounded-lg! border! border-border! bg-card! shadow-md!"
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}
