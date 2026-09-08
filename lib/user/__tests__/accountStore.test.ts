import { describe, expect, it, vi } from "vitest";
import type {
	HostedProviderKey,
	StoredProviderKey,
} from "@/lib/connectors/providerKey";
import { createAccountStore } from "../accountStore";

const hosted: HostedProviderKey = { provider: "openslop", status: "valid" };

const key = (provider: StoredProviderKey["provider"]): StoredProviderKey => ({
	provider,
	last4: "abcd",
	status: "valid",
	verifiedAt: null,
	createdAt: "2026-01-01",
});

const apiJson = vi.fn();
vi.mock("@/lib/clients/http", () => ({
	apiJson: (...args: unknown[]) => apiJson(...args),
}));

vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));

const providers = (store: ReturnType<typeof createAccountStore>) =>
	store.getState().providerKeys.map((row) => row.provider);

describe("createAccountStore", () => {
	it("starts from the rows the server read", () => {
		const store = createAccountStore({
			models: {},
			providerKeys: [hosted],
		});
		expect(providers(store)).toEqual(["openslop"]);
	});

	// The server answers every key change with the whole list, so the store never merges.
	it("replaces the rows with each answer and reports the validation", async () => {
		const store = createAccountStore({ models: {}, providerKeys: [] });
		apiJson.mockResolvedValueOnce({
			providerKeys: [hosted, key("anthropic")],
			validation: { ok: false, error: "nope" },
		});

		const result = await store.getState().saveKey("anthropic", "sk-12345678");

		expect(result).toEqual({ ok: false, error: "nope" });
		expect(providers(store)).toEqual(["openslop", "anthropic"]);
	});
});
