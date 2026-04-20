import { NextResponse } from "next/server";
import type {
  WorkflowNode,
  WorkflowEdge,
  SimulationResult,
  SimulationStep,
} from "@/lib/types";
import { NodeType } from "@/lib/types";
import { validateWorkflow } from "@/lib/validation";
import { topologicalSort } from "@/lib/validation";

export async function POST(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const body = await request.json();
    const { nodes, edges } = body as {
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
    };

    // Validate first
    const validationErrors = validateWorkflow(nodes, edges);
    const hasErrors = validationErrors.some((e) => e.severity === "error");

    if (hasErrors) {
      const result: SimulationResult = {
        success: false,
        steps: [],
        errors: validationErrors
          .filter((e) => e.severity === "error")
          .map((e) => e.message),
      };
      return NextResponse.json(result);
    }

    // Topological sort for execution order
    const sorted = topologicalSort(nodes, edges);
    if (!sorted) {
      const result: SimulationResult = {
        success: false,
        steps: [],
        errors: ["Cannot simulate: workflow contains cycles."],
      };
      return NextResponse.json(result);
    }

    // Simulate step-by-step execution
    const steps: SimulationStep[] = [];
    let hasFailure = false;

    for (const node of sorted) {
      const data = node.data as unknown as Record<string, unknown>;
      const title = (data.title as string) || (data.message as string) || node.type || "Unknown";

      // Random chance of failure for automated steps to make simulation realistic
      const isAutomated = node.type === NodeType.AUTOMATED_STEP;
      const shouldFail = isAutomated && Math.random() < 0.1; // 10% failure rate

      if (hasFailure) {
        steps.push({
          nodeId: node.id,
          nodeType: node.type as NodeType,
          title,
          status: "skipped",
          message: "Skipped due to previous failure",
          timestamp: Date.now() + steps.length * 1000,
        });
        continue;
      }

      if (shouldFail) {
        hasFailure = true;
        steps.push({
          nodeId: node.id,
          nodeType: node.type as NodeType,
          title,
          status: "error",
          message: `Action "${title}" failed: simulated error`,
          timestamp: Date.now() + steps.length * 1000,
        });
        continue;
      }

      let message = "";
      switch (node.type) {
        case NodeType.START:
          message = "Workflow started";
          break;
        case NodeType.TASK:
          message = `Task assigned to ${(data.assignee as string) || "unassigned"}`;
          break;
        case NodeType.APPROVAL:
          message = `Awaiting approval from ${(data.approverRole as string) || "approver"}`;
          break;
        case NodeType.AUTOMATED_STEP:
          message = `Executed automated action: ${(data.actionId as string) || "unknown"}`;
          break;
        case NodeType.CONDITION:
          const v = data.conditionVariable || "var";
          const op = data.conditionOperator || "==";
          const target = data.conditionValue || "val";
          // Simulate condition evaluation randomly for the sandbox pathing logic
          const isTrue = Math.random() > 0.5; 
          message = `Evaluated condition [${v} ${op} "${target}"] -> ${isTrue ? "True" : "False"}`;
          break;
        case NodeType.END:
          message = (data.message as string) || "Workflow completed successfully";
          break;
        default:
          message = "Step executed";
      }

      steps.push({
        nodeId: node.id,
        nodeType: node.type as NodeType,
        title,
        status: "success",
        message,
        timestamp: Date.now() + steps.length * 1000,
      });
    }

    const result: SimulationResult = {
      success: !hasFailure,
      steps,
      errors: hasFailure ? ["Simulation completed with errors"] : [],
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        success: false,
        steps: [],
        errors: ["Server error: Failed to process simulation request"],
      },
      { status: 500 }
    );
  }
}
