"use client";

import React, { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { WorkflowCanvas } from "@/components/canvas/WorkflowCanvas";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { NodePalette } from "@/components/sidebar/NodePalette";
import { NodeFormPanel } from "@/components/forms/NodeFormPanel";
import { SandboxPanel } from "@/components/sandbox/SandboxPanel";

export default function DesignerPage() {
  const [sandboxOpen, setSandboxOpen] = useState(false);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Left Sidebar -- Node Palette */}
        <div className="w-[240px] border-r bg-card flex flex-col shrink-0">
          {/* App branding */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground leading-none">
                  HR Workflow
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Designer
                </p>
              </div>
            </div>
          </div>

          {/* Node palette */}
          <NodePalette />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <CanvasToolbar onOpenSandbox={() => setSandboxOpen(true)} />
          {/* Canvas wrapper with relative positioning for the sandbox overlay */}
          <div className="flex-1 relative overflow-hidden">
            <WorkflowCanvas />
            <SandboxPanel open={sandboxOpen} onOpenChange={setSandboxOpen} />
          </div>
        </div>

        {/* Right Panel -- Node Form */}
        <NodeFormPanel />
      </div>
    </ReactFlowProvider>
  );
}
