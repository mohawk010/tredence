import type { AutomationAction } from "./types";

// ─── Mock Automation Actions ─────────────────────────────────────
export const MOCK_AUTOMATIONS: AutomationAction[] = [
  {
    id: "send_email",
    label: "Send Email",
    params: ["to", "subject", "body"],
  },
  {
    id: "generate_doc",
    label: "Generate Document",
    params: ["template", "recipient"],
  },
  {
    id: "send_slack",
    label: "Send Slack Notification",
    params: ["channel", "message"],
  },
  {
    id: "update_hris",
    label: "Update HRIS Record",
    params: ["employeeId", "field", "value"],
  },
  {
    id: "schedule_meeting",
    label: "Schedule Meeting",
    params: ["attendees", "datetime", "agenda"],
  },
  {
    id: "background_check",
    label: "Trigger Background Check",
    params: ["candidateId", "checkType"],
  },
  {
    id: "provision_access",
    label: "Provision System Access",
    params: ["userId", "systems", "accessLevel"],
  },
];
