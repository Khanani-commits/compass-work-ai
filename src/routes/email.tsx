import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Copy, Mail, MessageSquare, RefreshCw, Sparkles, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DisclaimerNote, PageHeader } from "@/components/workpilot/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/workpilot/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copyText, saveHistory } from "@/lib/history";
import { generateEmail } from "@/lib/workpilot.functions";
import type { GeneratedEmail } from "@/lib/workpilot-types";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkPilot AI" },
      {
        name: "description",
        content:
          "Generate professional workplace emails with the right tone, structure and call to action — fully editable before you send.",
      },
      { property: "og:title", content: "Smart Email Generator — WorkPilot AI" },
      {
        property: "og:description",
        content: "Professional, tone-controlled emails that preserve your intended meaning.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Professional", "Friendly", "Persuasive", "Concise"];

function EmailPage() {
  const gen = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [points, setPoints] = useState("");
  const [cta, setCta] = useState("");
  const [sender, setSender] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedEmail | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  async function run(length: "standard" | "shorter" | "more-formal" = "standard", nextTone = tone) {
    if (purpose.trim().length < 3 || points.trim().length < 3) {
      setError("Add the purpose of the email and at least one key point you want to communicate.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await gen({
        data: { purpose, recipient, points, tone: nextTone, cta, sender, length },
      });
      setResult(res);
      setSubject(res.subject);
      setBody(res.body);
      saveHistory("email", res.subject || "Generated email", res);
      toast.success("Email drafted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Turn a few bullet points into a clear, professional email. Nothing is invented — unknown details become placeholders."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="surface-card space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="purpose">Purpose of the email</Label>
            <Input
              id="purpose"
              placeholder="Request a deadline extension"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recipient">Recipient / context</Label>
            <Input
              id="recipient"
              placeholder="My manager, aware of the project delay"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="points">Key points</Label>
            <Textarea
              id="points"
              rows={7}
              placeholder={"Report is 80% complete\nData from finance arrived late\nNeed 3 extra days"}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cta">Deadline or call to action (optional)</Label>
            <Input
              id="cta"
              placeholder="Confirm by Thursday"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sender">Your name (optional)</Label>
              <Input id="sender" value={sender} onChange={(e) => setSender(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select
                value={tone}
                onValueChange={(v) => {
                  setTone(v);
                  if (result) void run("standard", v);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => run()} disabled={loading} className="flex-1">
              <Sparkles className="size-4" /> {loading ? "Writing…" : "Generate email"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPurpose("");
                setRecipient("");
                setPoints("");
                setCta("");
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
          {error && <ErrorState message={error} onRetry={() => run()} />}
          {loading && <LoadingState label="Drafting a professional email…" />}
          {!loading && !result && !error && (
            <EmptyState
              icon={MessageSquare}
              title="Your draft appears here"
              description="Describe the purpose and key points, choose a tone, and WorkPilot AI writes a ready-to-edit email."
            />
          )}

          {result && !loading && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await copyText(`Subject: ${subject}\n\n${body}`);
                    toast.success("Email copied");
                  }}
                >
                  <Copy className="size-4" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => run()}>
                  <RefreshCw className="size-4" /> Regenerate
                </Button>
                <Button size="sm" variant="outline" onClick={() => run("shorter")}>
                  <Wand2 className="size-4" /> Make shorter
                </Button>
                <Button size="sm" variant="outline" onClick={() => run("more-formal")}>
                  <Wand2 className="size-4" /> More professional
                </Button>
              </div>

              <div className="surface-card space-y-4 p-5">
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="body">Email body — edit freely before sending</Label>
                  <Textarea
                    id="body"
                    rows={18}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="leading-relaxed"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Tone: {result.tone || tone}</p>
              </div>

              {result.notes?.length > 0 && (
                <div className="surface-card p-5">
                  <h3 className="text-sm font-semibold">Before you send</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.notes.map((n, i) => <li key={i}>• {n}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
