import { describe, expect, it, vi } from "vitest";
import type { ConnectorRecord } from "@/lib/connectors/connectorRecord";
import { createAccountStore } from "../accountStore";

const stored: ConnectorRecord = {
	provider: "anthropic",
	last4: "abcd",
	status: "valid",
	verifiedAt: null,
	createdAt: "2026-01-01",
};

vi.mock("@/lib/clients/http", () => ({
	apiJson: vi.fn(async () => ({ connectors: [stored] })),
}));

vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));

const providers = (store: ReturnType<typeof createAccountStore>) =>
	store.getState().connectors.map((row) => row.provider);

describe("createAccountStore", () => {
	it("lists the hosted provider ahead of the stored keys", async () => {
		const store = createAccountStore({}, true);
		expect(providers(store)).toEqual(["openslop"]);

		await store.getState().loadConnectors();
		expect(providers(store)).toEqual(["openslop", "anthropic"]);
	});

	it("marks the hosted provider by whether the account has API access", () => {
		const status = (hosted: boolean) =>
			createAccountStore({}, hosted).getState().connectors[0]?.status;
		expect(status(true)).toBe("valid");
		expect(status(false)).toBe("invalid");
	});
});
