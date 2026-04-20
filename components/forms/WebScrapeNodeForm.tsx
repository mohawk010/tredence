import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WebScrapeNodeData } from "@/lib/types";

interface Props {
  data: WebScrapeNodeData;
  onChange: (data: Partial<WebScrapeNodeData>) => void;
}

export function WebScrapeNodeForm({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Node Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Web Scraper"
          className="text-xs h-8"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Target URL</Label>
        <Input
          value={data.url || ""}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://example.com"
          className="text-xs h-8"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">CSS Selector (optional)</Label>
        <Input
          value={data.selector || ""}
          onChange={(e) => onChange({ selector: e.target.value })}
          placeholder=".job-listing"
          className="text-xs h-8"
        />
        <p className="text-[10px] text-muted-foreground">
          If provided, extracts innerText from matched elements.
        </p>
      </div>
    </div>
  );
}
