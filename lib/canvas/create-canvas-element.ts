import { connectorOf, type ElementOf, type ElementType } from "./types";
import { resolveModel, type ConnectorModels } from "@/lib/connectors/models";
import { splitAttributes } from "./element-attributes";
import { ZERO_WIDTH_SPACE } from "./constants";
import { attributeSchemaFor } from "./element-connector";
import { makeNodeId } from "./node-utils";

export type CreateElementOptions = {
	id?: string;
	attrs?: Record<string, string>;
	text?: string;
	/** The models a new element takes its own from, already resolved by scope. */
	defaultModels?: ConnectorModels;
};

export function createCanvasElement<T extends ElementType>(
	type: T,
	options: CreateElementOptions = {},
): ElementOf<T> {
	const connector = connectorOf(type);
	const { id = makeNodeId(), attrs, text = "", defaultModels = {} } = options;
	const given = {
		...attrs,
		...(connector && resolveModel(connector, attrs, defaultModels[connector])),
	};
	const attributes = attributeSchemaFor(type, given).resolve(given);
	return {
		id,
		type,
		...splitAttributes(attributes),
		children: [
			{ id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
			{ id: makeNodeId(), type, text },
		],
	};
}
