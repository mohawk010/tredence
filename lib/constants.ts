import { NodeType } from "./types";
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedStepNodeData,
  EndNodeData,
  CSVTriggerNodeData,
  WebScrapeNodeData,
  PDFParseNodeData,
  GeminiEvalNodeData,
  EmailNodeData,
} from "./types";

// ─── Node Type Configuration ─────────────────────────────────────
export interface NodeTypeConfig {
  type: NodeType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
}

export const NODE_TYPE_CONFIGS: Record<NodeType, NodeTypeConfig> = {
  [NodeType.START]: {
    type: NodeType.START,
    label: "Start",
    description: "Workflow entry point",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    iconBg: "rgba(16, 185, 129, 0.15)",
  },
  [NodeType.TASK]: {
    type: NodeType.TASK,
    label: "Task",
    description: "Human task assignment",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.08)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    iconBg: "rgba(59, 130, 246, 0.15)",
  },
  [NodeType.APPROVAL]: {
    type: NodeType.APPROVAL,
    label: "Approval",
    description: "Manager or HR approval step",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.08)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    iconBg: "rgba(245, 158, 11, 0.15)",
  },
  [NodeType.AUTOMATED_STEP]: {
    type: NodeType.AUTOMATED_STEP,
    label: "Automated",
    description: "System-triggered action",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    iconBg: "rgba(139, 92, 246, 0.15)",
  },
  [NodeType.CONDITION]: {
    type: NodeType.CONDITION,
    label: "Condition",
    description: "Logic branching",
    color: "#F97316",
    bgColor: "rgba(249, 115, 22, 0.08)",
    borderColor: "rgba(249, 115, 22, 0.3)",
    iconBg: "rgba(249, 115, 22, 0.15)",
  },
  [NodeType.END]: {
    type: NodeType.END,
    label: "End",
    description: "Workflow completion",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    iconBg: "rgba(239, 68, 68, 0.15)",
  },
  [NodeType.CSV_TRIGGER]: {
    type: NodeType.CSV_TRIGGER,
    label: "CSV Trigger",
    description: "Start workflow from CSV upload",
    color: "#14B8A6",
    bgColor: "rgba(20, 184, 166, 0.08)",
    borderColor: "rgba(20, 184, 166, 0.3)",
    iconBg: "rgba(20, 184, 166, 0.15)",
  },
  [NodeType.WEB_SCRAPE]: {
    type: NodeType.WEB_SCRAPE,
    label: "Web Scrape",
    description: "Extract data from a URL",
    color: "#0EA5E9",
    bgColor: "rgba(14, 165, 233, 0.08)",
    borderColor: "rgba(14, 165, 233, 0.3)",
    iconBg: "rgba(14, 165, 233, 0.15)",
  },
  [NodeType.PDF_PARSE]: {
    type: NodeType.PDF_PARSE,
    label: "PDF Parse",
    description: "Extract text from PDF file",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    iconBg: "rgba(139, 92, 246, 0.15)",
  },
  [NodeType.GEMINI_EVAL]: {
    type: NodeType.GEMINI_EVAL,
    label: "Gemini Evaluator",
    description: "AI evaluation using Google Gemini",
    color: "#D946EF",
    bgColor: "rgba(217, 70, 239, 0.08)",
    borderColor: "rgba(217, 70, 239, 0.3)",
    iconBg: "rgba(217, 70, 239, 0.15)",
  },
  [NodeType.EMAIL]: {
    type: NodeType.EMAIL,
    label: "Send Email",
    description: "Send an email via SMTP",
    color: "#F43F5E",
    bgColor: "rgba(244, 63, 94, 0.08)",
    borderColor: "rgba(244, 63, 94, 0.3)",
    iconBg: "rgba(244, 63, 94, 0.15)",
  },
};

// ─── Default Data Factories ──────────────────────────────────────
export function createDefaultNodeData(type: NodeType) {
  switch (type) {
    case NodeType.START:
      return {
        title: "Start",
        metadata: {},
      } satisfies StartNodeData;

    case NodeType.TASK:
      return {
        title: "New Task",
        description: "",
        assignee: "",
        dueDate: "",
        customFields: {},
      } satisfies TaskNodeData;

    case NodeType.APPROVAL:
      return {
        title: "Approval Required",
        approverRole: "Manager",
        autoApproveThreshold: 0,
      } satisfies ApprovalNodeData;

    case NodeType.AUTOMATED_STEP:
      return {
        title: "Automated Action",
        actionId: "",
        actionParams: {},
      } satisfies AutomatedStepNodeData;

    case NodeType.CONDITION:
      return {
        title: "Check Condition",
        conditionVariable: "status",
        conditionOperator: "==",
        conditionValue: "approved",
      } as any;

    case NodeType.END:
      return {
        title: "End",
        message: "Workflow complete",
        summaryFlag: true,
      } satisfies EndNodeData;

    case NodeType.CSV_TRIGGER:
      return {
        title: "CSV Upload",
        fileUrl: "",
      };
      
    case NodeType.WEB_SCRAPE:
      return {
        title: "Web Scraper",
        url: "",
        selector: "",
      };

    case NodeType.PDF_PARSE:
      return {
        title: "Resume Extractor",
        fileUrlVariable: "{{row.resumeLink}}",
      };

    case NodeType.GEMINI_EVAL:
      return {
        title: "AI Fit Evaluator",
        roleIdVariable: "{{row.roleId}}",
        resumeTextVariable: "{{pdf.text}}",
        customPrompt: "Evaluate the given resume against the role.",
      };

    case NodeType.EMAIL:
      return {
        title: "Send Outcome Email",
        to: "{{row.email}}",
        subject: "Your Application Result",
        body: "Hello {{row.name}}, ...",
      };
  }
}

// ─── Approver Roles ──────────────────────────────────────────────
export const APPROVER_ROLES = [
  "Manager",
  "HRBP",
  "Director",
  "VP",
  "CEO",
  "Team Lead",
  "Department Head",
] as const;

// ─── Workflow Version ────────────────────────────────────────────
export const WORKFLOW_VERSION = "1.0.0";
