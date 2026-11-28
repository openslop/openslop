import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { isLocalRequest } from "../local-only";

const ORIGIN = "http://localhost:3000";

const request = (
	headers: Record<string, string> = { "sec-fetch-site": "same-origin" },
	url = `${ORIGIN}/api/local/agent`,
) => new NextRequest(url, { method: "POST", headers });

afterEach(() => vi.unstubAllEnvs());

it.each([
	["a page from this origin", request()],
	["a local client, like an MCP client", request({})],
])("lets %s through in development", (_, from) => {
	vi.stubEnv("NODE_ENV", "development");
	expect(isLocalRequest(from)).toBe(true);
});

it("is closed outside development", () => {
	vi.stubEnv("NODE_ENV", "production");
	expect(isLocalRequest(request())).toBe(false);
});

it.each([
	["a remote host", request({}, "http://example.com/api/local/agent")],
	["another site", request({ "sec-fetch-site": "cross-site" })],
	["a sibling site", request({ "sec-fetch-site": "same-site" })],
	[
		"a forwarded remote host",
		request({ "x-forwarded-host": "remote.example" }),
	],
])("turns away %s", (_, from) => {
	vi.stubEnv("NODE_ENV", "development");
	expect(isLocalRequest(from)).toBe(false);
});
