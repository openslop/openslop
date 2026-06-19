import { test, expect } from "@playwright/test";

test.describe("public onboarding", () => {
	test("home shows the beta welcome and links to login", async ({ page }) => {
		await page.goto("/");

		await expect(
			page.getByRole("heading", { name: "Welcome to the OpenSlop Beta" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Get Started" }),
		).toBeVisible();

		await page.getByRole("link", { name: "Login" }).click();
		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
	});

	test("login page renders the magic-link form", async ({ page }) => {
		await page.goto("/login");

		await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
		await expect(page.getByLabel("Email")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Send login link" }),
		).toBeVisible();
	});

	test("signup page collects name and email", async ({ page }) => {
		await page.goto("/signup");

		await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible();
		await expect(page.getByLabel("Full name")).toBeVisible();
		await expect(page.getByLabel("Email")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Send signup link" }),
		).toBeVisible();
	});
});
