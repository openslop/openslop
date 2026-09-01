import { matchesCapability, type Capability } from "./capabilities";
import { modelNamesForProvider } from "./models";
import { ALL_PROVIDERS, providerMeta } from "./providerCatalog";
import type { ProviderKey } from "./types";

/** A connector the browser is offering, with whichever models matched. */
export type ConnectorMatch = { provider: ProviderKey; models: string[] };

/**
 * Connectors matching a query, which may name either the provider or one of
 * its models: someone who knows the model they want should not have to know
 * who serves it. The matched models come back so a row can say why it is here.
 */
export function searchConnectors(
	query: string,
	capability: Capability,
): ConnectorMatch[] {
	const needle = query.trim().toLowerCase();
	return ALL_PROVIDERS.flatMap((provider) => {
		const meta = providerMeta(provider);
		if (!matchesCapability(meta.modalities, capability)) return [];
		if (!needle) return [{ provider, models: [] }];

		const models = modelNamesForProvider(provider).filter((name) =>
			name.toLowerCase().includes(needle),
		);
		const named = meta.name.toLowerCase().includes(needle);
		return named || models.length > 0 ? [{ provider, models }] : [];
	});
}
