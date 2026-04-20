"use client";

import React, { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { WorkflowCanvas } from "@/components/canvas/WorkflowCanvas";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { NodePalette } from "@/components/sidebar/NodePalette";
import { NodeFormPanel } from "@/components/forms/NodeFormPanel";

export default function DesignerPage() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Left Sidebar -- Node Palette */}
        <div className="w-[240px] border-r bg-card flex flex-col shrink-0">
          {/* App branding */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-base font-bold text-foreground leading-none">
                  Tredence HR Workflow
                </p>
              </div>
            </div>
          </div>


          {/* Node palette */}
          <NodePalette />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <CanvasToolbar />
          {/* Canvas wrapper with relative positioning for the sandbox overlay */}
          <div className="flex-1 relative overflow-hidden">
            <WorkflowCanvas />
          </div>
        </div>

        {/* Right Panel -- Node Form */}
        <NodeFormPanel />
      </div>
    </ReactFlowProvider>
  );
}
