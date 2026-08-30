import type { ProviderKey } from "./types";

/**
 * Every model a connector type offers, across the providers that serve it. A
 * model name is what an element stores and the badge shows, and it is what the
 * provider is resolved from; the id a provider's own API takes stays in that
 * provider's module, so only the names are read here.
 */
export class ModelCatalog {
	private constructor(
		private readonly providers: Record<string, ProviderKey>,
		readonly defaultModel: string,
	) {}

	static from(
		byProvider: Partial<Record<ProviderKey, Record<string, unknown>>>,
		defaultModel: string,
	): ModelCatalog {
		const providers = Object.fromEntries(
			Object.entries(byProvider).flatMap(([provider, models]) =>
				Object.keys(models).map(
					(name) => [name, provider as ProviderKey] as const,
				),
			),
		);
		if (!providers[defaultModel])
			throw new Error(`Default model "${defaultModel}" is not in the catalog`);
		return new ModelCatalog(providers, defaultModel);
	}

	has(model: string): boolean {
		return model in this.providers;
	}

	/** The first candidate the catalog offers, falling back to its default. */
	resolve(...candidates: (string | undefined)[]): string {
		return (
			candidates.find((name) => name && this.has(name)) ?? this.defaultModel
		);
	}

	get names(): string[] {
		return Object.keys(this.providers);
	}

	/** The connector serving a model. An unnamed or unknown model takes the default's. */
	providerFor(model?: string): ProviderKey {
		return this.providers[this.resolve(model)];
	}
}
