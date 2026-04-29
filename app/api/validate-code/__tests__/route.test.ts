import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
	createClient: vi.fn(() =>
		Promise.resolve({
			rpc: (fn: string, args: Record<string, unknown>) => {
				if (fn !== "validate_access_code")
					throw new Error(`unexpected function: ${fn}`);
				return mockRpc(args);
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

	it("uppercases the code before calling the RPC", async () => {
		mockRpc.mockResolvedValue({ data: "valid", error: null });

		await POST(makeRequest({ code: "abc123" }));

		expect(mockRpc).toHaveBeenCalledWith({ p_code: "ABC123" });
	});

	it("returns 401 when RPC reports invalid", async () => {
		mockRpc.mockResolvedValue({ data: "invalid", error: null });

		const res = await POST(makeRequest({ code: "BADCOD" }));
		expect(res.status).toBe(401);
		expect((await res.json()).error).toBe("Invalid access code");
	});

	it("returns 401 when RPC reports inactive", async () => {
		mockRpc.mockResolvedValue({ data: "inactive", error: null });

		const res = await POST(makeRequest({ code: "ABC123" }));
		expect(res.status).toBe(401);
		expect((await res.json()).error).toContain("no longer active");
	});

	it("returns 401 when RPC reports expired", async () => {
		mockRpc.mockResolvedValue({ data: "expired", error: null });

		const res = await POST(makeRequest({ code: "ABC123" }));
		expect(res.status).toBe(401);
		expect((await res.json()).error).toContain("expired");
	});

	it("returns 401 when RPC errors out", async () => {
		mockRpc.mockResolvedValue({
			data: null,
			error: { message: "rpc failure" },
		});

		const res = await POST(makeRequest({ code: "ABC123" }));
		expect(res.status).toBe(401);
		expect((await res.json()).error).toBe("Invalid access code");
	});

	it("succeeds for valid code", async () => {
		mockRpc.mockResolvedValue({ data: "valid", error: null });

		const res = await POST(makeRequest({ code: "ABC123" }));
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json.redirect).toBe("/signup");
	});
});
