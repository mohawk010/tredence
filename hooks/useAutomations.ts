"use client";

import { useState, useEffect } from "react";
import type { AutomationAction } from "@/lib/types";

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAutomations() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/automations");
        if (!res.ok) throw new Error("Failed to fetch automations");
        const data = await res.json();
        if (!cancelled) {
          setAutomations(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAutomations();
    return () => {
      cancelled = true;
    };
  }, []);

  return { automations, isLoading, error };
}
