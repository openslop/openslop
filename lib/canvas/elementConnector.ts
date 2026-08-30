import type { AttributeSchema } from "@/lib/connectors/attributes/schema";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type {
	AssetConnectorType,
	ConnectorConfig,
	ProviderKey,
} from "@/lib/connectors/types";
import { flatAttributes } from "@/lib/video/elementAttributes";
import {
	ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "./types";

export type ElementConnector = {
	type: AssetConnectorType;
	provider: ProviderKey;
	model: string | undefined;
	config: ConnectorConfig;
};

/**
 * Which connector, provider and model an element generates with. The provider is
 * derived from the model rather than stored: it is the connector that serves the
 * model, and the seam a generation is routed through.
 */
export function resolveElementConnector(
	element: CanvasContentElement,
	registry: ConnectorRegistry,
): ElementConnector {
	const type = ELEMENT_TYPES[element.type].connector;
	const catalog = MODEL_CATALOGS[type];
	const { model } = element.generationAttributes ?? {};
	const provider = catalog.providerFor(model);
	const config = registry[type][provider];
	if (!config)
		throw new Error(`No "${provider}" connector configured for "${type}"`);
	return { type, provider, model: model ?? catalog.defaultModel, config };
}

/**
 * The attribute schema an element generates with, resolved from the element's
 * own attributes: picking a model picks the provider, and so what the element
 * can be configured with.
 */
export function attributeSchemaFor(
	type: CanvasElementType,
	attributes: Record<string, string>,
): AttributeSchema {
	const connector = ELEMENT_TYPES[type].connector;
	const { model } = attributes;
	return resolveAttributeSchema(
		connector,
		MODEL_CATALOGS[connector].providerFor(model),
		model,
	);
}

export const elementSchema = (element: CanvasContentElement): AttributeSchema =>
	attributeSchemaFor(element.type, flatAttributes(element));
