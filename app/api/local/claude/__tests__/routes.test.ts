import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
	GET,
	POST as login,
	DELETE,
} from "@/app/api/local/claude/account/route";
import { POST as generate } from "@/app/api/local/claude/llm/route";
import { claudeAccount } from "@/lib/local-claude/account";
import { startClaudeLogin, cancelClaudeLogin } from "@/lib/local-claude/login";
import { runClaude } from "@/lib/local-claude/process";
import { generateWithClaude } from "@/lib/local-claude/generate";
vi.mock("@/lib/api/with-auth", () => ({
	withHostedBudget: vi.fn(),
	withApiAccess: vi.fn(),
	withPublic: vi.fn(),
	withSession: (
		_label: string,
		run: (user: { id: string }) => Promise<Response>,
	) => run({ id: "user" }),
}));
vi.mock("@/lib/local-claude/account", () => ({ claudeAccount: vi.fn() }));
vi.mock("@/lib/local-claude/login", () => ({
	startClaudeLogin: vi.fn(),
	cancelClaudeLogin: vi.fn(),
}));
vi.mock("@/lib/local-claude/process", () => ({ runClaude: vi.fn() }));
vi.mock("@/lib/local-claude/generate", () => ({ generateWithClaude: vi.fn() }));
const origin = "http://localhost:5300";
const request = (path: string, method = "GET", body?: unknown) =>
	new NextRequest(`${origin}/api/local/claude/${path}`, {
		method,
		headers: { origin, "content-type": "application/json" },
		body: body ? JSON.stringify(body) : undefined,
	});
beforeEach(() => {
	vi.stubEnv("NODE_ENV", "development");
	vi.clearAllMocks();
	vi.mocked(claudeAccount).mockResolvedValue({
		installed: true,
		connected: false,
	});
});
it("returns account status without generation", async () => {
	expect(await (await GET(request("account"))).json()).toEqual({
		installed: true,
		connected: false,
	});
	expect(generateWithClaude).not.toHaveBeenCalled();
});
it("starts browser authorization and returns its link", async () => {
	vi.mocked(startClaudeLogin).mockResolvedValue(
		"https://claude.com/cai/oauth/authorize?state=test",
	);
	const response = await login(request("account", "POST"));
	expect(response.status).toBe(200);
	expect((await response.json()).loginUrl).toContain("claude.com");
});
it("cancels a pending login before signing out", async () => {
	await DELETE(request("account", "DELETE"));
	expect(cancelClaudeLogin).toHaveBeenCalledWith("user");
	expect(runClaude).toHaveBeenCalledWith("user", ["auth", "logout"]);
});
it("surfaces account failures as actionable errors", async () => {
	vi.mocked(claudeAccount).mockRejectedValue(new Error("Install Claude Code"));
	const response = await GET(request("account"));
	expect(response.status).toBe(400);
	expect(await response.json()).toEqual({ error: "Install Claude Code" });
});
it("does not run local account code in production", async () => {
	vi.stubEnv("NODE_ENV", "production");
	expect((await GET(request("account"))).status).toBe(404);
	expect(claudeAccount).not.toHaveBeenCalled();
});
it.each([false, true])(
	"returns validated generation in the requested transport: stream=%s",
	async (stream) => {
		vi.mocked(generateWithClaude).mockResolvedValue("Hello");
		const response = await generate(
			request("llm", "POST", {
				provider: "claude-code",
				model: "Claude subscription",
				prompt: "Say hello",
				stream,
			}),
		);
		expect(response.status).toBe(200);
		expect(await response.text()).toContain('"text":"Hello"');
		expect(response.headers.get("content-type")).toContain(
			stream ? "text/event-stream" : "application/json",
		);
	},
);
it("rejects malformed requests before launching Claude", async () => {
	const response = await generate(
		request("llm", "POST", {
			provider: "claude-code",
			model: "arbitrary-command",
			prompt: "",
		}),
	);
	expect(response.status).toBe(400);
	expect(generateWithClaude).not.toHaveBeenCalled();
});
it("returns CLI failures instead of a successful empty response", async () => {
	vi.mocked(generateWithClaude).mockRejectedValue(new Error("Sign in first"));
	const response = await generate(
		request("llm", "POST", {
			provider: "claude-code",
			model: "Claude subscription",
			prompt: "hi",
		}),
	);
	expect(response.status).toBe(400);
	expect(await response.json()).toEqual({ error: "Sign in first" });
});
it("rejects cross-origin generation before accessing the CLI", async () => {
	const response = await generate(
		new NextRequest(`${origin}/api/local/claude/llm`, {
			method: "POST",
			headers: { origin: "https://evil.example" },
		}),
	);
	expect(response.status).toBe(403);
	expect(generateWithClaude).not.toHaveBeenCalled();
});
