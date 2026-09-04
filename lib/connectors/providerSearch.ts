import { MODELS, modalitiesFor } from "./models";
import uniq from "lodash/uniq";
import { PROVIDER_CATALOG } from "./providerCatalog";
import { PROVIDERS, type ConnectorType, type Provider } from "./types";

export type ProviderMatch = { provider: Provider; models: string[] };

const modelNamesFor = (provider: Provider): string[] =>
	uniq(
		modalitiesFor(provider).flatMap((type) =>
			Object.keys(MODELS[type][provider] ?? {}),
		),
	);

/**
 * Providers matching a query, which may name either the provider or one of
 * its models: someone who knows the model they want should not have to know
 * who serves it. The matched models come back so a row can say why it is here.
 * An absent capability filter matches everything.
 */
export function searchProviders(
	query: string,
	capability: ConnectorType[] | null,
): ProviderMatch[] {
	const needle = query.trim().toLowerCase();
	return PROVIDERS.flatMap((provider) => {
		const modalities = modalitiesFor(provider);
		if (capability && !capability.some((type) => modalities.includes(type)))
			return [];
		if (!needle) return [{ provider, models: [] }];

		const models = modelNamesFor(provider).filter((name) =>
			name.toLowerCase().includes(needle),
		);
		const named = PROVIDER_CATALOG[provider].name
			.toLowerCase()
			.includes(needle);
		return named || models.length > 0 ? [{ provider, models }] : [];
	});
}
