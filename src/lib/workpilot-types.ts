export type ActionItem = {
  task: string;
  owner: string;
  deadline: string;
  priority: "High" | "Medium" | "Low" | string;
};

export type MeetingSummary = {
  title: string;
  executiveSummary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  deadlines: string[];
  followUps: string[];
  unresolved: string[];
};

export type PlannedTask = {
  id: string;
  name: string;
  priority: "Critical" | "High" | "Medium" | "Low" | string;
  reason: string;
  deadline: string;
  estimate: string;
  steps: string[];
  done?: boolean;
};

export type ScheduleBlock = {
  day: string;
  start: string;
  end: string;
  task: string;
  focus?: string;
};

export type TaskPlan = {
  title: string;
  focusFirst: string;
  tasks: PlannedTask[];
  schedule: ScheduleBlock[];
  conflicts: string[];
  advice: string[];
};

export type GeneratedEmail = {
  subject: string;
  body: string;
  tone: string;
  notes: string[];
};

export type HistoryKind = "summary" | "plan" | "email";

export type HistoryItem = {
  id: string;
  kind: HistoryKind;
  title: string;
  createdAt: number;
  payload: MeetingSummary | TaskPlan | GeneratedEmail;
};
