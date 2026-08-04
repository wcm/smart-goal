import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createId() {
  return crypto.randomUUID();
}

export function asErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
