import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Mail,
  ListTodo,
} from "lucide-react";
import { AppShell } from "@/components/workpilot/AppShell";
import { EmptyState } from "@/components/workpilot/states";
import { useHistory } from "@/lib/history";
import type { TaskPlan } from "@/lib/workpilot-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkPilot AI — Turn meetings into action, priorities and email" },
      {
        name: "description",
        content:
          "WorkPilot AI summarizes meetings, prioritizes tasks into a realistic schedule and drafts professional emails in one workflow.",
      },
      { property: "og:title", content: "WorkPilot AI — Workplace productivity assistant" },
      {
        property: "og:description",
        content:
          "One workflow: meeting notes to action items, prioritized tasks, schedules and professional emails.",
      },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const FEATURES = [
  {
    to: "/summarizer",
    icon: FileText,
    title: "Summarize a Meeting",
    body: "Turn meeting notes into structured action items.",
  },
  {
    to: "/planner",
    icon: CalendarClock,
    title: "Plan Your Work",
    body: "Prioritize tasks and generate an efficient schedule.",
  },
  {
    to: "/email",
    icon: Mail,
    title: "Write an Email",
    body: "Create professional emails in seconds.",
  },
] as const;

function Dashboard() {
  const history = useHistory();

  const plans = history.filter((h) => h.kind === "plan");
  const allTasks = plans.flatMap((p) => (p.payload as TaskPlan).tasks ?? []);
  const done = allTasks.filter((t) => t.done).length;
  const remaining = allTasks.length - done;
  const deadlines = allTasks.filter(
    (t) => !t.done && t.deadline && t.deadline.toLowerCase() !== "not specified",
  ).length;
  const meetings = history.filter((h) => h.kind === "summary").length;

  const stats = [
    { label: "Tasks completed", value: done, icon: CheckCircle2 },
    { label: "Tasks remaining", value: remaining < 0 ? 0 : remaining, icon: ListTodo },
    { label: "Upcoming deadlines", value: deadlines, icon: Clock },
    { label: "Meetings processed", value: meetings, icon: FileText },
  ];

  return (
    <AppShell>
      <section className="surface-card overflow-hidden p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          WorkPilot AI
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting()} 👋 What would you like to accomplish today?
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Move from “what happened in the meeting?” to “what should I do first?” and “how do I
          communicate it?” — in one connected workflow.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/summarizer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start with meeting notes <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Plan my week
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ to, icon: Icon, title, body }) => (
          <Link
            key={to}
            to={to}
            className="surface-card group p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Link to="/history" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {history.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No activity yet"
            description="Summaries, plans and emails you generate will appear here for quick reuse."
          />
        ) : (
          <ul className="surface-card divide-y divide-border">
            {history.slice(0, 6).map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  {item.kind === "summary" ? (
                    <FileText className="size-4" />
                  ) : item.kind === "plan" ? (
                    <CalendarClock className="size-4" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <Link to="/history" className="text-xs font-medium text-primary hover:underline">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
