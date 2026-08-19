import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AiError, callAi, parseJson } from "./ai.server";
import type { GeneratedEmail, MeetingSummary, TaskPlan } from "./workpilot-types";

const RULES = [
  "Never invent facts, names, dates, numbers or commitments that are not present in the user input.",
  "If information is missing, write \"Not specified\" instead of guessing.",
  "Keep language concise, neutral and workplace appropriate.",
  "Return ONLY raw JSON matching the requested shape. No markdown, no commentary.",
].join(" ");

async function run<T>(system: string, user: string): Promise<T> {
  try {
    return parseJson<T>(await callAi(system, user));
  } catch (err) {
    if (err instanceof AiError) throw new Error(err.message);
    throw new Error("WorkPilot AI could not complete this request. Please try again.");
  }
}

/* ---------------- Meeting summarizer ---------------- */

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ notes: z.string().min(30), context: z.string().optional() }).parse(d),
  )
  .handler(async ({ data }): Promise<MeetingSummary> => {
    const system = `ROLE: You are a senior executive meeting assistant for a professional workplace.
TASK: Convert raw meeting notes into a structured, decision-ready meeting record.
CONTEXT: The reader is a busy professional who needs to know what happened, what was decided and what must be done next.
CONSTRAINTS: ${RULES} Owners must be people explicitly named in the notes, otherwise "Unassigned". Deadlines must be quoted as stated in the notes, otherwise "Not specified".
OUTPUT FORMAT (JSON):
{"title":string (max 8 words),"executiveSummary":string (2-4 sentences),"keyPoints":string[],"decisions":string[],"actionItems":[{"task":string,"owner":string,"deadline":string,"priority":"High"|"Medium"|"Low"}],"deadlines":string[],"followUps":string[],"unresolved":string[]}`;
    const user = `MEETING CONTEXT: ${data.context?.trim() || "Not specified"}
MEETING NOTES:
"""
${data.notes.trim()}
"""`;
    return run<MeetingSummary>(system, user);
  });

/* ---------------- Task planner ---------------- */

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        tasks: z.string().min(10),
        hours: z.string().optional(),
        days: z.string().optional(),
        horizon: z.enum(["daily", "weekly"]).default("weekly"),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<TaskPlan> => {
    const system = `ROLE: You are a pragmatic productivity strategist and scheduling expert.
TASK: Turn a messy list of tasks into a prioritised, time-boxed and realistic ${data.horizon} work plan.
CONTEXT: Prioritise using urgency (deadline proximity) and importance (impact, dependencies, blockers for others).
CONSTRAINTS: ${RULES} Respect the stated working hours and working days. Estimate durations conservatively. Break any task larger than ~2 hours into concrete steps. Always explain the priority reasoning in one short sentence. Schedule blocks must not overlap.
OUTPUT FORMAT (JSON):
{"title":string,"focusFirst":string (one sentence naming the single first task and why),"tasks":[{"id":string,"name":string,"priority":"Critical"|"High"|"Medium"|"Low","reason":string,"deadline":string,"estimate":string,"steps":string[]}],"schedule":[{"day":string,"start":"HH:MM","end":"HH:MM","task":string,"focus":string}],"conflicts":string[],"advice":string[]}`;
    const user = `WORKING HOURS: ${data.hours?.trim() || "Not specified"}
PREFERRED WORKING DAYS: ${data.days?.trim() || "Not specified"}
PLANNING HORIZON: ${data.horizon}
TASKS, PROJECTS, DEADLINES AND PRIORITIES:
"""
${data.tasks.trim()}
"""`;
    return run<TaskPlan>(system, user);
  });

/* ---------------- Email generator ---------------- */

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        purpose: z.string().min(3),
        recipient: z.string().optional(),
        points: z.string().min(3),
        tone: z.string().default("Professional"),
        cta: z.string().optional(),
        length: z.enum(["standard", "shorter", "more-formal"]).default("standard"),
        sender: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<GeneratedEmail> => {
    const lengthRule =
      data.length === "shorter"
        ? "Make the email noticeably shorter — under 120 words, no filler."
        : data.length === "more-formal"
          ? "Raise the formality: full sentences, courteous business register, no contractions."
          : "Aim for 120-200 words.";
    const system = `ROLE: You are an experienced business communication specialist.
TASK: Write one professional email that communicates the user's key points accurately.
CONTEXT: The email will be sent by a working professional to a workplace recipient.
CONSTRAINTS: ${RULES} Preserve the user's intended meaning exactly. Do not add facts, names, dates, prices or commitments the user did not provide. Use [Name] style placeholders when a detail is unknown. Tone must be ${data.tone}. ${lengthRule}
OUTPUT FORMAT (JSON):
{"subject":string,"body":string (greeting, introduction, structured body, call to action, professional closing; plain text with \\n line breaks),"tone":string,"notes":string[] (max 3 short notes about placeholders or missing details)}`;
    const user = `PURPOSE: ${data.purpose.trim()}
RECIPIENT / CONTEXT: ${data.recipient?.trim() || "Not specified"}
KEY POINTS TO COMMUNICATE:
"""
${data.points.trim()}
"""
DEADLINE OR CALL TO ACTION: ${data.cta?.trim() || "Not specified"}
SENDER SIGN-OFF NAME: ${data.sender?.trim() || "Not specified"}`;
    return run<GeneratedEmail>(system, user);
  });
