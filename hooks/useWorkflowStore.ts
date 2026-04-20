"use client";

import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { NodeType, type WorkflowNode, type WorkflowEdge } from "@/lib/types";
import { createDefaultNodeData } from "@/lib/constants";

// ─── Store State ─────────────────────────────────────────────────
interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  workflowName: string;
  workflowId: string | null;
  isDirty: boolean;

  // History for undo/redo
  past: Array<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }>;
  future: Array<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }>;
}

// ─── Store Actions ───────────────────────────────────────────────
interface WorkflowActions {
  // React Flow handlers
  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // Node CRUD
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNode["data"]>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;

  // Selection
  setSelectedNode: (nodeId: string | null) => void;
  clearSelection: () => void;

  // Workflow management
  setWorkflowName: (name: string) => void;
  setWorkflowId: (id: string | null) => void;
  loadWorkflow: (
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    name: string,
    id?: string | null
  ) => void;
  clearWorkflow: () => void;
  loadRecruitmentTemplate: () => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export type WorkflowStore = WorkflowState & WorkflowActions;

// ─── Initial State ───────────────────────────────────────────────
const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowName: "Untitled Workflow",
  workflowId: null,
  isDirty: false,
  past: [],
  future: [],
};

// ─── Store ───────────────────────────────────────────────────────
export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  ...initialState,

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as WorkflowNode[],
      isDirty: true,
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true,
    }));
  },

  onConnect: (connection: Connection) => {
    const state = get();

    // Prevent connecting from End nodes
    const sourceNode = state.nodes.find((n) => n.id === connection.source);
    if (sourceNode?.type === NodeType.END) return;

    // Prevent connecting to Start nodes
    const targetNode = state.nodes.find((n) => n.id === connection.target);
    if (targetNode?.type === NodeType.START) return;

    // Prevent duplicate edges
    const exists = state.edges.some(
      (e) => e.source === connection.source && e.target === connection.target
    );
    if (exists) return;

    get().pushHistory();

    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          id: `edge-${uuidv4()}`,
          type: "custom",
          animated: true,
        },
        state.edges
      ),
      isDirty: true,
    }));
  },

  addNode: (type, position) => {
    get().pushHistory();
    const data = createDefaultNodeData(type);
    const newNode: WorkflowNode = {
      id: `node-${uuidv4()}`,
      type,
      position,
      data,
    } as WorkflowNode;

    set((state) => ({
      nodes: [...state.nodes, newNode],
      isDirty: true,
    }));
  },

  updateNodeData: (nodeId, data) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ) as WorkflowNode[],
      isDirty: true,
    }));
  },

  deleteNode: (nodeId) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId:
        state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      isDirty: true,
    }));
  },

  deleteEdge: (edgeId) => {
    get().pushHistory();
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      isDirty: true,
    }));
  },

  setSelectedNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  clearSelection: () => {
    set({ selectedNodeId: null });
  },

  setWorkflowName: (name) => {
    set({ workflowName: name, isDirty: true });
  },

  setWorkflowId: (id) => {
    set({ workflowId: id });
  },

  loadWorkflow: (nodes, edges, name, id = null) => {
    set({
      nodes,
      edges,
      workflowName: name,
      workflowId: id,
      selectedNodeId: null,
      isDirty: false,
      past: [],
      future: [],
    });
  },

  clearWorkflow: () => {
    get().pushHistory();
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      workflowId: null,
      workflowName: "Untitled Workflow",
      isDirty: true,
    });
  },

  loadRecruitmentTemplate: () => {
    get().pushHistory();
    const startId = `node-${uuidv4()}`;
    const csvId = `node-${uuidv4()}`;
    const pdfId = `node-${uuidv4()}`;
    const geminiId = `node-${uuidv4()}`;
    const emailId = `node-${uuidv4()}`;
    const endId = `node-${uuidv4()}`;

    const tNodes: WorkflowNode[] = [
      { id: startId, type: NodeType.START, position: { x: 250, y: 50 }, data: createDefaultNodeData(NodeType.START) },
      { id: csvId, type: NodeType.CSV_TRIGGER, position: { x: 250, y: 150 }, data: createDefaultNodeData(NodeType.CSV_TRIGGER) },
      { id: pdfId, type: NodeType.PDF_PARSE, position: { x: 250, y: 250 }, data: createDefaultNodeData(NodeType.PDF_PARSE) },
      { id: geminiId, type: NodeType.GEMINI_EVAL, position: { x: 250, y: 350 }, data: createDefaultNodeData(NodeType.GEMINI_EVAL) },
      { id: emailId, type: NodeType.EMAIL, position: { x: 250, y: 450 }, data: createDefaultNodeData(NodeType.EMAIL) },
      { id: endId, type: NodeType.END, position: { x: 250, y: 550 }, data: createDefaultNodeData(NodeType.END) },
    ] as WorkflowNode[];

    const createEdge = (source: string, target: string): WorkflowEdge => ({
      id: `edge-${uuidv4()}`,
      source,
      target,
      type: "custom",
      animated: true,
    });

    const tEdges: WorkflowEdge[] = [
      createEdge(startId, csvId),
      createEdge(csvId, pdfId),
      createEdge(pdfId, geminiId),
      createEdge(geminiId, emailId),
      createEdge(emailId, endId),
    ];

    set({
      nodes: tNodes,
      edges: tEdges,
      workflowName: "AI Recruitment Pipeline",
      workflowId: null,
      selectedNodeId: null,
      isDirty: true,
    });
  },

  pushHistory: () => {
    const { nodes, edges, past } = get();
    set({
      past: [...past.slice(-30), { nodes: [...nodes], edges: [...edges] }],
      future: [],
    });
  },

  undo: () => {
    const { past, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...get().future],
      isDirty: true,
    });
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...get().past, { nodes, edges }],
      future: future.slice(1),
      isDirty: true,
    });
  },
}));
