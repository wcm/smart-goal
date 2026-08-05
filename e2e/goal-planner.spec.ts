import { expect, test } from "@playwright/test";

test("creates, breaks down, completes, and persists a demo plan", async ({ page }) => {
  await page.goto("/");
  const goalInput = page.getByLabel("What is your goal?").first();
  const createButton = page.getByRole("button", { name: "How do I achieve it?" }).first();
  await expect(createButton).toBeEnabled();
  await page.getByRole("button", { name: "Launch a newsletter" }).first().click();
  await expect(goalInput).toHaveValue("I want to launch a newsletter");
  await goalInput.fill("Launch my first useful newsletter");
  await createButton.click();

  await expect(page).toHaveURL(/\/plans\/new/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Launch my first useful newsletter");
  await expect(page.getByRole("heading", { name: "Add context" })).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(4);
  await page.locator("textarea").first().fill("A practical weekly issue for early-stage product builders.");
  await page.getByRole("button", { name: "Build my plan" }).click();
  await expect(page).toHaveURL(/\/plans\/[a-f0-9-]+/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Launch my first useful newsletter");

  await page.getByRole("button", { name: "Break it down" }).first().click();
  await expect(page.getByLabel("Level 2, step 1").first()).toBeVisible();

  await page.getByRole("button", { name: /Mark complete: Define the finish line/ }).click();
  await expect(page.getByText(/%/).first()).not.toContainText("0%");

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Launch my first useful newsletter");
  await expect(page.getByLabel("Level 2, step 1").first()).toBeVisible();
});

test("automatically asks three context questions before creating a plan", async ({ page }) => {
  await page.goto("/plans/new?goal=Learn%20conversational%20Spanish");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learn conversational Spanish");
  await expect(page.locator("textarea")).toHaveCount(4);
  await page.locator("textarea").nth(1).fill("I want to hold a travel conversation in six months.");
  await page.getByLabel(/Anything else that feels critical/).fill("Keep the plan to three hours per week.");
  await page.getByRole("button", { name: "Build my plan" }).click();
  await expect(page).toHaveURL(/\/plans\/[a-f0-9-]+/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn conversational Spanish");
});
