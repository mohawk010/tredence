import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PDFParseNodeData } from "@/lib/types";

interface Props {
  data: PDFParseNodeData;
  onChange: (data: Partial<PDFParseNodeData>) => void;
}

export function PDFParseNodeForm({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Node Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Resume Extractor"
          className="text-xs h-8"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs flex justify-between items-center">
          <span>File URL Variable</span>
          <span className="text-[9px] bg-muted px-1 py-0.5 rounded text-muted-foreground">Dynamic</span>
        </Label>
        <Input
          value={data.fileUrlVariable || ""}
          onChange={(e) => onChange({ fileUrlVariable: e.target.value })}
          placeholder="{{row.resumeLink}}"
          className="text-xs h-8 font-mono"
        />
        <p className="text-[10px] text-muted-foreground">
          Use {'{{...}}'} to reference variables from previous steps.
        </p>
      </div>
    </div>
  );
}
