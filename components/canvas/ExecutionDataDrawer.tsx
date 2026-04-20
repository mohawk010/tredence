"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X, Minus, Users, BarChart2, CheckCircle2, XCircle,
  AlertCircle, Mail, MailCheck, Send, Loader2, ThumbsUp, ThumbsDown, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CandidateResult {
  name: string;
  email: string;
  roleName?: string;
  matchedRole?: string | null;
  fitScore: number;
  recommendation: "APPROVE" | "REJECT" | "REVIEW";
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  emailSent?: boolean;
  emailBody?: string;
  emailSubject?: string;
  hrDecision?: string;
  error?: boolean;
}

interface ExecutionDataDrawerProps {
  open: boolean;
  onClose: () => void;
  csvContent?: string;
  csvFileName?: string;
  executionResults?: CandidateResult[];
  isExecuting?: boolean;
  executingIndex?: number;
}

function parseCSV(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const delimiter = lines[0].includes(",") ? "," : lines[0].includes(";") ? ";" : "\t";
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
  return { headers, rows };
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 45 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[11px] font-mono font-semibold w-7 text-right">{score}</span>
    </div>
  );
}

function RecommendationBadge({ rec }: { rec: string }) {
  if (rec === "APPROVE") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 text-[10px] font-bold">
      <CheckCircle2 className="size-2.5" /> APPROVE
    </span>
  );
  if (rec === "REJECT") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 text-[10px] font-bold">
      <XCircle className="size-2.5" /> REJECT
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-bold">
      <AlertCircle className="size-2.5" /> REVIEW
    </span>
  );
}

export function ExecutionDataDrawer({
  open, onClose, csvContent, csvFileName,
  executionResults, isExecuting, executingIndex,
}: ExecutionDataDrawerProps) {
  const [minimized, setMinimized]       = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [expandedRow, setExpandedRow]   = useState<number | null>(null);
  const [hrDecisions, setHrDecisions]   = useState<Record<number, string>>({});
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [emailsSentCount, setEmailsSentCount] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (open) {
      setMinimized(false);
      setEmailsSentCount(null);
      setHrDecisions({});
    }
  }, [open]);

  // Auto-set HR decision from AI recommendation when results arrive
  useEffect(() => {
    if (executionResults) {
      const defaults: Record<number, string> = {};
      executionResults.forEach((r, i) => {
        if (hrDecisions[i] === undefined) defaults[i] = r.recommendation;
      });
      if (Object.keys(defaults).length) setHrDecisions((prev) => ({ ...defaults, ...prev }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionResults?.length]);

  const { headers, rows } = useMemo(() => {
    if (!csvContent || (executionResults && executionResults.length > 0)) return { headers: [], rows: [] };
    return parseCSV(csvContent);
  }, [csvContent, executionResults]);

  const handleSendEmails = useCallback(async () => {
    if (!executionResults) return;
    const toSend = executionResults
      .filter((_, i) => hrDecisions[i] === "APPROVE")
      .map((r, origIdx) => {
        const idx = executionResults.indexOf(r);
        return { ...r, hrDecision: hrDecisions[idx] ?? r.recommendation };
      });

    if (!toSend.length) {
      alert("No candidates marked as APPROVE. Change at least one decision to APPROVE before sending.");
      return;
    }

    setIsSendingEmails(true);
    try {
      const res = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: toSend }),
      });
      const data = await res.json();
      setEmailsSentCount(data.sent);
    } catch (err) {
      console.error("Send emails failed:", err);
      alert("Failed to send emails. Check SMTP configuration.");
    } finally {
      setIsSendingEmails(false);
    }
  }, [executionResults, hrDecisions]);

  if (!mounted || !open) return null;

  const hasResults = (executionResults?.length ?? 0) > 0;
  const approved   = Object.values(hrDecisions).filter((d) => d === "APPROVE").length;
  const rejected   = Object.values(hrDecisions).filter((d) => d === "REJECT").length;
  const inReview   = Object.values(hrDecisions).filter((d) => d === "REVIEW").length;

  // ── Minimized chip ──────────────────────────────────────────────
  if (minimized) {
    return createPortal(
      <button
        onClick={() => setMinimized(false)}
        style={{ position: "fixed", bottom: 24, left: 260, zIndex: 99999 }}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border shadow-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
      >
        <BarChart2 className="size-3.5 text-emerald-500" />
        {isExecuting ? "AI Evaluating..." : "HR Review Panel"}
        <span className="bg-emerald-500/15 text-emerald-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {hasResults ? executionResults!.length : rows.length}
        </span>
      </button>,
      document.body
    );
  }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Backdrop */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
        onClick={() => setMinimized(true)}
      />

      {/* Modal */}
      <div
        style={{ position: "relative", zIndex: 1, width: "min(980px, 94vw)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
        className="rounded-xl bg-card border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="size-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">
                {hasResults ? "HR Review Panel" : isExecuting ? "AI Evaluating Candidates..." : "CSV Preview"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {csvFileName && `${csvFileName} · `}
                {hasResults
                  ? `${executionResults!.length} candidates evaluated by AI — set your decisions below`
                  : isExecuting
                  ? `Processing candidate ${(executingIndex ?? 0) + 1}...`
                  : `${rows.length} candidates in CSV`}
              </p>
            </div>

            {/* Decision summary pills */}
            {hasResults && (
              <div className="flex items-center gap-1.5 ml-1">
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-semibold">{approved} Approve</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-semibold">{inReview} Review</span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-semibold">{rejected} Reject</span>
              </div>
            )}

            {isExecuting && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-semibold animate-pulse">
                <Loader2 className="size-3 animate-spin" />
                Gemini evaluating...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized(true)} title="Minimize" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Minus className="size-4" /></button>
            <button onClick={onClose} title="Close" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="size-4" /></button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-auto">

          {/* Real AI Results with HR controls */}
          {hasResults ? (
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10 border-b border-border/40">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-8">#</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Candidate</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Matched Role</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">AI Score</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">AI Rec.</th>
                  <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">HR Decision</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Email</th>
                </tr>
              </thead>
              <tbody>
                {executionResults!.map((r, i) => {
                  const decision = hrDecisions[i] ?? r.recommendation;
                  return (
                    <React.Fragment key={i}>
                      <tr
                        className={cn(
                          "border-t border-border/30 transition-colors",
                          i % 2 === 1 && "bg-muted/5",
                          decision === "APPROVE" && "bg-green-500/5",
                          decision === "REJECT"  && "bg-red-500/5",
                        )}
                      >
                        <td className="px-4 py-2.5 text-muted-foreground/40 font-mono">{i + 1}</td>
                        <td className="px-4 py-2.5">
                          <p className="font-semibold">{r.name || "—"}</p>
                          <p className="text-[10px] text-muted-foreground">{r.email}</p>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{r.matchedRole || r.roleName || "—"}</td>
                        <td className="px-4 py-2.5"><ScoreBar score={r.fitScore} /></td>
                        <td className="px-4 py-2.5"><RecommendationBadge rec={r.recommendation} /></td>

                        {/* HR Decision override buttons */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setHrDecisions((prev) => ({ ...prev, [i]: "APPROVE" }))}
                              title="Approve"
                              className={cn("p-1.5 rounded-md transition-colors", decision === "APPROVE" ? "bg-green-500 text-white" : "text-muted-foreground hover:bg-green-500/10 hover:text-green-500")}
                            ><ThumbsUp className="size-3.5" /></button>
                            <button
                              onClick={() => setHrDecisions((prev) => ({ ...prev, [i]: "REVIEW" }))}
                              title="Keep in review"
                              className={cn("p-1.5 rounded-md transition-colors", decision === "REVIEW" ? "bg-amber-500 text-white" : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500")}
                            ><Eye className="size-3.5" /></button>
                            <button
                              onClick={() => setHrDecisions((prev) => ({ ...prev, [i]: "REJECT" }))}
                              title="Reject"
                              className={cn("p-1.5 rounded-md transition-colors", decision === "REJECT" ? "bg-red-500 text-white" : "text-muted-foreground hover:bg-red-500/10 hover:text-red-500")}
                            ><ThumbsDown className="size-3.5" /></button>
                            <button
                              onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                              title="View details"
                              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                            ><AlertCircle className="size-3.5" /></button>
                          </div>
                        </td>

                        <td className="px-4 py-2.5">
                          {r.emailSent
                            ? <span className="flex items-center gap-1 text-green-500 text-[10px]"><MailCheck className="size-3" />Sent</span>
                            : <span className="flex items-center gap-1 text-muted-foreground/50 text-[10px]"><Mail className="size-3" />Pending</span>
                          }
                        </td>
                      </tr>

                      {/* Expanded row — AI summary */}
                      {expandedRow === i && (
                        <tr className="border-t border-border/20">
                          <td colSpan={7} className="px-6 py-4 bg-muted/20">
                            <p className="text-[12px] text-foreground/80 mb-3 leading-relaxed">{r.summary}</p>
                            <div className="grid grid-cols-2 gap-4">
                              {(r.strengths?.length ?? 0) > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold text-green-500 mb-1.5 uppercase tracking-wide">Strengths</p>
                                  <ul className="space-y-0.5">{r.strengths!.map((s, j) => <li key={j} className="text-[11px] text-muted-foreground">• {s}</li>)}</ul>
                                </div>
                              )}
                              {(r.weaknesses?.length ?? 0) > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold text-red-400 mb-1.5 uppercase tracking-wide">Areas of Concern</p>
                                  <ul className="space-y-0.5">{r.weaknesses!.map((s, j) => <li key={j} className="text-[11px] text-muted-foreground">• {s}</li>)}</ul>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

          ) : isExecuting ? (
            /* Loading state while AI evaluates */
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="size-8 text-emerald-500 animate-spin" />
              <p className="text-sm text-foreground font-medium">AI is evaluating candidates...</p>
              <p className="text-[11px] text-muted-foreground">Processing candidate {(executingIndex ?? 0) + 1} — results will appear here in real-time</p>
            </div>

          ) : rows.length > 0 ? (
            /* Raw CSV preview */
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-10">#</th>
                  {headers.map((h) => <th key={h} className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={cn("border-t border-border/30 hover:bg-muted/30 transition-colors", i % 2 === 1 && "bg-muted/10")}>
                    <td className="px-4 py-2 text-muted-foreground/40 font-mono">{i + 1}</td>
                    {headers.map((h) => <td key={h} className="px-4 py-2 whitespace-nowrap max-w-[200px] truncate">{row[h] || <span className="text-muted-foreground/30 italic">—</span>}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center text-sm text-muted-foreground py-20">
              No CSV data — upload a file in the CSV Trigger node first.
            </div>
          )}
        </div>

        {/* ── Footer with Send Emails action ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/20 shrink-0">
          <p className="text-[10px] text-muted-foreground">
            {hasResults
              ? `${approved} approved · ${inReview} in review · ${rejected} rejected — only APPROVED candidates will receive emails`
              : `${rows.length} rows in CSV`}
          </p>

          <div className="flex items-center gap-3">
            {emailsSentCount !== null && (
              <span className="flex items-center gap-1.5 text-[11px] text-green-500 font-medium">
                <MailCheck className="size-3.5" /> {emailsSentCount} emails sent successfully
              </span>
            )}

            {hasResults && !isExecuting && (
              <button
                onClick={handleSendEmails}
                disabled={isSendingEmails || approved === 0}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all",
                  approved > 0 && !isSendingEmails
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isSendingEmails
                  ? <><Loader2 className="size-3.5 animate-spin" /> Sending...</>
                  : <><Send className="size-3.5" /> Send Emails to {approved} Approved</>
                }
              </button>
            )}

            <button onClick={onClose} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2">Dismiss</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
