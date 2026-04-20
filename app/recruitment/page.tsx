"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Upload04Icon,
  PlayIcon,
  Tick02Icon,
  Cancel01Icon,
  Mail01Icon
} from "@hugeicons/core-free-icons";

// Expected CSV format Headers: name, email, dob, city, roleId, resumeLink

interface Candidate {
  id: string;
  name: string;
  email: string;
  roleId: string;
  resumeLink: string;
  status: "PENDING" | "EVALUATING" | "EVALUATED" | "EMAILED";
  aiScore?: number;
  aiReason?: string;
  selected?: boolean;
}

export default function RecruitmentDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const newCands: Candidate[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",").map(v => v.trim());
        const cand: any = {};
        headers.forEach((h, index) => { cand[h] = values[index]; });
        
        if (cand.name && cand.email) {
          newCands.push({
            id: Math.random().toString(36).substr(2, 9),
            name: cand.name,
            email: cand.email,
            roleId: cand.roleid || "General",
            resumeLink: cand.resumelink || "",
            status: "PENDING",
          });
        }
      }
      setCandidates(newCands);
    };
    reader.readAsText(file);
  };

  const runEvaluation = async () => {
    setIsProcessing(true);
    const updated = [...candidates];
    
    for (let current of updated) {
      if (current.status !== "PENDING") continue;
      current.status = "EVALUATING";
      setCandidates([...updated]);

      try {
        // Run AI pipeline
        const res = await fetch("/api/simulate/node", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "geminiEval",
            data: { testResumeText: "Will fetch from Resume Link...", testRoleDescription: "Looking for fit for role ID: " + current.roleId }
          })
        });
        const json = await res.json();
        
        if (json.success && json.data) {
          current.aiScore = json.data.fitScore;
          current.aiReason = json.data.recommendation + ": " + json.data.summary;
          current.selected = json.data.recommendation === "APPROVE";
        } else {
          current.aiReason = "Failed to evaluate";
          current.aiScore = 0;
        }
      } catch (err) {
        current.aiReason = "Parse Error";
      }

      current.status = "EVALUATED";
      setCandidates([...updated]);
    }
    
    setIsProcessing(false);
  };

  const handleSendEmails = async () => {
    const selected = candidates.filter(c => c.selected && c.status === "EVALUATED");
    if (!selected.length) return alert("Select candidates to email first.");
    
    const proceed = confirm(`Are you sure you want to send decision emails to ${selected.length} candidates?`);
    if (!proceed) return;

    const updated = [...candidates];
    
    for (const cand of selected) {
      try {
        await fetch("/api/simulate/node", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "email",
            data: {
              to: cand.email,
              subject: "Update on your application with Tredence",
              body: `Hello ${cand.name},\n\nWe have reviewed your profile for role ${cand.roleId}. Based on our AI pre-screening, we have decided to move forward with your application. Expect to hear from a human recruiter soon!\n\nBest,\nHR Team`
            }
          })
        });
        
        const index = updated.findIndex(u => u.id === cand.id);
        if (index > -1) {
          updated[index].status = "EMAILED";
        }
      } catch (err) {
        console.error("Email failed", err);
      }
    }
    setCandidates(updated);
    alert("Emails dispatched!");
  };

  const toggleSelect = (id: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  return (
    <div className="min-h-screen bg-background border-l p-8 max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Automated Recruitment Pipeline</h1>
        <p className="text-muted-foreground text-sm">Upload candidate CSVs, run AI evaluation against target roles, and trigger automated outreach.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="col-span-1 border rounded-xl p-6 bg-card flex flex-col items-center justify-center text-center shadow-sm">
          <div className="size-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} />
          </div>
          <h3 className="font-semibold mb-1">Upload Candidates</h3>
          <p className="text-xs text-muted-foreground mb-4">CSV Format: name, email, roleid, resumelink</p>
          <Input type="file" accept=".csv" className="max-w-[220px] text-xs" onChange={handleFileUpload} />
        </div>

        {/* Action Panel */}
        <div className="col-span-2 border rounded-xl p-6 bg-card flex flex-col justify-center gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{candidates.length} Candidates Loaded</h3>
              <p className="text-xs text-muted-foreground">Ready for AI parsing and evaluation.</p>
            </div>
            <Button onClick={runEvaluation} disabled={isProcessing || !candidates.length}>
              {isProcessing ? <Spinner className="size-4 mr-2" /> : <HugeiconsIcon icon={PlayIcon} className="size-4 mr-2" />}
              Run AI Evaluation
            </Button>
          </div>
          
          <div className="h-px bg-border my-2" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Human-in-the-Loop Approval</h3>
              <p className="text-xs text-muted-foreground">Review recommendations before automated emails.</p>
            </div>
            <Button variant="secondary" onClick={handleSendEmails} disabled={isProcessing || !candidates.some(c => c.selected && c.status === "EVALUATED")}>
              <HugeiconsIcon icon={Mail01Icon} className="size-4 mr-2" />
              Approve & Dispatch Emails
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground w-[40px]">Select</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Candidate</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Role ID</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">AI Score</th>
              <th className="px-4 py-3 font-medium text-muted-foreground max-w-[300px]">AI Reasoning</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">No candidates uploaded yet.</td>
              </tr>
            ) : (
              candidates.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={c.selected || false} 
                      onChange={() => toggleSelect(c.id)}
                      disabled={c.status !== "EVALUATED"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{c.roleId}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {c.status === "EVALUATING" ? (
                      <Spinner className="size-4 text-primary" />
                    ) : c.aiScore !== undefined ? (
                      <span className={`font-bold ${c.aiScore > 75 ? "text-emerald-600" : c.aiScore > 50 ? "text-amber-500" : "text-red-500"}`}>
                        {c.aiScore}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[300px]">
                    <p className="text-[11px] text-foreground truncate" title={c.aiReason}>
                      {c.aiReason || "Pending evaluation..."}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {c.status === "EMAILED" ? (
                       <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Emailed</Badge>
                    ) : c.status === "EVALUATED" ? (
                       <Badge variant={c.selected ? "default" : "secondary"}>{c.selected ? "Approved" : "Reviewed"}</Badge>
                    ) : (
                       <Badge variant="outline">{c.status}</Badge>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
