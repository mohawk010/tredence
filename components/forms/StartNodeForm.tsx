"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyValueEditor } from "./KeyValueEditor";
import type { StartNodeData } from "@/lib/types";

interface StartNodeFormProps {
  data: StartNodeData;
  onChange: (data: Partial<StartNodeData>) => void;
}

export function StartNodeForm({ data, onChange }: StartNodeFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="start-title">Start Title</Label>
        <Input
          id="start-title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Employee Onboarding"
        />
      </div>

      <KeyValueEditor
        label="Metadata (optional)"
        entries={data.metadata || {}}
        onChange={(metadata) => onChange({ metadata })}
        keyPlaceholder="Key"
        valuePlaceholder="Value"
      />
    </div>
  );
}
