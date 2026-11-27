import { beforeEach, expect, it, vi } from "vitest";
import { ClaudeNotInstalledError, runClaude } from "../process";
import { claudeAccount } from "../account";
vi.mock("../process", async (importOriginal) => ({
	...(await importOriginal<typeof import("../process")>()),
	runClaude: vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());
it("does not treat API-key authentication as a subscription", async () => {
	vi.mocked(runClaude).mockResolvedValue(
		JSON.stringify({
			loggedIn: true,
			authMethod: "api_key",
			email: "person@example.com",
		}),
	);
	expect((await claudeAccount("user")).connected).toBe(false);
});
it("returns only public subscription status", async () => {
	vi.mocked(runClaude).mockResolvedValue(
		JSON.stringify({
			loggedIn: true,
			authMethod: "claude.ai",
			subscriptionType: "max",
			email: "person@example.com",
			token: "secret",
		}),
	);
	expect(await claudeAccount("user")).toEqual({
		installed: true,
		connected: true,
		subscription: "max",
		email: "person@example.com",
	});
});
it("reports a missing CLI as setup required", async () => {
	vi.mocked(runClaude).mockRejectedValue(new ClaudeNotInstalledError());
	expect(await claudeAccount("user")).toEqual({
		installed: false,
		connected: false,
	});
});
