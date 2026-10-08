import { ELEMENT_MODEL } from "@/lib/connectors/attributes/model";
import {
	AttributeSchema,
	type ModelPick,
} from "@/lib/connectors/attributes/schema";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { resolveModel } from "@/lib/connectors/models";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { VOICE_ATTRIBUTES } from "@/lib/connectors/tts/attributes";
import type {
	AssetConnectorType,
	ConnectorConfig,
	ModelRef,
} from "@/lib/connectors/types";
import { flatAttributes } from "./elementAttributes";
import { isAssetType } from "./guards";
import {
	connectorOf,
	CONTENT_TYPES,
	type AssetType,
	type ElementType,
	type GeneratedElement,
	type CanvasElement,
} from "./types";

type ElementConnector = {
	type: AssetConnectorType;
	model: ModelRef;
	config: ConnectorConfig;
};

/** The connector, model and plugins an element generates with: its type's, whatever the type. */
export function resolveElementConnector(
	element: GeneratedElement,
	registry: ConnectorRegistry,
	canvas: CanvasElement[],
): ElementConnector {
	const type = connectorOf(element.type);
	const config = registry[element.type];
	const supplier = config.plugins?.find((plugin) => plugin.model);
	return {
		type,
		model: resolveModel(
			type,
			supplier?.model?.(element, canvas),
			element.generationAttributes,
		),
		config,
	};
}

const NO_ATTRIBUTES = AttributeSchema.from([]);

/** An asset's attributes are its own; content takes its connector's. */
const ASSET_ATTRIBUTES: Record<AssetType, AttributeSchema> = {
	asset_avatar: NO_ATTRIBUTES,
	asset_voice: VOICE_ATTRIBUTES,
	asset_style: NO_ATTRIBUTES,
	asset_references: NO_ATTRIBUTES,
};

export function attributeSchemaFor(
	type: ElementType,
	attributes: Record<string, string>,
): AttributeSchema {
	if (isAssetType(type)) return ASSET_ATTRIBUTES[type];
	const { connector } = CONTENT_TYPES[type];
	return resolveAttributeSchema(connector, resolveModel(connector, attributes));
}

export const elementSchema = (element: CanvasElement): AttributeSchema =>
	attributeSchemaFor(element.type, flatAttributes(element));

/** The element's own model, picked from its connector type's. */
export const elementModelPick = (element: GeneratedElement): ModelPick => ({
	kind: "model",
	type: connectorOf(element.type),
	...ELEMENT_MODEL,
});
