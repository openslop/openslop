import { describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { listProviderKeys } from "../providerKeys";

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
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));

const user = (api_access: boolean) =>
	({ id: "u1", app_metadata: { api_access } }) as unknown as User;

describe("listProviderKeys", () => {
	it("lists the hosted provider ahead of the stored keys", async () => {
		rows.mockReturnValue([
			{
				provider: "anthropic",
				last4: "abcd",
				status: "valid",
				verified_at: null,
				created_at: "2026-01-01",
			},
		]);
		const keys = await listProviderKeys(user(true));
		expect(keys.map((row) => row.provider)).toEqual(["openslop", "anthropic"]);
		expect(keys[1]).toMatchObject({ last4: "abcd", createdAt: "2026-01-01" });
	});

	it("marks the hosted provider by whether the account has API access", async () => {
		rows.mockReturnValue([]);
		const status = async (hosted: boolean) =>
			(await listProviderKeys(user(hosted)))[0]?.status;
		expect(await status(true)).toBe("valid");
		expect(await status(false)).toBe("invalid");
	});
});
