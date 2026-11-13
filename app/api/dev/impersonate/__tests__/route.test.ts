import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateLink = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
	createServiceClient: () => ({
		auth: { admin: { generateLink: mockGenerateLink } },
	}),
}));

const mockVerifyOtp = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
	createClient: async () => ({ auth: { verifyOtp: mockVerifyOtp } }),
}));

const { GET } = await import("@/app/api/dev/impersonate/route");

function impersonateRequest(host: string, fetchSite: string) {
	return new NextRequest(
		`http://${host}/api/dev/impersonate?email=victim@example.com`,
		{ headers: { host, "sec-fetch-site": fetchSite } },
	);
}

describe("GET /api/dev/impersonate", () => {
	beforeEach(() => {
		mockGenerateLink.mockResolvedValue({
			data: { properties: { hashed_token: "hash" } },
			error: null,
		});
		mockVerifyOtp.mockResolvedValue({ error: null });
	});

	it("signs in from the app's own page on this machine", async () => {
		const res = await GET(impersonateRequest("localhost:3000", "same-origin"));

		expect(res.status).toBe(307);
		expect(mockGenerateLink).toHaveBeenCalledWith({
			type: "recovery",
			email: "victim@example.com",
		});
	});

	it.each([
		["another site's link or redirect", "localhost:3000", "cross-site"],
		["a typed or bookmarked URL", "localhost:3000", "none"],
		["a DNS name rebound to this machine", "evil.example:3000", "same-origin"],
		["another machine on the network", "192.168.1.20:3000", "same-origin"],
	])("refuses %s", async (_case, host, fetchSite) => {
		const res = await GET(impersonateRequest(host, fetchSite));

		expect(res.status).toBe(404);
		expect(mockGenerateLink).not.toHaveBeenCalled();
		expect(mockVerifyOtp).not.toHaveBeenCalled();
	});
});
