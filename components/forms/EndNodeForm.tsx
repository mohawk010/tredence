"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { EndNodeData } from "@/lib/types";

interface EndNodeFormProps {
  data: EndNodeData;
  onChange: (data: Partial<EndNodeData>) => void;
}

export function EndNodeForm({ data, onChange }: EndNodeFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="end-message">End Message</Label>
        <Input
          id="end-message"
          value={data.message}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="e.g., Onboarding Complete"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Label htmlFor="summary-flag">Generate Summary</Label>
          <p className="text-[10px] text-muted-foreground">
            Generate a workflow execution summary on completion
          </p>
        </div>
        <Switch
          id="summary-flag"
          checked={data.summaryFlag}
          onCheckedChange={(checked) =>
            onChange({ summaryFlag: checked as boolean })
          }
        />
      </div>
    </div>
  );
}
