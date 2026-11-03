import { nameDef, OWN_MODEL_DEFS } from "@/lib/connectors/attributes/common";
import { AttributeSchema } from "@/lib/connectors/attributes/schema";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { resolveModel } from "@/lib/connectors/models";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { VOICE_ATTRIBUTES } from "@/lib/connectors/voice/attributes";
import type {
	AssetConnectorType,
	ConnectorConfig,
	ModelRef,
} from "@/lib/connectors/types";
import { REFERENCE_URLS_ATTR } from "./assets";
import { flatAttributes } from "./element-attributes";
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

/** The connector, model and plugins an element generates with. */
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

/** An asset's attributes are its own; content takes its connector's. */
const ASSET_ATTRIBUTES: Record<AssetType, AttributeSchema> = {
	asset_avatar: AttributeSchema.from([nameDef, ...OWN_MODEL_DEFS]),
	asset_voice: VOICE_ATTRIBUTES,
	asset_style: AttributeSchema.from([]),
	asset_references: AttributeSchema.from([
		{ key: REFERENCE_URLS_ATTR, label: "References" },
	]),
};

export function attributeSchemaFor(
	type: ElementType,
	attributes: Record<string, string> = {},
): AttributeSchema {
	if (isAssetType(type)) return ASSET_ATTRIBUTES[type];
	const { connector } = CONTENT_TYPES[type];
	return resolveAttributeSchema(connector, resolveModel(connector, attributes));
}

export const elementSchema = (element: CanvasElement): AttributeSchema =>
	attributeSchemaFor(element.type, flatAttributes(element));
