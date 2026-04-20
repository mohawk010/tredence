"use client";

import { useMemo } from "react";
import type { WorkflowNode, WorkflowEdge, ValidationError } from "@/lib/types";
import { validateWorkflow } from "@/lib/validation";

export function useValidation(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const validationErrors = useMemo(
    () => validateWorkflow(nodes, edges),
    [nodes, edges]
  );

  const hasErrors = validationErrors.some((e) => e.severity === "error");
  const hasWarnings = validationErrors.some((e) => e.severity === "warning");

  const getNodeErrors = (nodeId: string): ValidationError[] =>
    validationErrors.filter((e) => e.nodeId === nodeId);

  return {
    validationErrors,
    hasErrors,
    hasWarnings,
    isValid: !hasErrors,
    getNodeErrors,
  };
}
