import type {
  WorkflowNode,
  WorkflowEdge,
  SerializedWorkflow,
} from "./types";
import { WORKFLOW_VERSION } from "./constants";

/**
 * Serialize workflow state to a portable JSON structure.
 */
export function serializeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  name: string
): SerializedWorkflow {
  return {
    name,
    nodes: nodes.map((node) => ({
      ...node,
      // Strip internal React Flow state
      selected: undefined,
      dragging: undefined,
    })) as WorkflowNode[],
    edges: edges.map((edge) => ({
      ...edge,
      selected: undefined,
    })),
    version: WORKFLOW_VERSION,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Deserialize a workflow JSON back to React Flow state.
 */
export function deserializeWorkflow(json: SerializedWorkflow): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  name: string;
} {
  return {
    nodes: json.nodes.map((node) => ({
      ...node,
      selected: false,
      dragging: false,
    })),
    edges: json.edges.map((edge) => ({
      ...edge,
      selected: false,
    })),
    name: json.name,
  };
}

/**
 * Download a workflow as a JSON file.
 */
export function downloadWorkflowJSON(workflow: SerializedWorkflow): void {
  const json = JSON.stringify(workflow, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${workflow.name.replace(/\s+/g, "_").toLowerCase()}_workflow.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read a workflow JSON file from a File input.
 */
export function readWorkflowFile(file: File): Promise<SerializedWorkflow> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.nodes || !json.edges || !json.name) {
          throw new Error("Invalid workflow file format");
        }
        resolve(json as SerializedWorkflow);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
