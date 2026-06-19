import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: "list",
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: process.env.CI ? "npm run start" : "npm run dev",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		env: { PORT },
	},
});
