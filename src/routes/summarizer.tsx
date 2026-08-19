import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Copy,
  FileText,
  ListChecks,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, DisclaimerNote, PageHeader } from "@/components/workpilot/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/workpilot/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { copyText, saveHistory } from "@/lib/history";
import { summarizeMeeting } from "@/lib/workpilot.functions";
import type { MeetingSummary } from "@/lib/workpilot-types";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "AI Meeting Notes Summarizer — WorkPilot AI" },
      {
        name: "description",
        content:
          "Paste meeting notes and get an executive summary, decisions, owners, deadlines and follow-ups in structured cards.",
      },
      { property: "og:title", content: "AI Meeting Notes Summarizer — WorkPilot AI" },
      {
        property: "og:description",
        content: "Turn raw meeting notes into decisions, action items, owners and deadlines.",
      },
    ],
  }),
  component: SummarizerPage,
});

export function summaryToText(s: MeetingSummary) {
  const list = (arr: string[]) => (arr?.length ? arr.map((i) => `- ${i}`).join("\n") : "- None");
  return `${s.title}

EXECUTIVE SUMMARY
${s.executiveSummary}

KEY DISCUSSION POINTS
${list(s.keyPoints)}

DECISIONS MADE
${list(s.decisions)}

ACTION ITEMS
${
  s.actionItems?.length
    ? s.actionItems
        .map((a) => `- ${a.task} | Owner: ${a.owner} | Due: ${a.deadline} | ${a.priority}`)
        .join("\n")
    : "- None"
}

DEADLINES
${list(s.deadlines)}

FOLLOW-UPS
${list(s.followUps)}

UNRESOLVED ISSUES
${list(s.unresolved)}`;
}

function Section({
  title,
  items,
  empty,
}: {
  title: string;
  items?: string[];
  empty: string;
}) {
  return (
    <div className="surface-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items?.length ? (
        <ul className="mt-3 space-y-2">
          {items.map((i, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function priorityClass(p: string) {
  const v = (p || "").toLowerCase();
  if (v.startsWith("crit") || v.startsWith("high"))
    return "bg-destructive/10 text-destructive border-destructive/20";
  if (v.startsWith("med")) return "bg-warning/15 text-warning-foreground border-warning/30";
  return "bg-secondary text-muted-foreground border-border";
}

function SummarizerPage() {
  const summarize = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingSummary | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  async function run() {
    if (notes.trim().length < 30) {
      setError("Add at least a few lines of meeting notes so WorkPilot AI has something to work with.");
      return;
    }
    setLoading(true);
    setError(null);
    setEditing(false);
    try {
      const res = await summarize({ data: { notes, context } });
      setResult(res);
      saveHistory("summary", res.title || "Meeting summary", res);
      toast.success("Meeting summary ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const text = result ? summaryToText(result) : "";

  return (
    <AppShell>
      <PageHeader
        icon={FileText}
        title="Meeting Summarizer"
        description="Paste your raw notes — WorkPilot AI extracts decisions, owners, deadlines and follow-ups without inventing details."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="surface-card space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="context">Meeting context (optional)</Label>
            <Input
              id="context"
              placeholder="Weekly product sync, 12 attendees"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Meeting notes</Label>
            <Textarea
              id="notes"
              rows={14}
              placeholder="Paste the full meeting notes or transcript here…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{notes.trim().length} characters</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={loading} className="flex-1">
              <Sparkles className="size-4" /> {loading ? "Summarizing…" : "Summarize meeting"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNotes("");
                setContext("");
                setResult(null);
                setError(null);
              }}
            >
              <Trash2 className="size-4" /> Clear
            </Button>
          </div>
          <DisclaimerNote />
        </div>

        <div className="space-y-4">
          {error && <ErrorState message={error} onRetry={run} />}
          {loading && <LoadingState label="Structuring your meeting notes…" />}

          {!loading && !result && !error && (
            <EmptyState
              icon={ListChecks}
              title="Your structured summary appears here"
              description="Add meeting notes on the left and WorkPilot AI will organize them into summary, decisions, action items and follow-ups."
            />
          )}

          {result && !loading && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await copyText(editing ? draft : text);
                    toast.success("Summary copied");
                  }}
                >
                  <Copy className="size-4" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!editing) setDraft(text);
                    setEditing((v) => !v);
                  }}
                >
                  {editing ? <Save className="size-4" /> : <Pencil className="size-4" />}
                  {editing ? "Done editing" : "Edit output"}
                </Button>
                <Button size="sm" variant="outline" onClick={run}>
                  <RefreshCw className="size-4" /> Regenerate
                </Button>
                <Link
                  to="/planner"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <CalendarClock className="size-4" /> Plan these actions
                </Link>
              </div>

              {editing ? (
                <Textarea
                  rows={26}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="font-mono text-xs"
                />
              ) : (
                <div className="space-y-4">
                  <div className="surface-card p-5">
                    <h2 className="text-lg font-semibold">{result.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {result.executiveSummary}
                    </p>
                  </div>

                  <div className="surface-card p-5">
                    <h3 className="text-sm font-semibold">Action items</h3>
                    {result.actionItems?.length ? (
                      <ul className="mt-3 space-y-3">
                        {result.actionItems.map((a, i) => (
                          <li key={i} className="rounded-lg border border-border p-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="text-sm font-medium">{a.task}</p>
                              <Badge variant="outline" className={priorityClass(a.priority)}>
                                {a.priority}
                              </Badge>
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              Owner: <span className="font-medium">{a.owner}</span> · Due:{" "}
                              <span className="font-medium">{a.deadline}</span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No action items were stated in these notes.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Section
                      title="Key discussion points"
                      items={result.keyPoints}
                      empty="No distinct discussion points captured."
                    />
                    <Section
                      title="Decisions made"
                      items={result.decisions}
                      empty="No decisions were recorded."
                    />
                    <Section
                      title="Deadlines mentioned"
                      items={result.deadlines}
                      empty="No deadlines were mentioned."
                    />
                    <Section
                      title="Follow-ups"
                      items={result.followUps}
                      empty="No follow-ups noted."
                    />
                    <Section
                      title="Unresolved issues"
                      items={result.unresolved}
                      empty="Nothing left unresolved."
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
