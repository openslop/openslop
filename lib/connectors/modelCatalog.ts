import type { ProviderKey } from "./types";

/** How a model trades off against its siblings. Relative within a connector type, never absolute. */
export type Tier = "low" | "medium" | "high";

export type ModelMeta = {
	/** What a generation costs. Lower is cheaper. */
	cost: Tier;
	/** How quickly it returns. Higher is faster. */
	speed: Tier;
};

/** What one model is, wherever it is declared: the id its provider's API takes, and how it compares. */
export type ModelEntry = ModelMeta & { id: string };

type Entry = ModelEntry & { provider: ProviderKey };

/**
 * Every model a connector type offers, across the providers that serve it. A
 * model name is what an element stores and the badge shows, and it is what the
 * provider is resolved from; the id its provider's own API takes is carried
 * alongside, so the route that forwards a generation reads it from here.
 */
export class ModelCatalog {
	private constructor(
		private readonly entries: Record<string, Entry>,
		readonly defaultModel: string,
	) {}

	static from(
		byProvider: Partial<Record<ProviderKey, Record<string, ModelEntry>>>,
		defaultModel: string,
	): ModelCatalog {
		const entries = Object.fromEntries(
			Object.entries(byProvider).flatMap(([provider, models]) =>
				Object.entries(models).map(
					([name, entry]) =>
						[name, { ...entry, provider: provider as ProviderKey }] as const,
				),
			),
		);
		if (!entries[defaultModel])
			throw new Error(`Default model "${defaultModel}" is not in the catalog`);
		return new ModelCatalog(entries, defaultModel);
	}

	has(model: string): boolean {
		return model in this.entries;
	}

	/** The first candidate the catalog offers, falling back to its default. */
	resolve(...candidates: (string | undefined)[]): string {
		return (
			candidates.find((name) => name && this.has(name)) ?? this.defaultModel
		);
	}

	get names(): string[] {
		return Object.keys(this.entries);
	}

	private entry(model?: string): Entry {
		const entry = this.entries[this.resolve(model)];
		if (!entry) throw new Error(`Model "${model}" is not in the catalog`);
		return entry;
	}

	/** The connector serving a model. An unnamed or unknown model takes the default's. */
	providerFor(model?: string): ProviderKey {
		return this.entry(model).provider;
	}

	/** The id the serving provider's own API takes for a model. */
	idFor(model?: string): string {
		return this.entry(model).id;
	}

	/** How a model compares to the others of its type, for a picker that says why to choose one. */
	metaFor(model?: string): ModelMeta {
		const { cost, speed } = this.entry(model);
		return { cost, speed };
	}

	/** Every provider serving at least one model here, in catalog order. */
	get providers(): ProviderKey[] {
		return [...new Set(Object.values(this.entries).map((e) => e.provider))];
	}

	/** The names a provider serves, in catalog order. */
	namesFor(provider: ProviderKey): string[] {
		return this.names.filter(
			(name) => this.entries[name]?.provider === provider,
		);
	}
}
