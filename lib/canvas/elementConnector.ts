import type { AttributeSchema } from "@/lib/connectors/attributes/schema";
import {
	isKnownProvider,
	resolveAttributeSchema,
} from "@/lib/connectors/factory";
import {
	getDefaultConnector,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
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
 * Which connector, provider and model an element generates with.
 *
 * An element pins its provider in `customAttributes` when it is created, so a
 * provider that has since been renamed, unregistered, or dropped from the
 * registry falls back to the registry default instead of reaching
 * `createConnector`/`resolveAttributeSchema`, which throw on unknown providers.
 */
export function resolveElementConnector(
	element: CanvasContentElement,
	registry: ConnectorRegistry,
): ElementConnector {
	const type = ELEMENT_TYPES[element.type].connector;
	const { provider: pinned, model } = element.customAttributes ?? {};

	if (pinned && isKnownProvider(type, pinned)) {
		const config = registry[type][pinned];
		if (config) {
			return {
				type,
				provider: pinned,
				model: model ?? config.defaultModel,
				config,
			};
		}
	}

	const { provider, config } = getDefaultConnector(registry, type);
	return { type, provider, model: model ?? config.defaultModel, config };
}

export function resolveElementSchema(
	element: CanvasContentElement,
	registry: ConnectorRegistry,
): AttributeSchema {
	const { type, provider, model } = resolveElementConnector(element, registry);
	return resolveAttributeSchema(type, provider, model);
}
