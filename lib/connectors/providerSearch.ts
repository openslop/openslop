import { MODELS, modalitiesFor } from "./models";
import { ALL_PROVIDERS, providerMeta } from "./providerCatalog";
import type { ConnectorType, ProviderKey } from "./types";

export type ConnectorMatch = { provider: ProviderKey; models: string[] };

const modelNamesFor = (provider: ProviderKey): string[] => [
	...new Set(
		modalitiesFor(provider).flatMap((type) =>
			Object.keys(MODELS[type][provider] ?? {}),
		),
	),
];

/**
 * Connectors matching a query, which may name either the provider or one of
 * its models: someone who knows the model they want should not have to know
 * who serves it. The matched models come back so a row can say why it is here.
 * An absent capability filter matches everything.
 */
export function searchConnectors(
	query: string,
	capability: ConnectorType[] | null,
): ConnectorMatch[] {
	const needle = query.trim().toLowerCase();
	return ALL_PROVIDERS.flatMap((provider) => {
		const modalities = modalitiesFor(provider);
		if (capability && !capability.some((type) => modalities.includes(type)))
			return [];
		if (!needle) return [{ provider, models: [] }];

		const models = modelNamesFor(provider).filter((name) =>
			name.toLowerCase().includes(needle),
		);
		const named = providerMeta(provider).name.toLowerCase().includes(needle);
		return named || models.length > 0 ? [{ provider, models }] : [];
	});
}
