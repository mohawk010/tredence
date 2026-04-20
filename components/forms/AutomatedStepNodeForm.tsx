"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutomations } from "@/hooks/useAutomations";
import { Spinner } from "@/components/ui/spinner";
import type { AutomatedStepNodeData } from "@/lib/types";

interface AutomatedStepNodeFormProps {
  data: AutomatedStepNodeData;
  onChange: (data: Partial<AutomatedStepNodeData>) => void;
}

export function AutomatedStepNodeForm({
  data,
  onChange,
}: AutomatedStepNodeFormProps) {
  const { automations, isLoading } = useAutomations();
  const selectedAction = automations.find((a) => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    // Reset params when action changes
    const action = automations.find((a) => a.id === actionId);
    const params: Record<string, string> = {};
    action?.params.forEach((p) => {
      params[p] = data.actionParams?.[p] || "";
    });
    onChange({ actionId, actionParams: params });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="automated-title">Title</Label>
        <Input
          id="automated-title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Send Welcome Email"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Action</Label>
        {isLoading ? (
          <div className="flex items-center gap-2 py-2">
            <Spinner className="size-4" />
            <span className="text-xs text-muted-foreground">
              Loading actions...
            </span>
          </div>
        ) : (
          <Select value={data.actionId} onValueChange={handleActionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an action..." />
            </SelectTrigger>
            <SelectContent>
              {automations.map((action) => (
                <SelectItem key={action.id} value={action.id}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Dynamic parameters based on selected action */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="space-y-3 pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground">
            Action Parameters
          </p>
          {selectedAction.params.map((param) => (
            <div key={param} className="space-y-1.5">
              <Label htmlFor={`param-${param}`} className="capitalize">
                {param.replace(/([A-Z])/g, " $1").trim()}
              </Label>
              <Input
                id={`param-${param}`}
                value={data.actionParams?.[param] || ""}
                onChange={(e) =>
                  onChange({
                    actionParams: {
                      ...data.actionParams,
                      [param]: e.target.value,
                    },
                  })
                }
                placeholder={`Enter ${param}...`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
