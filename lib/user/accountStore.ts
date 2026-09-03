import { createStore, type StoreApi } from "zustand/vanilla";
import { apiJson } from "@/lib/clients/http";
import type { ProviderKeysView } from "@/lib/api/providerKeys";
import type {
	ProviderKeyRecord,
	ValidationResult,
} from "@/lib/connectors/providerKey";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { BYOKProvider } from "@/lib/connectors/providerCatalog";
import { createClient } from "@/lib/supabase/client";

export type AccountData = {
	/** The model each connector type falls back to across every project. */
	models: ConnectorModels;
	providerKeys: ProviderKeyRecord[];
};

export type AccountContext = AccountData & {
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

/** The account's defaults live on the user record, so they follow the login. */
async function persistModels(models: ConnectorModels): Promise<void> {
	const { error } = await createClient().auth.updateUser({
		data: { models },
	});
	if (error) throw new Error(`Failed to save defaults: ${error.message}`);
}

export function createAccountStore(initial: AccountData): AccountStore {
	return createStore<AccountContext>()((set, get) => {
		const applyModels = async (next: ConnectorModels) => {
			await persistModels(next);
			set({ models: next });
		};
		const applyView = ({ providerKeys, validation }: ProviderKeysView) => {
			set({ providerKeys });
			return validation ?? { ok: true as const };
		};

		return {
			...initial,

			saveKey: async (provider, apiKey) =>
				applyView(
					await apiJson<ProviderKeysView>("/api/providers", {
						method: "POST",
						body: { provider, apiKey },
					}),
				),

			testKey: async (provider) =>
				applyView(
					await apiJson<ProviderKeysView>(`/api/providers/${provider}`, {
						method: "POST",
					}),
				),

			removeKey: async (provider) => {
				applyView(
					await apiJson<ProviderKeysView>(`/api/providers/${provider}`, {
						method: "DELETE",
					}),
				);
			},

			setModels: async (patch) => applyModels({ ...get().models, ...patch }),

			resetModels: async () => applyModels({}),
		};
	});
}
