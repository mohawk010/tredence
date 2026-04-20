"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

interface KeyValueEditorProps {
  entries: Record<string, string>;
  onChange: (entries: Record<string, string>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  label?: string;
}

export function KeyValueEditor({
  entries,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  label,
}: KeyValueEditorProps) {
  const pairs = Object.entries(entries);

  const handleAdd = () => {
    const newKey = `key_${Date.now()}`;
    onChange({ ...entries, [newKey]: "" });
  };

  const handleRemove = (key: string) => {
    const next = { ...entries };
    delete next[key];
    onChange(next);
  };

  const handleKeyChange = (oldKey: string, newKey: string) => {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(entries)) {
      if (k === oldKey) {
        next[newKey] = v;
      } else {
        next[k] = v;
      }
    }
    onChange(next);
  };

  const handleValueChange = (key: string, value: string) => {
    onChange({ ...entries, [key]: value });
  };

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      )}
      {pairs.map(([key, value], index) => (
        <div key={index} className="flex items-center gap-1.5">
          <Input
            value={key.startsWith("key_") ? "" : key}
            onChange={(e) => handleKeyChange(key, e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1 h-7 text-xs"
          />
          <Input
            value={value}
            onChange={(e) => handleValueChange(key, e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 h-7 text-xs"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => handleRemove(key)}
            className="shrink-0"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full"
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-3" />
        Add Field
      </Button>
    </div>
  );
}
