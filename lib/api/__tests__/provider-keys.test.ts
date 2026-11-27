import { describe, expect, it, vi } from "vitest";
import {
	deleteProviderKey,
	listProviderKeys,
	readProviderKey,
	setKeyStatus,
} from "../provider-keys";

const rows = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
	createClient: async () => ({
		from: () => ({
			select: () => ({
				eq: () => ({ order: async () => ({ data: rows(), error: null }) }),
			}),
		}),
	}),
}));
const rpc = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
	createServiceClient: () => ({ rpc }),
}));

describe("listProviderKeys", () => {
	it("lists the stored keys", async () => {
		rows.mockReturnValue([
			{
				provider: "anthropic",
				last4: "abcd",
				status: "valid",
				verified_at: null,
				created_at: "2026-01-01",
			},
		]);
		const keys = await listProviderKeys("u1");
		expect(keys).toEqual([
			{
				provider: "anthropic",
				last4: "abcd",
				status: "valid",
				verifiedAt: null,
				createdAt: "2026-01-01",
			},
		]);
	});
});

describe("the vault functions", () => {
	it.each([
		["readProviderKey", () => readProviderKey("u1", "anthropic")],
		["deleteProviderKey", () => deleteProviderKey("u1", "anthropic")],
		["setKeyStatus", () => setKeyStatus("u1", "anthropic", "valid")],
	])("%s throws with the vault's reason", async (_name, run) => {
		rpc.mockResolvedValue({
			data: null,
			error: { message: "vault unavailable" },
		});
		await expect(run()).rejects.toThrow("vault unavailable");
	});
});
