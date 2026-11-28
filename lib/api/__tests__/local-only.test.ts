import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { isLocalRequest } from "../local-only";

const ORIGIN = "http://localhost:3000";

const request = (
	url = `${ORIGIN}/api/local/agent`,
	headers: Record<string, string> = { origin: ORIGIN },
) => new NextRequest(url, { method: "POST", headers });

afterEach(() => vi.unstubAllEnvs());

it("lets a same-origin loopback page through in development", () => {
	vi.stubEnv("NODE_ENV", "development");
	expect(isLocalRequest(request())).toBe(true);
});

it("lets a local client that sends no Origin through, like an MCP client", () => {
	vi.stubEnv("NODE_ENV", "development");
	expect(isLocalRequest(request(undefined, {}))).toBe(true);
});

it("is closed outside development", () => {
	vi.stubEnv("NODE_ENV", "production");
	expect(isLocalRequest(request())).toBe(false);
});

it.each([
	[
		"a remote host",
		request("http://example.com/api/local/agent", {
			origin: "http://example.com",
		}),
	],
	["another origin", request(undefined, { origin: "http://evil.example" })],
	[
		"a forwarded remote host",
		request(undefined, {
			origin: ORIGIN,
			"x-forwarded-host": "remote.example",
		}),
	],
])("turns away %s", (_, from) => {
	vi.stubEnv("NODE_ENV", "development");
	expect(isLocalRequest(from)).toBe(false);
});
