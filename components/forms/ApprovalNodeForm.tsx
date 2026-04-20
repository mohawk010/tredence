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
import { APPROVER_ROLES } from "@/lib/constants";
import type { ApprovalNodeData } from "@/lib/types";

interface ApprovalNodeFormProps {
  data: ApprovalNodeData;
  onChange: (data: Partial<ApprovalNodeData>) => void;
}

export function ApprovalNodeForm({ data, onChange }: ApprovalNodeFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="approval-title">Title</Label>
        <Input
          id="approval-title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Manager Approval"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Approver Role</Label>
        <Select
          value={data.approverRole}
          onValueChange={(value) => onChange({ approverRole: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select role..." />
          </SelectTrigger>
          <SelectContent>
            {APPROVER_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="approval-threshold">
          Auto-approve Threshold
        </Label>
        <Input
          id="approval-threshold"
          type="number"
          min={0}
          value={data.autoApproveThreshold}
          onChange={(e) =>
            onChange({ autoApproveThreshold: parseInt(e.target.value) || 0 })
          }
          placeholder="0"
        />
        <p className="text-[10px] text-muted-foreground">
          Requests at or below this value are auto-approved. Set to 0 to disable.
        </p>
      </div>
    </div>
  );
}
