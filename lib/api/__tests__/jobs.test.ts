import { describe, expect, it, vi } from "vitest";
import { spentSince } from "../jobs";

const rpc = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
	createServiceClient: () => ({ rpc: (...args: unknown[]) => rpc(...args) }),
}));
vi.mock("@vercel/queue", () => ({ send: vi.fn() }));

const SINCE = new Date("2026-10-01T00:00:00Z");

describe("spentSince", () => {
	it("sums the account's spend on a provider since an instant", async () => {
		rpc.mockResolvedValue({ data: 3.25, error: null });

		expect(await spentSince("u1", "openslop", SINCE)).toBe(3.25);
		expect(rpc).toHaveBeenCalledWith("spend_since", {
			p_user_id: "u1",
			p_provider: "openslop",
			p_since: "2026-10-01T00:00:00.000Z",
		});
	});

	// PostgREST can serialise a numeric as a string to keep its precision.
	it("reads a numeric sent as a string", async () => {
		rpc.mockResolvedValue({ data: "0.180000", error: null });

		expect(await spentSince("u1", "openslop", SINCE)).toBe(0.18);
	});

	it("throws when the query fails", async () => {
		rpc.mockResolvedValue({ data: null, error: { message: "db down" } });

		await expect(spentSince("u1", "openslop", SINCE)).rejects.toThrow(
			"Failed to read spend: db down",
		);
	});
});
