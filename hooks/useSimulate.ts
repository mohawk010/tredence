"use client";

import { useState, useCallback } from "react";
import type {
  WorkflowNode,
  WorkflowEdge,
  SimulationResult,
} from "@/lib/types";

export function useSimulate() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(
    async (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
      try {
        setIsSimulating(true);
        setError(null);
        setResult(null);

        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        });

        if (!res.ok) throw new Error("Simulation failed");

        const data: SimulationResult = await res.json();
        setResult(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown simulation error";
        setError(message);
        return null;
      } finally {
        setIsSimulating(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsSimulating(false);
  }, []);

  return { result, isSimulating, error, simulate, reset };
}
