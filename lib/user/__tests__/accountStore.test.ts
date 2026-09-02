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
	it("counts the hosted provider as connected for an account with API access", async () => {
		const store = createAccountStore({}, true);
		expect(providers(store)).toEqual(["openslop"]);

		await store.getState().loadConnectors();
		expect(providers(store)).toEqual(["openslop", "anthropic"]);
	});

	it("leaves the hosted provider out for an account without API access", async () => {
		const store = createAccountStore({}, false);
		await store.getState().loadConnectors();
		expect(providers(store)).toEqual(["anthropic"]);
	});
});
