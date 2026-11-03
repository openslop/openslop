import { beforeEach, expect, it, vi } from "vitest";
import { runClaude } from "../process";
import { claudeAccount } from "../account";
import { generateWithClaude } from "../generate";
vi.mock("../process", () => ({ runClaude: vi.fn() }));
vi.mock("../account", () => ({ claudeAccount: vi.fn() }));
beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(claudeAccount).mockResolvedValue({
		installed: true,
		connected: true,
	});
});
it("requires subscription sign-in before inference", async () => {
	vi.mocked(claudeAccount).mockResolvedValue({
		installed: true,
		connected: false,
	});
	await expect(generateWithClaude("user", "hi", "system")).rejects.toThrow(
		"Sign in",
	);
	expect(runClaude).not.toHaveBeenCalled();
});
it("passes prompts through stdin with tools and customizations disabled", async () => {
	vi.mocked(runClaude).mockResolvedValue(
		JSON.stringify({ result: "hello", is_error: false }),
	);
	const signal = new AbortController().signal;
	expect(
		await generateWithClaude("user", "$(touch /tmp/no)", "system", signal),
	).toBe("hello");
	const [, args, input, passedSignal] = vi.mocked(runClaude).mock.calls[0];
	expect(args).toEqual(
		expect.arrayContaining([
			"--safe-mode",
			"--tools",
			"",
			"--strict-mcp-config",
			"--no-session-persistence",
		]),
	);
	expect(args).not.toContain("$(touch /tmp/no)");
	expect(input).toBe("$(touch /tmp/no)");
	expect(passedSignal).toBe(signal);
});
it.each([{ is_error: true, result: "quota" }, { result: "" }])(
	"rejects CLI error and empty results",
	async (result) => {
		vi.mocked(runClaude).mockResolvedValue(JSON.stringify(result));
		await expect(generateWithClaude("user", "hi", "system")).rejects.toThrow();
	},
);
