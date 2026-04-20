import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";
import type { CSVTriggerNodeData } from "@/lib/types";

interface Props {
  data: CSVTriggerNodeData;
  onChange: (data: Partial<CSVTriggerNodeData>) => void;
}

export function CSVTriggerNodeForm({ data, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file || !file.name.endsWith(".csv")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onChange({
        fileName: file.name,
        fileContent: content,
        fileUrl: `local://${file.name}`,
      });
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function clearFile() {
    onChange({ fileName: undefined, fileContent: undefined, fileUrl: "" });
    if (inputRef.current) inputRef.current.value = "";
  }

  const hasFile = !!data.fileName;

  return (
    <div className="space-y-4">
      {/* Node Title */}
      <div className="space-y-2">
        <Label className="text-xs">Node Title</Label>
        <input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="CSV Upload"
          className="w-full text-xs h-8 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label className="text-xs">Upload CSV File</Label>

        {hasFile ? (
          /* File preview card */
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-emerald-500/40 bg-emerald-500/10">
            <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-300 truncate flex-1">{data.fileName}</span>
            <button
              onClick={clearFile}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* Drop zone */
          <div
            className={`relative flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-5 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-primary/60 bg-primary/10"
                : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">
              <span className="text-primary font-medium">Click to upload</span> or drag & drop
            </p>
            <p className="text-[10px] text-muted-foreground/60">.csv files only</p>
          </div>
        )}

        {/* Hidden native file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {hasFile && (
          <p className="text-[10px] text-muted-foreground">
            {data.fileContent?.split("\n").length ?? 0} rows loaded
          </p>
        )}
      </div>
    </div>
  );
}
