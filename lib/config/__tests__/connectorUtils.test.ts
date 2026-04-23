import { describe, expect, it } from "vitest";
import type { ConnectorConfig } from "@/lib/connectors/types";
import type { ConnectorRegistry } from "../ConfigProvider";
import { getDefaultConnector } from "../connectorUtils";

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
