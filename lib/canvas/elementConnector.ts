import mapValues from "lodash/mapValues";
import { ELEMENT_MODEL } from "@/lib/connectors/attributes/model";
import {
	AttributeSchema,
	type ModelPick,
} from "@/lib/connectors/attributes/schema";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { resolveModel, type ConnectorModels } from "@/lib/connectors/models";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { VOICE_ATTRIBUTES } from "@/lib/connectors/tts/attributes";
import type {
	AssetConnectorType,
	ConnectorConfig,
	ModelRef,
} from "@/lib/connectors/types";
import { flatAttributes } from "./elementAttributes";
import {
	assetId,
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

type Attrs = Record<string, string>;

/** How an element type takes its model, its attributes and its id. */
type ElementRules = {
	model(attrs: Attrs, defaults: ConnectorModels): Partial<ModelRef>;
	attributes(attrs: Attrs): AttributeSchema;
	id(name?: string): string | undefined;
};

const NO_ATTRIBUTES = AttributeSchema.from([]);

const generatesOn = (
	connector: AssetConnectorType,
): Omit<ElementRules, "id"> => ({
	model: (attrs, defaults) =>
		resolveModel(connector, attrs, defaults[connector]),
	attributes: (attrs) =>
		resolveAttributeSchema(connector, resolveModel(connector, attrs)),
});

const holds = (schema = NO_ATTRIBUTES): Omit<ElementRules, "id"> => ({
	model: () => ({}),
	attributes: () => schema,
});

const content = (connector: AssetConnectorType): ElementRules => ({
	...generatesOn(connector),
	id: () => undefined,
});

const asset = (
	type: AssetType,
	rules: Omit<ElementRules, "id">,
): ElementRules => ({ ...rules, id: (name) => assetId(type, name) });

const RULES: Record<ElementType, ElementRules> = {
	...mapValues(CONTENT_TYPES, ({ connector }) => content(connector)),
	asset_avatar: asset("asset_avatar", {
		...generatesOn(connectorOf("asset_avatar")),
		attributes: () => NO_ATTRIBUTES,
	}),
	asset_voice: asset("asset_voice", holds(VOICE_ATTRIBUTES)),
	asset_style: asset("asset_style", holds()),
	asset_references: asset("asset_references", holds()),
};

export const attributeSchemaFor = (
	type: ElementType,
	attributes: Attrs,
): AttributeSchema => RULES[type].attributes(attributes);

/** The model a new element of `type` takes: its own, else the scoped default. Metadata takes none. */
export const modelFor = (
	type: ElementType,
	attributes: Attrs,
	defaults: ConnectorModels,
): Partial<ModelRef> => RULES[type].model(attributes, defaults);

/** The id an element's type fixes for it, as an asset's name does; content takes any. */
export const fixedIdOf = (type: ElementType, name?: string) =>
	RULES[type].id(name);

export const elementSchema = (element: CanvasElement): AttributeSchema =>
	attributeSchemaFor(element.type, flatAttributes(element));

/** The element's own model, picked from its connector type's. */
export const elementModelPick = (element: GeneratedElement): ModelPick => ({
	kind: "model",
	type: connectorOf(element.type),
	...ELEMENT_MODEL,
});
