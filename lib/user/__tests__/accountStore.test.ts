import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { ProviderKeyRecord } from "@/lib/connectors/providerKey";
import type { ModelRef } from "@/lib/connectors/types";
import { createAccountStore } from "../accountStore";

const key = (provider: ProviderKeyRecord["provider"]): ProviderKeyRecord => ({
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

const updateUser = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
	createClient: () => ({ auth: { updateUser } }),
}));

const providers = (store: ReturnType<typeof createAccountStore>) =>
	store.getState().providerKeys.map((row) => row.provider);

describe("createAccountStore", () => {
	it("starts from the rows the server read", () => {
		const store = createAccountStore({
			models: {},
			providerKeys: [key("openslop")],
		});
		expect(providers(store)).toEqual(["openslop"]);
	});

	// The server answers every key change with the whole list, so the store never merges.
	it("replaces the rows with each answer and reports the validation", async () => {
		const store = createAccountStore({ models: {}, providerKeys: [] });
		apiJson.mockResolvedValueOnce({
			providerKeys: [key("openslop"), key("anthropic")],
			validation: { ok: false, error: "nope" },
		});

		const result = await store.getState().saveKey("anthropic", "sk-12345678");

		expect(result).toEqual({ ok: false, error: "nope" });
		expect(providers(store)).toEqual(["openslop", "anthropic"]);
	});
});

describe("createAccountStore model defaults", () => {
	type UpdateResult = { error: { message: string } | null };
	const ok: UpdateResult = { error: null };
	const llm: ModelRef = { provider: "anthropic", model: "claude-opus" };
	const tts: ModelRef = { provider: "elevenlabs", model: "multilingual-v2" };
	const payload = (models: ConnectorModels) => ({ data: { models } });
	const store = (models: ConnectorModels = {}) =>
		createAccountStore({ models, providerKeys: [] });

	beforeEach(() => updateUser.mockReset());

	it("merges a patch onto the current defaults and persists it", async () => {
		const s = store({ llm });
		updateUser.mockResolvedValueOnce(ok);

		await s.getState().setModels({ tts });

		expect(s.getState().models).toEqual({ llm, tts });
		expect(updateUser).toHaveBeenCalledWith(payload({ llm, tts }));
	});

	it("runs overlapping picks one at a time, each on the previous result", async () => {
		const s = store();
		const first = Promise.withResolvers<UpdateResult>();
		const second = Promise.withResolvers<UpdateResult>();
		updateUser
			.mockReturnValueOnce(first.promise)
			.mockReturnValueOnce(second.promise);

		const a = s.getState().setModels({ llm });
		const b = s.getState().setModels({ tts });
		expect(updateUser).toHaveBeenCalledTimes(1);

		first.resolve(ok);
		await a;
		expect(updateUser).toHaveBeenLastCalledWith(payload({ llm, tts }));

		second.resolve(ok);
		await b;
		expect(s.getState().models).toEqual({ llm, tts });
	});

	it("applies a reset queued behind a pick after it", async () => {
		const s = store();
		updateUser.mockResolvedValue(ok);

		await Promise.all([
			s.getState().setModels({ llm }),
			s.getState().resetModels(),
		]);

		expect(s.getState().models).toEqual({});
		expect(updateUser.mock.calls).toEqual([[payload({ llm })], [payload({})]]);
	});

	it("rejects a failed persist, leaves the store as is, and still runs the next", async () => {
		const s = store();
		updateUser
			.mockResolvedValueOnce({ error: { message: "boom" } })
			.mockResolvedValueOnce(ok);

		const a = s.getState().setModels({ llm });
		const b = s.getState().setModels({ tts });

		await expect(a).rejects.toThrow("Failed to save defaults: boom");
		await b;
		expect(s.getState().models).toEqual({ tts });
	});
});
