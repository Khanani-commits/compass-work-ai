import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/workpilot/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clearHistory } from "@/lib/history";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WorkPilot AI" },
      {
        name: "description",
        content:
          "Set your default working hours, working days, sign-off name and preferred email tone for WorkPilot AI.",
      },
      { property: "og:title", content: "Settings — WorkPilot AI" },
      {
        property: "og:description",
        content: "Personalize WorkPilot AI defaults and manage locally stored activity.",
      },
    ],
  }),
  component: SettingsPage,
});

const KEY = "workpilot.settings.v1";

type Prefs = { name: string; hours: string; days: string; tone: string };
const DEFAULTS: Prefs = {
  name: "",
  hours: "09:00 - 17:00",
  days: "Monday to Friday",
  tone: "Professional",
};

function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Prefs) });
    } catch {
      /* ignore corrupted preferences */
    }
  }, []);

  function save() {
    localStorage.setItem(KEY, JSON.stringify(prefs));
    toast.success("Preferences saved");
  }

  return (
    <AppShell>
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Defaults used across WorkPilot AI. Everything is stored locally in your browser."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface-card space-y-4 p-5">
          <h2 className="text-sm font-semibold">Work preferences</h2>
          <div className="space-y-1.5">
            <Label htmlFor="name">Sign-off name</Label>
            <Input
              id="name"
              value={prefs.name}
              placeholder="Your name"
              onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hours">Default working hours</Label>
            <Input
              id="hours"
              value={prefs.hours}
              onChange={(e) => setPrefs({ ...prefs, hours: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="days">Preferred working days</Label>
            <Input
              id="days"
              value={prefs.days}
              onChange={(e) => setPrefs({ ...prefs, days: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Default email tone</Label>
            <Select value={prefs.tone} onValueChange={(v) => setPrefs({ ...prefs, tone: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Formal", "Professional", "Friendly", "Persuasive", "Concise"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={save}>Save preferences</Button>
        </div>

        <div className="space-y-6">
          <div className="surface-card space-y-3 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Responsible AI
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• AI-generated content may contain errors or omissions.</li>
              <li>• Always review outputs before using them professionally.</li>
              <li>• Never enter confidential, sensitive or personal company information.</li>
              <li>• AI recommendations are suggestions, not professional judgement.</li>
            </ul>
          </div>

          <div className="surface-card space-y-3 p-5">
            <h2 className="text-sm font-semibold">Your data</h2>
            <p className="text-sm text-muted-foreground">
              Summaries, plans and emails are stored only in this browser. Clearing removes them
              permanently.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                clearHistory();
                toast.success("All activity cleared");
              }}
            >
              <Trash2 className="size-4" /> Clear all activity
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
