"use client";

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
    throw new Error(data.error || "The AI request could not be completed.");
  }
  return { output: data.output, mode: data.mode ?? "live" };
}
