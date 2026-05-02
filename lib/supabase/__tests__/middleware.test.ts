import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
	createServerClient: vi.fn(() => ({
		auth: { getUser: mockGetUser },
	})),
}));

import { updateSession } from "../middleware";

function makeRequest(path: string) {
	return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("middleware - session refresh", () => {
	beforeEach(() => {
		vi.clearAllMocks();
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

	it("does not redirect unauthenticated user from /login", async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

		const res = await updateSession(makeRequest("/login"));
		expect(res.status).toBe(200);
	});
});
