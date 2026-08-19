import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Copy,
  ListTodo,
  Mail,
  Pencil,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, DisclaimerNote, PageHeader } from "@/components/workpilot/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/workpilot/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copyText, saveHistory } from "@/lib/history";
import { planTasks } from "@/lib/workpilot.functions";
import type { PlannedTask, TaskPlan } from "@/lib/workpilot-types";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner & Scheduler — WorkPilot AI" },
      {
        name: "description",
        content:
          "Enter tasks, deadlines and working hours. WorkPilot AI prioritizes the work, estimates durations and builds a daily or weekly schedule.",
      },
      { property: "og:title", content: "AI Task Planner & Scheduler — WorkPilot AI" },
      {
        property: "og:description",
        content: "Prioritized tasks, duration estimates, conflict checks and a realistic schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

const RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function planToText(p: TaskPlan) {
  return `${p.title}

FOCUS FIRST: ${p.focusFirst}

TASKS
${p.tasks
  ?.map(
    (t) =>
      `- [${t.priority}] ${t.name} (due ${t.deadline}, est ${t.estimate})\n  Why: ${t.reason}\n  Steps: ${(t.steps || []).join("; ")}`,
  )
  .join("\n")}

SCHEDULE
${p.schedule?.map((s) => `- ${s.day} ${s.start}-${s.end}: ${s.task}`).join("\n")}

CONFLICTS
${p.conflicts?.length ? p.conflicts.map((c) => `- ${c}`).join("\n") : "- None identified"}

ADVICE
${p.advice?.map((a) => `- ${a}`).join("\n")}`;
}

function priorityClass(p: string) {
  const v = (p || "").toLowerCase();
  if (v.startsWith("crit")) return "bg-destructive/10 text-destructive border-destructive/25";
  if (v.startsWith("high")) return "bg-warning/15 text-warning-foreground border-warning/30";
  if (v.startsWith("med")) return "bg-primary/10 text-primary border-primary/20";
  return "bg-secondary text-muted-foreground border-border";
}

function PlannerPage() {
  const plan = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("09:00 - 17:00");
  const [days, setDays] = useState("Monday to Friday");
  const [horizon, setHorizon] = useState<"daily" | "weekly">("weekly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaskPlan | null>(null);
  const [sortByPriority, setSortByPriority] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function run() {
    if (tasks.trim().length < 10) {
      setError("List at least one task with its deadline or priority so a plan can be built.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await plan({ data: { tasks, hours, days, horizon } });
      const withIds: TaskPlan = {
        ...res,
        tasks: (res.tasks || []).map((t, i) => ({ ...t, id: t.id || `t${i}`, done: false })),
      };
      setResult(withIds);
      saveHistory("plan", res.title || "Task plan", withIds);
      toast.success("Your plan is ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Planning failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateTask(id: string, patch: Partial<PlannedTask>) {
    setResult((r) =>
      r ? { ...r, tasks: r.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) } : r,
    );
  }

  const ordered = useMemo(() => {
    if (!result) return [];
    const list = [...result.tasks];
    if (sortByPriority)
      list.sort(
        (a, b) =>
          (RANK[(a.priority || "").toLowerCase()] ?? 9) -
          (RANK[(b.priority || "").toLowerCase()] ?? 9),
      );
    return list;
  }, [result, sortByPriority]);

  const days_ = useMemo(() => {
    const map = new Map<string, TaskPlan["schedule"]>();
    result?.schedule?.forEach((b) => {
      map.set(b.day, [...(map.get(b.day) ?? []), b]);
    });
    return [...map.entries()];
  }, [result]);

  const completed = result?.tasks.filter((t) => t.done).length ?? 0;

  return (
    <AppShell>
      <PageHeader
        icon={CalendarClock}
        title="Task Planner & Scheduler"
        description="Drop in everything on your plate. WorkPilot AI prioritizes by urgency and impact, estimates effort and builds a workable schedule."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="surface-card space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="tasks">Tasks, projects, deadlines & priorities</Label>
            <Textarea
              id="tasks"
              rows={12}
              placeholder={
                "Finish Q3 report — due Friday, high priority\nPrepare client demo — next Tuesday\nReview 4 pull requests — ~2 hours\nOnboarding doc for new hire — low priority"
              }
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="hours">Working hours</Label>
              <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="days">Working days</Label>
              <Input id="days" value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Planning horizon</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as "daily" | "weekly")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily plan</SelectItem>
                <SelectItem value="weekly">Weekly plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={loading} className="flex-1">
              <Sparkles className="size-4" /> {loading ? "Planning…" : "Generate plan"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTasks("");
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
          {loading && <LoadingState label="Prioritizing and scheduling your work…" />}
          {!loading && !result && !error && (
            <EmptyState
              icon={ListTodo}
              title="No plan yet"
              description="Add your tasks to get a prioritized list, effort estimates, a schedule and a clear first step."
            />
          )}

          {result && !loading && (
            <>
              <div className="surface-card p-5">
                <div className="flex items-start gap-3">
                  <Target className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <h2 className="text-base font-semibold">Start here</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{result.focusFirst}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {completed} of {result.tasks.length} tasks completed
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSortByPriority((v) => !v)}>
                  <ListTodo className="size-4" />
                  {sortByPriority ? "Original order" : "Reprioritize"}
                </Button>
                <Button size="sm" variant="outline" onClick={run}>
                  <RefreshCw className="size-4" /> Regenerate schedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await copyText(planToText(result));
                    toast.success("Plan copied");
                  }}
                >
                  <Copy className="size-4" /> Copy plan
                </Button>
                <Link
                  to="/email"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Mail className="size-4" /> Share an update
                </Link>
              </div>

              <Tabs defaultValue="tasks">
                <TabsList>
                  <TabsTrigger value="tasks">Priorities</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="mt-4 space-y-3">
                  {ordered.map((t) => (
                    <div key={t.id} className="surface-card p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={!!t.done}
                          onCheckedChange={(v) => updateTask(t.id, { done: !!v })}
                          className="mt-1"
                          aria-label={`Mark ${t.name} complete`}
                        />
                        <div className="min-w-0 flex-1">
                          {editingId === t.id ? (
                            <Input
                              autoFocus
                              value={t.name}
                              onChange={(e) => updateTask(t.id, { name: e.target.value })}
                              onBlur={() => setEditingId(null)}
                            />
                          ) : (
                            <p
                              className={`text-sm font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}
                            >
                              {t.name}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            Due {t.deadline} · Est. {t.estimate}
                          </p>
                          <p className="mt-2 text-xs italic text-muted-foreground">
                            Why this priority: {t.reason}
                          </p>
                          {t.steps?.length > 0 && (
                            <ul className="mt-3 space-y-1.5">
                              {t.steps.map((s, i) => (
                                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="outline" className={priorityClass(t.priority)}>
                            {t.priority}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit task"
                            onClick={() => setEditingId(t.id)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="schedule" className="mt-4">
                  {days_.length === 0 ? (
                    <EmptyState
                      icon={CalendarClock}
                      title="No schedule blocks"
                      description="Try adding working hours and deadlines, then regenerate the plan."
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {days_.map(([day, blocks]) => (
                        <div key={day} className="surface-card p-4">
                          <h3 className="text-sm font-semibold">{day}</h3>
                          <ol className="mt-3 space-y-3 border-l border-border pl-4">
                            {blocks?.map((b, i) => (
                              <li key={i} className="relative">
                                <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                                <p className="text-xs font-medium tabular-nums text-primary">
                                  {b.start} – {b.end}
                                </p>
                                <p className="text-sm">{b.task}</p>
                                {b.focus && (
                                  <p className="text-xs text-muted-foreground">{b.focus}</p>
                                )}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="insights" className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="surface-card p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <AlertTriangle className="size-4 text-warning" /> Potential conflicts
                    </h3>
                    {result.conflicts?.length ? (
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {result.conflicts.map((c, i) => <li key={i}>• {c}</li>)}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No scheduling conflicts identified.
                      </p>
                    )}
                  </div>
                  <div className="surface-card p-5">
                    <h3 className="text-sm font-semibold">Recommendations</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {(result.advice ?? []).map((a, i) => <li key={i}>• {a}</li>)}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
