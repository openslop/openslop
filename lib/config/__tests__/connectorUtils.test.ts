import { describe, expect, it } from "vitest";
import type { ConnectorConfig, ConnectorPlugin } from "@/lib/connectors/types";
import type { ConnectorRegistry } from "../ConfigProvider";
import { getDefaultConnector, withRegistry } from "../connectorUtils";

function makeConfig(overrides?: Partial<ConnectorConfig>): ConnectorConfig {
	return {
		defaultModel: "m1",
		models: ["m1"],
		isDefault: false,
		...overrides,
	};
}

function makeRegistry(
	imageProviders: Record<string, ConnectorConfig>,
): ConnectorRegistry {
	const empty = {} as Record<string, ConnectorConfig>;
	return {
		llm: empty,
		music: empty,
		sfx: empty,
		image: imageProviders,
		tts: empty,
		video: empty,
	} as ConnectorRegistry;
}

describe("getDefaultConnector", () => {
	it("returns the provider marked as default", () => {
		const registry = makeRegistry({
			providerA: makeConfig({ isDefault: false }),
			providerB: makeConfig({ isDefault: true }),
		});

		const result = getDefaultConnector(registry, "image");
		expect(result.provider).toBe("providerB");
		expect(result.config.isDefault).toBe(true);
	});

	it("falls back to the first provider when none is marked default", () => {
		const registry = makeRegistry({
			providerA: makeConfig({ isDefault: false }),
			providerB: makeConfig({ isDefault: false }),
		});

		const result = getDefaultConnector(registry, "image");
		expect(result.provider).toBe("providerA");
	});

	it("returns the only provider when there is exactly one", () => {
		const registry = makeRegistry({
			solo: makeConfig({ isDefault: true }),
		});

		const result = getDefaultConnector(registry, "image");
		expect(result.provider).toBe("solo");
		expect(result.config.defaultModel).toBe("m1");
	});

	it("throws when no providers are configured for the type", () => {
		const registry = makeRegistry({});
		expect(() => getDefaultConnector(registry, "image")).toThrow(
			/No providers configured/,
		);
	});

	it("returns the first default when multiple are marked default", () => {
		const registry = makeRegistry({
			first: makeConfig({ isDefault: true, defaultModel: "x" }),
			second: makeConfig({ isDefault: true, defaultModel: "y" }),
		});

		const result = getDefaultConnector(registry, "image");
		expect(result.provider).toBe("first");
		expect(result.config.defaultModel).toBe("x");
	});
});

function makePlugin(name: string): ConnectorPlugin {
	return { name };
}

function makeFullRegistry(
	overrides?: Partial<Record<string, Record<string, ConnectorConfig>>>,
): ConnectorRegistry {
	const defaultProviders = {
		openslop: makeConfig({ isDefault: true }),
	};
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

		const { config } = getDefaultConnector(result, "image");
		expect(config.plugins).toEqual([plugin]);
	});

	it("appends multiple plugins in a single call", () => {
		const registry = makeFullRegistry();
		const p1 = makePlugin("p1");
		const p2 = makePlugin("p2");

		const result = withRegistry(registry)
			.appendPlugins("image", p1, p2)
			.build();

		const { config } = getDefaultConnector(result, "image");
		expect(config.plugins).toEqual([p1, p2]);
	});

	it("preserves existing plugins when appending", () => {
		const existing = makePlugin("existing");
		const registry = makeFullRegistry({
			image: {
				openslop: makeConfig({ isDefault: true, plugins: [existing] }),
			},
		});
		const added = makePlugin("added");

		const result = withRegistry(registry).appendPlugins("image", added).build();

		const { config } = getDefaultConnector(result, "image");
		expect(config.plugins).toEqual([existing, added]);
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

		expect(getDefaultConnector(result, "llm").config.plugins).toEqual([
			llmPlugin,
		]);
		expect(getDefaultConnector(result, "image").config.plugins).toEqual([
			imagePlugin,
		]);
		expect(getDefaultConnector(result, "tts").config.plugins).toEqual([
			ttsPlugin,
		]);
	});

	it("appends to the same connector type across multiple calls", () => {
		const registry = makeFullRegistry();
		const p1 = makePlugin("first");
		const p2 = makePlugin("second");

		const result = withRegistry(registry)
			.appendPlugins("image", p1)
			.appendPlugins("image", p2)
			.build();

		const { config } = getDefaultConnector(result, "image");
		expect(config.plugins).toEqual([p1, p2]);
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

		expect(getDefaultConnector(result, "llm").config.plugins).toBeUndefined();
		expect(getDefaultConnector(result, "tts").config.plugins).toBeUndefined();
	});

	it("targets the default provider when multiple providers exist", () => {
		const registry = makeFullRegistry({
			image: {
				providerA: makeConfig({ isDefault: false }),
				providerB: makeConfig({ isDefault: true }),
			},
		});
		const plugin = makePlugin("targeted");

		const result = withRegistry(registry)
			.appendPlugins("image", plugin)
			.build();

		expect(
			(result.image as Record<string, ConnectorConfig>)["providerB"].plugins,
		).toEqual([plugin]);
		expect(
			(result.image as Record<string, ConnectorConfig>)["providerA"].plugins,
		).toBeUndefined();
	});
});
