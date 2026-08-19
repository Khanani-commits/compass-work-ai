import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Copy, FileText, History, Inbox, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/workpilot/AppShell";
import { EmptyState } from "@/components/workpilot/states";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { clearHistory, copyText, deleteHistory, useHistory } from "@/lib/history";
import { summaryToText } from "./summarizer";
import { planToText } from "./planner";
import type {
  GeneratedEmail,
  HistoryItem,
  MeetingSummary,
  TaskPlan,
} from "@/lib/workpilot-types";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Activity & History — WorkPilot AI" },
      {
        name: "description",
        content:
          "Review, edit, copy or delete meeting summaries, task plans and emails you generated with WorkPilot AI.",
      },
      { property: "og:title", content: "Activity & History — WorkPilot AI" },
      {
        property: "og:description",
        content: "Every summary, plan and email you generated, in one place.",
      },
    ],
  }),
  component: HistoryPage,
});

function itemToText(item: HistoryItem) {
  if (item.kind === "summary") return summaryToText(item.payload as MeetingSummary);
  if (item.kind === "plan") return planToText(item.payload as TaskPlan);
  const e = item.payload as GeneratedEmail;
  return `Subject: ${e.subject}\n\n${e.body}`;
}

const ICONS = { summary: FileText, plan: CalendarClock, email: Mail } as const;
const LABELS = { summary: "Meeting summary", plan: "Task plan", email: "Email" } as const;

function HistoryPage() {
  const items = useHistory();
  const [filter, setFilter] = useState<"all" | HistoryItem["kind"]>("all");
  const [open, setOpen] = useState<HistoryItem | null>(null);
  const [draft, setDraft] = useState("");

  const visible = items.filter((i) => filter === "all" || i.kind === filter);

  return (
    <AppShell>
      <PageHeader
        icon={History}
        title="Activity & History"
        description="Everything WorkPilot AI generated on this device. Open, edit, copy or remove any item."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="summary">Summaries</TabsTrigger>
            <TabsTrigger value="plan">Plans</TabsTrigger>
            <TabsTrigger value="email">Emails</TabsTrigger>
          </TabsList>
        </Tabs>
        {items.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => {
              clearHistory();
              toast.success("History cleared");
            }}
          >
            <Trash2 className="size-4" /> Clear all
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing here yet"
          description="Generate a meeting summary, task plan or email and it will be saved to your activity."
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((item) => {
            const Icon = ICONS[item.kind];
            return (
              <li key={item.id} className="surface-card flex items-start gap-3 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {LABELS[item.kind]} · {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDraft(itemToText(item));
                        setOpen(item);
                      }}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await copyText(itemToText(item));
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="size-4" /> Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        deleteHistory(item.id);
                        toast.success("Deleted");
                      }}
                    >
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pr-6 text-base">{open?.title}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={18}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="font-mono text-xs"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await copyText(draft);
                toast.success("Copied");
              }}
            >
              <Copy className="size-4" /> Copy
            </Button>
            <Button onClick={() => setOpen(null)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
