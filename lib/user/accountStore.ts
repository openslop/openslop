import { createStore, type StoreApi } from "zustand/vanilla";
import { apiJson } from "@/lib/clients/http";
import type {
	ProviderKeyRecord,
	ValidationResult,
} from "@/lib/connectors/providerKey";
import type { ConnectorModels } from "@/lib/connectors/models";
import {
	MANAGED_PROVIDER,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import { createClient } from "@/lib/supabase/client";

export type AccountData = {
	/** The model each connector type falls back to across every project. */
	models: ConnectorModels;
	providerKeys: ProviderKeyRecord[];
	/** False until the stored keys have been read once. */
	loaded: boolean;
};

export type AccountContext = AccountData & {
	loadProviderKeys: () => Promise<void>;
	saveKey: (
		provider: BYOKProvider,
		apiKey: string,
	) => Promise<ValidationResult>;
	testKey: (provider: BYOKProvider) => Promise<ValidationResult>;
	removeKey: (provider: BYOKProvider) => Promise<void>;
	/** Several types at once, since one pick can cover more than one. */
	setModels: (patch: ConnectorModels) => Promise<void>;
	resetModels: () => Promise<void>;
};

export type AccountStore = StoreApi<AccountContext>;

type ProviderKeysResponse = {
	providerKeys: ProviderKeyRecord[];
	validation?: ValidationResult;
};

/**
 * The hosted provider has a key row like any other, so nothing downstream asks
 * which provider needs a key. Every account has it; API access is what makes
 * it valid today, and when it takes a key of its own it will come from the
 * server like the rest.
 */
const managedKey = (hosted: boolean): ProviderKeyRecord => ({
	provider: MANAGED_PROVIDER,
	last4: "",
	status: hosted ? "valid" : "invalid",
	verifiedAt: null,
	createdAt: "",
});

/** The account's defaults live on the user record, so they follow the login. */
async function persistModels(models: ConnectorModels): Promise<void> {
	const { error } = await createClient().auth.updateUser({
		data: { models: models },
	});
	if (error) throw new Error(`Failed to save defaults: ${error.message}`);
}

export function createAccountStore(
	models: ConnectorModels,
	hosted: boolean,
): AccountStore {
	const included = [managedKey(hosted)];
	return createStore<AccountContext>()((set, get) => {
		const applyModels = async (next: ConnectorModels) => {
			await persistModels(next);
			set({ models: next });
		};
		const applyResponse = ({
			providerKeys,
			validation,
		}: ProviderKeysResponse) => {
			set({ providerKeys: [...included, ...providerKeys], loaded: true });
			return validation ?? { ok: true as const };
		};

		return {
			models,
			providerKeys: included,
			loaded: false,

			loadProviderKeys: async () => {
				applyResponse(await apiJson<ProviderKeysResponse>("/api/providers"));
			},

			saveKey: async (provider, apiKey) =>
				applyResponse(
					await apiJson<ProviderKeysResponse>("/api/providers", {
						method: "POST",
						body: { provider, apiKey },
					}),
				),

			testKey: async (provider) =>
				applyResponse(
					await apiJson<ProviderKeysResponse>(`/api/providers/${provider}`, {
						method: "POST",
					}),
				),

			removeKey: async (provider) => {
				applyResponse(
					await apiJson<ProviderKeysResponse>(`/api/providers/${provider}`, {
						method: "DELETE",
					}),
				);
			},

			setModels: async (patch) => applyModels({ ...get().models, ...patch }),

			resetModels: async () => applyModels({}),
		};
	});
}
