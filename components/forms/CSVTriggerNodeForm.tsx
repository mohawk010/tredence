import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CSVTriggerNodeData } from "@/lib/types";

interface Props {
  data: CSVTriggerNodeData;
  onChange: (data: Partial<CSVTriggerNodeData>) => void;
}

export function CSVTriggerNodeForm({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Node Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="CSV Upload"
          className="text-xs h-8"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-xs">Mock CSV URL (for testing)</Label>
        <Input
          value={data.fileUrl || ""}
          onChange={(e) => onChange({ fileUrl: e.target.value })}
          placeholder="https://example.com/candidates.csv"
          className="text-xs h-8"
        />
        <p className="text-[10px] text-muted-foreground">
          In a live run, this data is injected by the file uploader.
        </p>
      </div>
    </div>
  );
}
