import { expect, it, vi } from "vitest";
import {
	claudeLoginUrl,
	startClaudeLogin,
	pendingClaudeLogin,
	cancelClaudeLogin,
} from "../login";
import { runClaude } from "../process";
vi.mock("../process", () => ({ runClaude: vi.fn() }));
it("accepts complete official authorization URLs, never partial or unrelated links", () => {
	expect(
		claudeLoginUrl("https://claude.com/cai/oauth/authorize?state=test\n"),
	).toContain("state=test");
	expect(
		claudeLoginUrl("https://claude.com/cai/oauth/authorize?state=par"),
	).toBeUndefined();
	expect(
		claudeLoginUrl("https://evil.example/cai/oauth/authorize\n"),
	).toBeUndefined();
	expect(claudeLoginUrl("https://[invalid\n")).toBeUndefined();
});
it("exposes the link while the CLI waits and lets the owner cancel", async () => {
	let signal: AbortSignal | undefined;
	vi.mocked(runClaude).mockImplementation(
		(_user, _args, _input, passedSignal, onOutput) => {
			signal = passedSignal;
			onOutput?.("Open https://claude.com/cai/oauth/authorize?state=test\n");
			return new Promise((_resolve, reject) =>
				passedSignal?.addEventListener("abort", () =>
					reject(new Error("cancelled")),
				),
			);
		},
	);
	const url = await startClaudeLogin("login-user");
	expect(pendingClaudeLogin("login-user").loginUrl).toBe(url);
	expect(pendingClaudeLogin("another-user").loginUrl).toBeUndefined();
	cancelClaudeLogin("login-user");
	expect(signal?.aborted).toBe(true);
	expect(pendingClaudeLogin("login-user").loginUrl).toBeUndefined();
});
