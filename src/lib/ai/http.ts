import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  AiConfigurationError,
  AiRefusalError,
} from "@/lib/ai/provider";
import { ApiRequestError } from "@/lib/ai/request";

export function aiErrorResponse(error: unknown) {
  if (error instanceof ApiRequestError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Check the request and try again.", code: "INVALID_REQUEST" },
      { status: 400 },
    );
  }
  if (error instanceof AiConfigurationError) {
    return NextResponse.json(
      { error: error.message, code: "AI_NOT_CONFIGURED" },
      { status: 503 },
    );
  }
  if (error instanceof AiRefusalError) {
    return NextResponse.json(
      { error: error.message, code: "AI_REFUSAL" },
      { status: 422 },
    );
  }

  console.error("AI request failed", error);
  return NextResponse.json(
    {
      error: "The planner could not finish that request. Please try again.",
      code: "AI_REQUEST_FAILED",
    },
    { status: 502 },
  );
}
