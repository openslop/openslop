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
	ELEMENT_TYPES,
	type AssetType,
	type ElementType,
	type GeneratedType,
	type ScriptElement,
} from "./types";

type ElementConnector = {
	type: AssetConnectorType;
	model: ModelRef;
	config: ConnectorConfig;
};

/** The connector, model and plugins an element generates with: its type's, whatever the type. */
export function resolveElementConnector(
	element: ScriptElement,
	registry: ConnectorRegistry,
	canvas: ScriptElement[],
): ElementConnector {
	const type = connectorOf(element.type);
	if (!type) throw new Error(`A ${element.type} element generates nothing`);
	const config = registry[element.type as GeneratedType];
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

/** An asset's attributes are its own, never its connector's. */
const ASSET_ATTRIBUTES: Partial<Record<AssetType, AttributeSchema>> = {
	asset_voice: VOICE_ATTRIBUTES,
};

export function attributeSchemaFor(
	type: ElementType,
	attributes: Record<string, string>,
): AttributeSchema {
	if (isAssetType(type)) return ASSET_ATTRIBUTES[type] ?? NO_ATTRIBUTES;
	const { connector } = ELEMENT_TYPES[type];
	return resolveAttributeSchema(connector, resolveModel(connector, attributes));
}

export const elementSchema = (element: ScriptElement): AttributeSchema =>
	attributeSchemaFor(element.type, flatAttributes(element));

/** The element's own model, picked from its connector type's. Only asked of a type with models. */
export function elementModelPick(element: ScriptElement): ModelPick {
	const type = connectorOf(element.type);
	if (!type) throw new Error(`A ${element.type} element has no model`);
	return { kind: "model", type, ...ELEMENT_MODEL };
}
