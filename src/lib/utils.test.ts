import { describe, expect, it } from "vitest";
import { asErrorMessage } from "@/lib/utils";

describe("asErrorMessage", () => {
  it("reads messages from native errors", () => {
    expect(asErrorMessage(new Error("Native failure"))).toBe("Native failure");
  });

  it("reads messages from Supabase-style error objects", () => {
    expect(asErrorMessage({ message: "Database validation failed", code: "P0001" }))
      .toBe("Database validation failed");
  });

  it("uses a safe fallback when no message is available", () => {
    expect(asErrorMessage({ code: "UNKNOWN" })).toBe("Something went wrong.");
  });
});
