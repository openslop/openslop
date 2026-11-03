import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { localClaudeAccess } from "../access";

afterEach(() => vi.unstubAllEnvs());
describe("local Claude access", () => {
	it("is unavailable outside development", () => {
		vi.stubEnv("NODE_ENV", "production");
		expect(
			localClaudeAccess(
				new NextRequest("http://localhost:5300/api/local/claude/account"),
			)?.status,
		).toBe(404);
	});
	it("accepts same-origin loopback mutations", () => {
		vi.stubEnv("NODE_ENV", "development");
		expect(
			localClaudeAccess(
				new NextRequest("http://localhost:5300/api/local/claude/account", {
					method: "POST",
					headers: { origin: "http://localhost:5300" },
				}),
			),
		).toBeNull();
	});
	it.each([
		["http://example.com", "http://example.com"],
		["http://localhost:5300", "http://evil.example"],
		["http://localhost:5300", ""],
	])("denies nonlocal and cross-origin requests: %s %s", (url, origin) => {
		vi.stubEnv("NODE_ENV", "development");
		expect(
			localClaudeAccess(
				new NextRequest(`${url}/api/local/claude/account`, {
					method: "POST",
					headers: { origin },
				}),
			)?.status,
		).toBe(403);
	});
});

it("rejects a forwarded remote hostname", () => {
	vi.stubEnv("NODE_ENV", "development");
	expect(
		localClaudeAccess(
			new NextRequest("http://localhost:5300/api/local/claude/account", {
				headers: { "x-forwarded-host": "remote.example" },
			}),
		)?.status,
	).toBe(403);
});
it("accepts a matching forwarded loopback hostname", () => {
	vi.stubEnv("NODE_ENV", "development");
	expect(
		localClaudeAccess(
			new NextRequest("http://localhost:5300/api/local/claude/account", {
				headers: { "x-forwarded-host": "localhost:5300" },
			}),
		),
	).toBeNull();
});
