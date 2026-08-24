import type { AttributeSchema } from "@/lib/connectors/attributes/schema";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type {
	AssetConnectorType,
	ConnectorConfig,
	ProviderKey,
} from "@/lib/connectors/types";
import { ELEMENT_TYPES, type CanvasContentElement } from "./types";

export type ElementConnector = {
	type: AssetConnectorType;
	provider: ProviderKey;
	model: string | undefined;
	config: ConnectorConfig;
};

/**
 * Which connector, provider and model an element generates with. `createCanvasNode`
 * stamps the provider from the registry after any incoming attributes, so every
 * authored element carries one the registry knows.
 */
export function resolveElementConnector(
	element: CanvasContentElement,
	registry: ConnectorRegistry,
): ElementConnector {
	const type = ELEMENT_TYPES[element.type].connector;
	const { provider, model } = element.generationAttributes ?? {};
	if (!provider)
		throw new Error(`Element "${element.id}" was created without a provider`);
	const config = registry[type][provider as ProviderKey];
	return {
		type,
		provider: provider as ProviderKey,
		model: model ?? config.defaultModel,
		config,
	};
}

export function resolveElementSchema(
	element: CanvasContentElement,
	registry: ConnectorRegistry,
): AttributeSchema {
	const { type, provider, model } = resolveElementConnector(element, registry);
	return resolveAttributeSchema(type, provider, model);
}
