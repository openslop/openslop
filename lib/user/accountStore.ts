import { createStore, type StoreApi } from "zustand/vanilla";
import { apiJson } from "@/lib/clients/http";
import type {
	ConnectorRecord,
	ValidationResult,
} from "@/lib/connectors/connectorRecord";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { ConnectorType, ProviderKey } from "@/lib/connectors/types";
import { createClient } from "@/lib/supabase/client";

/** What the account, rather than any one project, configures. */
export type AccountData = {
	/** The model each connector type falls back to across every project. */
	models: ConnectorModels;
	connectors: ConnectorRecord[];
	/** False until the stored keys have been read once. */
	loaded: boolean;
};

export type AccountContext = AccountData & {
	loadConnectors: () => Promise<void>;
	saveKey: (provider: ProviderKey, apiKey: string) => Promise<ValidationResult>;
	testKey: (provider: ProviderKey) => Promise<ValidationResult>;
	removeKey: (provider: ProviderKey) => Promise<void>;
	setModel: (type: ConnectorType, model: string) => Promise<void>;
	/** Several types at once, so adopting a provider is one save. */
	setModels: (patch: ConnectorModels) => Promise<void>;
	/** Hands every type back to the model OpenSlop recommends. */
	resetModels: () => Promise<void>;
};

export type AccountStore = StoreApi<AccountContext>;

type ConnectorsResponse = {
	connectors: ConnectorRecord[];
	validation?: ValidationResult;
};

/** The account's defaults live on the user record, so they follow the login. */
async function persistModels(models: ConnectorModels): Promise<void> {
	const { error } = await createClient().auth.updateUser({
		data: { connectorModels: models },
	});
	if (error) throw new Error(`Failed to save defaults: ${error.message}`);
}

export function createAccountStore(models: ConnectorModels): AccountStore {
	return createStore<AccountContext>()((set, get) => {
		const applyModels = async (next: ConnectorModels) => {
			await persistModels(next);
			set({ models: next });
		};
		const applyResponse = ({ connectors, validation }: ConnectorsResponse) => {
			set({ connectors, loaded: true });
			return validation ?? { ok: true as const };
		};

		return {
			models,
			connectors: [],
			loaded: false,

			loadConnectors: async () => {
				applyResponse(await apiJson<ConnectorsResponse>("/api/connectors"));
			},

			saveKey: async (provider, apiKey) =>
				applyResponse(
					await apiJson<ConnectorsResponse>("/api/connectors", {
						method: "POST",
						body: { provider, apiKey },
					}),
				),

			testKey: async (provider) =>
				applyResponse(
					await apiJson<ConnectorsResponse>(`/api/connectors/${provider}`, {
						method: "POST",
					}),
				),

			removeKey: async (provider) => {
				applyResponse(
					await apiJson<ConnectorsResponse>(`/api/connectors/${provider}`, {
						method: "DELETE",
					}),
				);
			},

			setModel: async (type, model) =>
				applyModels({ ...get().models, [type]: model }),

			setModels: async (patch) => applyModels({ ...get().models, ...patch }),

			resetModels: async () => applyModels({}),
		};
	});
}
