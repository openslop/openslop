import { afterEach, expect, it, vi } from "vitest";
import { runClaude } from "../process";
const mocks = vi.hoisted(() => ({ exec: vi.fn(), end: vi.fn() }));
vi.mock("node:child_process", () => ({ execFile: mocks.exec }));
vi.mock("node:fs/promises", () => ({ mkdir: vi.fn() }));
afterEach(() => {
	vi.unstubAllEnvs();
	vi.clearAllMocks();
});
it("isolates credentials and passes cancellation to a bounded process", async () => {
	vi.stubEnv("ANTHROPIC_API_KEY", "must-not-pass");
	vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "must-not-pass");
	vi.stubEnv("CLAUDE_CONFIG_DIR", "/existing-login");
	mocks.exec.mockImplementation((_file, _args, _options, done) => {
		queueMicrotask(() => done(null, '{"result":"ok"}'));
		return { stdin: { on: vi.fn(), end: mocks.end } };
	});
	const signal = new AbortController().signal;
	await runClaude("test-user", ["-p"], "prompt", signal);
	const [file, args, options] = mocks.exec.mock.calls[0];
	expect(file).toBe("claude");
	expect(args).toEqual(["-p"]);
	expect(options.env.ANTHROPIC_API_KEY).toBeUndefined();
	expect(options.env.CLAUDE_CODE_OAUTH_TOKEN).toBeUndefined();
	expect(options.env.CLAUDE_CONFIG_DIR).toContain(".openslop/claude/");
	expect(options.env.CLAUDE_CONFIG_DIR).toContain("/test-user");
	expect(options.env.CLAUDE_CODE_SAFE_MODE).toBe("1");
	expect(options.timeout).toBe(180000);
	expect(options.maxBuffer).toBe(2000000);
	expect(options.signal).toBe(signal);
	expect(options.shell).toBeUndefined();
	expect(mocks.end).toHaveBeenCalledWith("prompt");
});
it("accepts the CLI's signed-out status exit code", async () => {
	mocks.exec.mockImplementation((_file, _args, _options, done) => {
		queueMicrotask(() => done({ code: 1 }, '{"loggedIn":false}'));
		return { stdin: { on: vi.fn(), end: mocks.end } };
	});
	await expect(runClaude("user", ["auth", "status"])).resolves.toBe(
		'{"loggedIn":false}',
	);
	await expect(runClaude("user", ["-p"])).rejects.toThrow("did not complete");
});
