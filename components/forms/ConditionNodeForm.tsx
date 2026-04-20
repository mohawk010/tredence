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
import type { ConditionNodeData } from "@/lib/types";

interface ConditionNodeFormProps {
  data: ConditionNodeData;
  onChange: (data: Partial<ConditionNodeData>) => void;
}

export function ConditionNodeForm({ data, onChange }: ConditionNodeFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cond-title">Title</Label>
        <Input
          id="cond-title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Check Manager Approval"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pb-2">
        <div className="col-span-2 space-y-1.5">
          <Label>Variable Context</Label>
          <Input
            value={data.conditionVariable}
            onChange={(e) => onChange({ conditionVariable: e.target.value })}
            placeholder="e.g., Document.Status"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label>Operator</Label>
          <Select
            value={data.conditionOperator}
            onValueChange={(val: any) => onChange({ conditionOperator: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Op" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="==">== Equals</SelectItem>
              <SelectItem value="!=">!= Not Equal</SelectItem>
              <SelectItem value=">">&gt; Greater</SelectItem>
              <SelectItem value="<">&lt; Less</SelectItem>
              <SelectItem value=">=">&ge; Gt. Eq</SelectItem>
              <SelectItem value="<=">&le; Ls. Eq</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Value</Label>
          <Input
            value={data.conditionValue}
            onChange={(e) => onChange({ conditionValue: e.target.value })}
            placeholder="e.g., Approved"
          />
        </div>
      </div>
      
      <div className="p-3 bg-muted/50 rounded-lg text-[10px] text-muted-foreground leading-relaxed">
        <strong>Branching:</strong> This node acts as a gateway. Ensure you connect elements to the 
        <span className="text-emerald-600 font-medium"> True</span> vs 
        <span className="text-red-600 font-medium"> False</span> output handles.
      </div>
    </div>
  );
}
