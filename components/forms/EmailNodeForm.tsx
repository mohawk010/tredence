import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EmailNodeData } from "@/lib/types";

interface Props {
  data: EmailNodeData;
  onChange: (data: Partial<EmailNodeData>) => void;
}

export function EmailNodeForm({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Node Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Send Email"
          className="text-xs h-8"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">To Element/Variable</Label>
        <Input
          value={data.to || ""}
          onChange={(e) => onChange({ to: e.target.value })}
          placeholder="{{row.email}}"
          className="text-xs h-8 font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Subject</Label>
        <Input
          value={data.subject || ""}
          onChange={(e) => onChange({ subject: e.target.value })}
          placeholder="Application Result"
          className="text-xs h-8"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Body Template</Label>
        <Textarea
          value={data.body || ""}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder="Hello {{row.name}}, ..."
          className="text-xs min-h-[120px]"
        />
        <p className="text-[10px] text-muted-foreground">
          Use {'{{...}}'} tags to inject dynamic variables.
        </p>
      </div>
    </div>
  );
}
