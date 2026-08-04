import { expect, test } from "@playwright/test";

test("creates, breaks down, completes, and persists a demo plan", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("What is your goal?").first().fill("Launch my first useful newsletter");
  await page.getByRole("button", { name: "How do I achieve it?" }).first().click();

  await expect(page).toHaveURL(/\/plans\/new/);
  await page.getByRole("button", { name: "How do I achieve it?" }).click();
  await expect(page).toHaveURL(/\/plans\/[a-f0-9-]+/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Launch my first useful newsletter");

  await page.getByRole("button", { name: "Break it down" }).first().click();
  await expect(page.getByText("LEVEL 2").first()).toBeVisible();

  await page.getByRole("button", { name: /Mark complete: Define the finish line/ }).click();
  await expect(page.getByText(/%/).first()).not.toContainText("0%");

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Launch my first useful newsletter");
  await expect(page.getByText("LEVEL 2").first()).toBeVisible();
});

test("uses context questions before creating a plan", async ({ page }) => {
  await page.goto("/plans/new?goal=Learn%20conversational%20Spanish");
  await page.getByRole("button", { name: "Add more context" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator("textarea").nth(1).fill("I want to hold a travel conversation in six months.");
  await page.getByRole("button", { name: "Update the plan" }).click();
  await expect(page).toHaveURL(/\/plans\/[a-f0-9-]+/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn conversational Spanish");
});
