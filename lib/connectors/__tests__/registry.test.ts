import { describe, expect, it } from "vitest";
import type { ConnectorConfig, ConnectorPlugin } from "@/lib/connectors/types";
import { withRegistry, type ConnectorRegistry } from "../registry";

function makeConfig(overrides?: Partial<ConnectorConfig>): ConnectorConfig {
	return { ...overrides };
}

/** The plugins one provider of a type ended up with. */
const pluginsOf = (
	registry: ConnectorRegistry,
	type: "llm" | "image" | "tts",
	provider = "openslop",
) => (registry[type] as Record<string, ConnectorConfig>)[provider].plugins;

function makePlugin(name: string): ConnectorPlugin {
	return { name };
}

function makeFullRegistry(
	overrides?: Partial<Record<string, Record<string, ConnectorConfig>>>,
): ConnectorRegistry {
	const defaultProviders = { openslop: makeConfig() };
	return {
		llm: defaultProviders,
		music: defaultProviders,
		sfx: defaultProviders,
		image: defaultProviders,
		tts: defaultProviders,
		video: defaultProviders,
		...overrides,
	} as ConnectorRegistry;
}

describe("withRegistry", () => {
	it("returns the original registry when no operations are chained", () => {
		const registry = makeFullRegistry();
		const result = withRegistry(registry).build();
		expect(result).toEqual(registry);
	});

	it("appends a single plugin to a connector type", () => {
		const registry = makeFullRegistry();
		const plugin = makePlugin("test-plugin");

		const result = withRegistry(registry)
			.appendPlugins("image", plugin)
			.build();

		expect(pluginsOf(result, "image")).toEqual([plugin]);
	});

	it("appends multiple plugins in a single call", () => {
		const registry = makeFullRegistry();
		const p1 = makePlugin("p1");
		const p2 = makePlugin("p2");

		const result = withRegistry(registry)
			.appendPlugins("image", p1, p2)
			.build();

		expect(pluginsOf(result, "image")).toEqual([p1, p2]);
	});

	it("preserves existing plugins when appending", () => {
		const existing = makePlugin("existing");
		const registry = makeFullRegistry({
			image: {
				openslop: makeConfig({ plugins: [existing] }),
			},
		});
		const added = makePlugin("added");

		const result = withRegistry(registry).appendPlugins("image", added).build();

		expect(pluginsOf(result, "image")).toEqual([existing, added]);
	});

	it("chains operations across different connector types", () => {
		const registry = makeFullRegistry();
		const llmPlugin = makePlugin("llm-plugin");
		const imagePlugin = makePlugin("image-plugin");
		const ttsPlugin = makePlugin("tts-plugin");

		const result = withRegistry(registry)
			.appendPlugins("llm", llmPlugin)
			.appendPlugins("image", imagePlugin)
			.appendPlugins("tts", ttsPlugin)
			.build();

		expect(pluginsOf(result, "llm")).toEqual([llmPlugin]);
		expect(pluginsOf(result, "image")).toEqual([imagePlugin]);
		expect(pluginsOf(result, "tts")).toEqual([ttsPlugin]);
	});

	it("appends to the same connector type across multiple calls", () => {
		const registry = makeFullRegistry();
		const p1 = makePlugin("first");
		const p2 = makePlugin("second");

		const result = withRegistry(registry)
			.appendPlugins("image", p1)
			.appendPlugins("image", p2)
			.build();

		expect(pluginsOf(result, "image")).toEqual([p1, p2]);
	});

	it("does not mutate the original registry", () => {
		const registry = makeFullRegistry();
		const original = JSON.parse(JSON.stringify(registry));

		withRegistry(registry)
			.appendPlugins("llm", makePlugin("p1"))
			.appendPlugins("image", makePlugin("p2"))
			.build();

		expect(registry).toEqual(original);
	});

	it("does not affect unrelated connector types", () => {
		const registry = makeFullRegistry();

		const result = withRegistry(registry)
			.appendPlugins("image", makePlugin("img"))
			.build();

		expect(pluginsOf(result, "llm")).toBeUndefined();
		expect(pluginsOf(result, "tts")).toBeUndefined();
	});

	it("reaches every provider of the type", () => {
		const registry = makeFullRegistry({
			image: {
				providerA: makeConfig(),
				providerB: makeConfig(),
			},
		});
		const plugin = makePlugin("shared");

		const result = withRegistry(registry)
			.appendPlugins("image", plugin)
			.build();

		const image = result.image as Record<string, ConnectorConfig>;
		expect(image["providerA"].plugins).toEqual([plugin]);
		expect(image["providerB"].plugins).toEqual([plugin]);
	});
});
