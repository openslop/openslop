import { MODELS, modalitiesFor } from "./models";
import uniq from "lodash/uniq";
import { PROVIDER_CATALOG } from "./providerCatalog";
import { PROVIDERS, type ConnectorType, type Provider } from "./types";

export type ProviderMatch = { provider: Provider; models: string[] };

/**
 * Providers matching a query, which may name either the provider or one of
 * its models: someone who knows the model they want should not have to know
 * who serves it. The matched models come back so a row can say why it is here.
 * An absent capabilities filter matches everything; an active one only lets a
 * model in the browsed capabilities match, so the reason never names a model
 * from another tab.
 */
export function searchProviders(
	query: string,
	capabilities: ConnectorType[] | null,
): ProviderMatch[] {
	const needle = query.trim().toLowerCase();
	return PROVIDERS.flatMap((provider) => {
		const types = modalitiesFor(provider).filter(
			(type) => !capabilities || capabilities.includes(type),
		);
		if (types.length === 0) return [];
		if (!needle) return [{ provider, models: [] }];

		const models = uniq(
			types.flatMap((type) => Object.keys(MODELS[type][provider] ?? {})),
		).filter((name) => name.toLowerCase().includes(needle));
		const named = PROVIDER_CATALOG[provider].name
			.toLowerCase()
			.includes(needle);
		return named || models.length > 0 ? [{ provider, models }] : [];
	});
}
