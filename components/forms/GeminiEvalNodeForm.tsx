import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GeminiEvalNodeData } from "@/lib/types";

interface Props {
  data: GeminiEvalNodeData;
  onChange: (data: Partial<GeminiEvalNodeData>) => void;
}

export function GeminiEvalNodeForm({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Node Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="AI Fit Evaluator"
          className="text-xs h-8"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Role ID Variable</Label>
        <Input
          value={data.roleIdVariable || ""}
          onChange={(e) => onChange({ roleIdVariable: e.target.value })}
          placeholder="{{row.roleId}}"
          className="text-xs h-8 font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Resume Text Variable</Label>
        <Input
          value={data.resumeTextVariable || ""}
          onChange={(e) => onChange({ resumeTextVariable: e.target.value })}
          placeholder="{{pdf.text}}"
          className="text-xs h-8 font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">System Prompt</Label>
        <Textarea
          value={data.customPrompt || ""}
          onChange={(e) => onChange({ customPrompt: e.target.value })}
          placeholder="Evaluate the candidate..."
          className="text-xs min-h-[100px]"
        />
        <p className="text-[10px] text-muted-foreground">
          Instruct the AI on how to score the resume vs role.
        </p>
      </div>
    </div>
  );
}
