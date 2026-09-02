import { createStore, type StoreApi } from "zustand/vanilla";
import { apiJson } from "@/lib/clients/http";
import type {
	ConnectorRecord,
	ValidationResult,
} from "@/lib/connectors/connectorRecord";
import type { ConnectorModels } from "@/lib/connectors/models";
import {
	MANAGED_PROVIDER,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import { createClient } from "@/lib/supabase/client";

export type AccountData = {
	/** The model each connector type falls back to across every project. */
	models: ConnectorModels;
	connectors: ConnectorRecord[];
	/** False until the stored keys have been read once. */
	loaded: boolean;
};

export type AccountContext = AccountData & {
	loadConnectors: () => Promise<void>;
	saveKey: (
		provider: BYOKProvider,
		apiKey: string,
	) => Promise<ValidationResult>;
	testKey: (provider: BYOKProvider) => Promise<ValidationResult>;
	removeKey: (provider: BYOKProvider) => Promise<void>;
	/** Several types at once, since one pick can cover more than one. */
	setModels: (patch: ConnectorModels) => Promise<void>;
	/** Hands every type back to the model OpenSlop recommends. */
	resetModels: () => Promise<void>;
};

export type AccountStore = StoreApi<AccountContext>;

type ConnectorsResponse = {
	connectors: ConnectorRecord[];
	validation?: ValidationResult;
};

/**
 * The hosted provider as a connector like any other, so nothing downstream asks
 * which provider needs a key. It comes with API access today; when it takes a
 * key of its own, it will come from the server like the rest.
 */
const MANAGED_CONNECTOR: ConnectorRecord = {
	provider: MANAGED_PROVIDER,
	last4: "",
	status: "valid",
	verifiedAt: null,
	createdAt: "",
};

/** The account's defaults live on the user record, so they follow the login. */
async function persistModels(models: ConnectorModels): Promise<void> {
	const { error } = await createClient().auth.updateUser({
		data: { connectorModels: models },
	});
	if (error) throw new Error(`Failed to save defaults: ${error.message}`);
}

export function createAccountStore(
	models: ConnectorModels,
	hosted: boolean,
): AccountStore {
	const included = hosted ? [MANAGED_CONNECTOR] : [];
	return createStore<AccountContext>()((set, get) => {
		const applyModels = async (next: ConnectorModels) => {
			await persistModels(next);
			set({ models: next });
		};
		const applyResponse = ({ connectors, validation }: ConnectorsResponse) => {
			set({ connectors: [...included, ...connectors], loaded: true });
			return validation ?? { ok: true as const };
		};

		return {
			models,
			connectors: included,
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

			setModels: async (patch) => applyModels({ ...get().models, ...patch }),

			resetModels: async () => applyModels({}),
		};
	});
}
