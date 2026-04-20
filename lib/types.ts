import type { Node, Edge } from "@xyflow/react";

// Node Type Enum 
export enum NodeType {
  START = "start",
  TASK = "task",
  APPROVAL = "approval",
  AUTOMATED_STEP = "automatedStep",
  CONDITION = "condition",
  END = "end",
  CSV_TRIGGER = "csvTrigger",
  WEB_SCRAPE = "webScrape",
  PDF_PARSE = "pdfParse",
  GEMINI_EVAL = "geminiEval",
  EMAIL = "email",
}

// Node Data Types
export interface SharedNodeData extends Record<string, unknown> {
  executionStatus?: "pending" | "running" | "success" | "failed" | "skipped";
  executionMessage?: string;
}

export interface StartNodeData extends SharedNodeData {
  title: string;
  metadata: Record<string, string>;
}

export interface ConditionNodeData extends SharedNodeData {
  title: string;
  conditionVariable: string;
  conditionOperator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "contains";
  conditionValue: string;
}

export interface TaskNodeData extends SharedNodeData {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: Record<string, string>;
}

export interface ApprovalNodeData extends SharedNodeData {
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedStepNodeData extends SharedNodeData {
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData extends SharedNodeData {
  message: string;
  summaryFlag: boolean;
}

export interface CSVTriggerNodeData extends SharedNodeData {
  title: string;
  fileUrl: string;
  fileName?: string;
  fileContent?: string;
}

export interface WebScrapeNodeData extends SharedNodeData {
  title: string;
  url: string;
  selector: string;
}

export interface PDFParseNodeData extends SharedNodeData {
  title: string;
  fileUrlVariable: string;
}

export interface GeminiEvalNodeData extends SharedNodeData {
  title: string;
  roleIdVariable: string;
  resumeTextVariable: string;
  customPrompt: string;
}

export interface EmailNodeData extends SharedNodeData {
  title: string;
  to: string;
  subject: string;
  body: string;
}

// Union Type
export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | ConditionNodeData
  | EndNodeData
  | CSVTriggerNodeData
  | WebScrapeNodeData
  | PDFParseNodeData
  | GeminiEvalNodeData
  | EmailNodeData;

// Typed React Flow Nodes
export type StartNode = Node<StartNodeData, typeof NodeType.START>;
export type TaskNode = Node<TaskNodeData, typeof NodeType.TASK>;
export type ApprovalNode = Node<ApprovalNodeData, typeof NodeType.APPROVAL>;
export type AutomatedStepNode = Node<AutomatedStepNodeData, typeof NodeType.AUTOMATED_STEP>;
export type ConditionNode = Node<ConditionNodeData, typeof NodeType.CONDITION>;
export type EndNode = Node<EndNodeData, typeof NodeType.END>;
export type CSVTriggerNode = Node<CSVTriggerNodeData, typeof NodeType.CSV_TRIGGER>;
export type WebScrapeNode = Node<WebScrapeNodeData, typeof NodeType.WEB_SCRAPE>;
export type PDFParseNode = Node<PDFParseNodeData, typeof NodeType.PDF_PARSE>;
export type GeminiEvalNode = Node<GeminiEvalNodeData, typeof NodeType.GEMINI_EVAL>;
export type EmailNode = Node<EmailNodeData, typeof NodeType.EMAIL>;

export type WorkflowNode = 
  | StartNode 
  | TaskNode 
  | ApprovalNode 
  | AutomatedStepNode 
  | ConditionNode 
  | EndNode
  | CSVTriggerNode
  | WebScrapeNode
  | PDFParseNode
  | GeminiEvalNode
  | EmailNode;
export type WorkflowEdge = Edge;

// Automation Action (from mock API)
export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

// Simulation
export type SimulationStepStatus = "pending" | "running" | "success" | "error" | "skipped";

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  title: string;
  status: SimulationStepStatus;
  message: string;
  timestamp: number;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
}

// Validation
export type ValidationSeverity = "error" | "warning";

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: ValidationSeverity;
}

// Serialized Workflow
export interface SerializedWorkflow {
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: string;
  createdAt: string;
}
