const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function friendly(status: number, raw: string) {
  if (status === 429)
    return "WorkPilot AI is handling a lot of requests right now. Please wait a moment and try again.";
  if (status === 402)
    return "The AI workspace is out of credits. Add credits in Lovable to keep generating.";
  if (status === 403)
    return "AI access is currently blocked for this workspace. Contact the workspace admin.";
  if (status === 401) return "AI is not configured correctly. Please contact the app owner.";
  if (status === 400) return `The request could not be processed: ${raw.slice(0, 180)}`;
  return "WorkPilot AI could not complete this request. Please try again.";
}

/** Calls the Lovable AI Gateway and returns raw assistant text. */
export async function callAi(system: string, user: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError("AI is not configured for this app yet.", 401);

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    throw new AiError(friendly(res.status, raw), res.status);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new AiError("The AI returned an empty response. Try regenerating.", 502);
  return text;
}

/** Extracts a JSON object from a model response, tolerating code fences and prose. */
export function parseJson<T>(text: string): T {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end > start) t = t.slice(start, end + 1);
  try {
    return JSON.parse(t) as T;
  } catch {
    throw new AiError(
      "The AI response could not be read as structured output. Please regenerate.",
      502,
    );
  }
}
