"use client";

import { useState, useCallback, useEffect } from "react";
import type { SerializedWorkflow } from "@/lib/types";

export interface WorkflowRecord {
  id: string;
  name: string;
  description: string | null;
  nodes: any;
  edges: any;
  createdAt: string;
  updatedAt: string;
}

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/workflows");
      if (!res.ok) throw new Error("Failed to fetch workflows");
      const data = await res.json();
      setWorkflows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const saveWorkflow = async (
    name: string,
    nodes: any[],
    edges: any[],
    id?: string | null
  ): Promise<WorkflowRecord> => {
    const isUpdate = !!id;
    const url = isUpdate ? `/api/workflows/${id}` : "/api/workflows";
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, nodes, edges }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save workflow");
    }

    const saved = await res.json();
    await fetchWorkflows(); // Refresh list
    return saved;
  };

  const deleteWorkflow = async (id: string) => {
    const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete workflow");
    await fetchWorkflows(); // Refresh list
  };

  return {
    workflows,
    isLoading,
    error,
    fetchWorkflows,
    saveWorkflow,
    deleteWorkflow,
  };
}
