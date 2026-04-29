import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockSelect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
	createClient: vi.fn(() =>
		Promise.resolve({
			from: (table: string) => {
				if (table !== "access_codes")
					throw new Error(`unexpected table: ${table}`);
				return {
					select: () => ({
						eq: (_col: string, _val: string) => ({
							single: mockSelect,
						}),
					}),
				};
			},
		}),
	),
}));

import { POST } from "../route";

function makeRequest(body?: unknown) {
	return new NextRequest(
		new URL("/api/validate-code", "http://localhost:3000"),
		{
			method: "POST",
			body: JSON.stringify(body ?? {}),
		},
	);
}

function validCode(overrides?: Record<string, unknown>) {
	return {
		id: "code-1",
		code: "ABC123",
		is_active: true,
		expires_at: null,
		...overrides,
	};
}

describe("POST /api/validate-code", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns 400 when code is missing", async () => {
		const res = await POST(makeRequest({}));
		expect(res.status).toBe(400);
		expect((await res.json()).error).toContain("Invalid code format");
	});

	it("returns 400 when code is not a string", async () => {
		const res = await POST(makeRequest({ code: 123456 }));
		expect(res.status).toBe(400);
	});

	it("returns 400 when code is wrong length", async () => {
		const res = await POST(makeRequest({ code: "ABC" }));
		expect(res.status).toBe(400);
	});

	it("returns 401 when code is not found in database", async () => {
		mockSelect.mockResolvedValue({
			data: null,
			error: { message: "not found" },
		});

		const res = await POST(makeRequest({ code: "BADCOD" }));
		expect(res.status).toBe(401);
		expect((await res.json()).error).toBe("Invalid access code");
	});

	it("returns 401 when code is inactive", async () => {
		mockSelect.mockResolvedValue({
			data: validCode({ is_active: false }),
			error: null,
		});

		const res = await POST(makeRequest({ code: "ABC123" }));
		expect(res.status).toBe(401);
		expect((await res.json()).error).toContain("no longer active");
	});

	it("returns 401 when code is expired", async () => {
		mockSelect.mockResolvedValue({
			data: validCode({ expires_at: "2020-01-01T00:00:00Z" }),
			error: null,
		});

		const res = await POST(makeRequest({ code: "ABC123" }));
		expect(res.status).toBe(401);
		expect((await res.json()).error).toContain("expired");
	});

	it("succeeds for valid code", async () => {
		mockSelect.mockResolvedValue({
			data: validCode(),
			error: null,
		});

		const res = await POST(makeRequest({ code: "ABC123" }));
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.redirect).toBe("/signup");
	});

	it("allows code with no expiry date", async () => {
		mockSelect.mockResolvedValue({
			data: validCode({ expires_at: null }),
			error: null,
		});

		const res = await POST(makeRequest({ code: "ABC123" }));
		expect(res.status).toBe(200);
	});

	it("allows code with future expiry", async () => {
		mockSelect.mockResolvedValue({
			data: validCode({ expires_at: "2099-12-31T00:00:00Z" }),
			error: null,
		});

		const res = await POST(makeRequest({ code: "ABC123" }));
		expect(res.status).toBe(200);
	});
});
