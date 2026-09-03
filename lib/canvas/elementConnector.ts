import { ELEMENT_MODEL } from "@/lib/connectors/attributes/model";
import type {
	AttributeSchema,
	ModelPick,
} from "@/lib/connectors/attributes/schema";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { resolveModel } from "@/lib/connectors/models";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { ProjectData } from "@/lib/project/store";
import type {
	AssetConnectorType,
	ConnectorConfig,
	ModelRef,
} from "@/lib/connectors/types";
import { flatAttributes } from "@/lib/video/elementAttributes";
import {
	ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "./types";

export type ElementConnector = {
	type: AssetConnectorType;
	model: ModelRef;
	config: ConnectorConfig;
};

export function resolveElementConnector(
	element: CanvasContentElement,
	registry: ConnectorRegistry,
	state: ProjectData,
): ElementConnector {
	const type = ELEMENT_TYPES[element.type].connector;
	const config = registry[type];
	const supplier = config.plugins?.find((plugin) => plugin.model);
	return {
		type,
		model: resolveModel(
			type,
			supplier?.model?.(element, state),
			element.generationAttributes,
		),
		config,
	};
}

export function attributeSchemaFor(
	type: CanvasElementType,
	attributes: Record<string, string>,
): AttributeSchema {
	const connector = ELEMENT_TYPES[type].connector;
	return resolveAttributeSchema(connector, resolveModel(connector, attributes));
}

export const elementSchema = (element: CanvasContentElement): AttributeSchema =>
	attributeSchemaFor(element.type, flatAttributes(element));

/** The element's own model, picked from its connector type's. */
export const elementModelPick = (element: CanvasContentElement): ModelPick => ({
	kind: "model",
	type: ELEMENT_TYPES[element.type].connector,
	...ELEMENT_MODEL,
});
