"use client";

export class AiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
    this.name = "AiClientError";
  }
}

export async function postAi<T>(path: "plan" | "questions" | "breakdown", body: unknown) {
  const response = await fetch(`/api/ai/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as {
    output?: T;
    error?: string;
    code?: string;
    mode?: "demo" | "live";
  };
  if (!response.ok || !data.output) {
    throw new AiClientError(
      data.error || "The AI request could not be completed.",
      data.code || "AI_REQUEST_FAILED",
      response.status,
    );
  }
  return { output: data.output, mode: data.mode ?? "live" };
}
