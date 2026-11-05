import { describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { ZodError } from "zod";
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

const user = (app_metadata: Record<string, unknown>) =>
	({ id: "u1", app_metadata }) as unknown as User;

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
		const keys = await listProviderKeys(user({ api_access: true }));
		expect(keys.map((row) => row.provider)).toEqual(["openslop", "anthropic"]);
		expect(keys[1]).toMatchObject({ last4: "abcd", createdAt: "2026-01-01" });
	});

	it("marks the hosted provider by whether the account has API access", async () => {
		rows.mockReturnValue([]);
		const status = async (app_metadata: Record<string, unknown>) =>
			(await listProviderKeys(user(app_metadata)))[0]?.status;
		expect(await status({ api_access: true })).toBe("valid");
		expect(await status({ api_access: false })).toBe("invalid");
		expect(await status({})).toBe("invalid");
	});

	it("refuses an API access flag that is not a boolean", async () => {
		rows.mockReturnValue([]);
		await expect(
			listProviderKeys(user({ api_access: "true" })),
		).rejects.toThrow(ZodError);
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
