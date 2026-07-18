import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
let capturedCookies: {
	setAll: (c: { name: string; value: string; options?: object }[]) => void;
} | null = null;

vi.mock("@supabase/ssr", () => ({
	createServerClient: vi.fn(
		(
			_url: string,
			_key: string,
			options: { cookies: typeof capturedCookies },
		) => {
			capturedCookies = options.cookies;
			return { auth: { getUser: mockGetUser } };
		},
	),
}));

import { updateSession } from "../middleware";

function makeRequest(path: string) {
	return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("middleware - session refresh", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		capturedCookies = null;
		process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
	});

	it("passes through for non-auth routes when unauthenticated", async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

		const res = await updateSession(makeRequest("/"));
		expect(res.status).toBe(200);
	});

	it("passes through for non-auth routes when authenticated", async () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: "user-1" } },
			error: null,
		});

		const res = await updateSession(makeRequest("/"));
		expect(res.status).toBe(200);
	});

	it("redirects authenticated user away from /login", async () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: "user-1" } },
			error: null,
		});

		const res = await updateSession(makeRequest("/login"));
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toBe("http://localhost:3000/");
	});

	it("redirects authenticated user away from /signup", async () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: "user-1" } },
			error: null,
		});

		const res = await updateSession(makeRequest("/signup"));
		expect(res.status).toBe(307);
	});

	it("carries refreshed session cookies onto the auth-route redirect", async () => {
		mockGetUser.mockImplementation(async () => {
			capturedCookies?.setAll([
				{ name: "sb-access-token", value: "rotated-access", options: {} },
				{ name: "sb-refresh-token", value: "rotated-refresh", options: {} },
			]);
			return { data: { user: { id: "user-1" } }, error: null };
		});

		const res = await updateSession(makeRequest("/login"));

		expect(res.status).toBe(307);
		expect(res.cookies.get("sb-access-token")?.value).toBe("rotated-access");
		expect(res.cookies.get("sb-refresh-token")?.value).toBe("rotated-refresh");
	});

	it("does not redirect unauthenticated user from /login", async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

		const res = await updateSession(makeRequest("/login"));
		expect(res.status).toBe(200);
	});
});
