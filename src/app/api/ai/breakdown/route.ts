import { NextResponse } from "next/server";
import { createAiProvider } from "@/lib/ai/provider";
import { aiErrorResponse } from "@/lib/ai/http";
import { authorizeAiRequest } from "@/lib/ai/request";
import { GenerateBreakdownInputSchema } from "@/lib/ai/schemas";
import { isDemoAiEnabled } from "@/lib/config";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const input = GenerateBreakdownInputSchema.parse(await request.json());
    const provider = createAiProvider();
    const identity = await authorizeAiRequest({ targetDepth: input.targetDepth });
    const output = await provider.generateBreakdown(input, identity);
    return NextResponse.json({ output, mode: isDemoAiEnabled() ? "demo" : "live" });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
