"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KeyValueEditor } from "./KeyValueEditor";
import type { TaskNodeData } from "@/lib/types";

interface TaskNodeFormProps {
  data: TaskNodeData;
  onChange: (data: Partial<TaskNodeData>) => void;
}

export function TaskNodeForm({ data, onChange }: TaskNodeFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="task-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="task-title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Collect Documents"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-description">Description</Label>
        <Textarea
          id="task-description"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the task..."
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-assignee">Assignee</Label>
        <Input
          id="task-assignee"
          value={data.assignee}
          onChange={(e) => onChange({ assignee: e.target.value })}
          placeholder="e.g., John Doe"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-duedate">Due Date</Label>
        <Input
          id="task-duedate"
          type="date"
          value={data.dueDate}
          onChange={(e) => onChange({ dueDate: e.target.value })}
        />
      </div>

      <KeyValueEditor
        label="Custom Fields (optional)"
        entries={data.customFields || {}}
        onChange={(customFields) => onChange({ customFields })}
        keyPlaceholder="Field name"
        valuePlaceholder="Field value"
      />
    </div>
  );
}
