import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();

type CookieAdapter = {
	setAll: (
		cookies: { name: string; value: string; options?: object }[],
	) => void;
};

let cookieAdapter: CookieAdapter | null = null;

vi.mock("@supabase/ssr", () => ({
	createServerClient: vi.fn(
		(_url: string, _key: string, options: { cookies: CookieAdapter }) => {
			cookieAdapter = options.cookies;
			return { auth: { getUser: mockGetUser } };
		},
	),
}));

import { updateSession } from "../middleware";

function makeRequest(path: string) {
	return new NextRequest(new URL(path, "http://localhost:3000"));
}

beforeEach(() => {
	vi.clearAllMocks();
	cookieAdapter = null;
	process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
});

describe("middleware - session refresh", () => {
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

	it("does not redirect unauthenticated user from /login", async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

		const res = await updateSession(makeRequest("/login"));
		expect(res.status).toBe(200);
	});
});

describe("middleware - refreshed cookies", () => {
	/** Mirrors what `getUser()` does when it rotates an expiring token. */
	const refreshingGetUser = (user: { id: string } | null) => async () => {
		cookieAdapter?.setAll([
			{ name: "sb-access-token", value: "refreshed", options: { path: "/" } },
		]);
		return { data: { user }, error: null };
	};

	it("keeps refreshed cookies on a pass-through response", async () => {
		mockGetUser.mockImplementation(refreshingGetUser(null));

		const res = await updateSession(makeRequest("/"));

		expect(res.cookies.get("sb-access-token")?.value).toBe("refreshed");
	});

	it("keeps refreshed cookies on the auth-route redirect", async () => {
		mockGetUser.mockImplementation(refreshingGetUser({ id: "user-1" }));

		const res = await updateSession(makeRequest("/login"));

		expect(res.status).toBe(307);
		expect(res.cookies.get("sb-access-token")?.value).toBe("refreshed");
	});
});
