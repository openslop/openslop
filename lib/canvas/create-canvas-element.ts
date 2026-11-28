import {
	connectorOf,
	ownsModel,
	type ElementOf,
	type ElementType,
} from "./types";
import { resolveModel, type ConnectorModels } from "@/lib/connectors/models";
import type { ModelRef } from "@/lib/connectors/types";
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

export function newElementModel(
	type: ElementType,
	attrs: Record<string, string> | undefined,
	defaultModels: ConnectorModels,
): ModelRef | undefined {
	const connector = connectorOf(type);
	return connector && ownsModel(type)
		? resolveModel(connector, attrs, defaultModels[connector])
		: undefined;
}

export function createCanvasElement<T extends ElementType>(
	type: T,
	options: CreateElementOptions = {},
): ElementOf<T> {
	const { id = makeNodeId(), attrs, text = "", defaultModels = {} } = options;
	const given = { ...attrs, ...newElementModel(type, attrs, defaultModels) };
	const attributes = attributeSchemaFor(type, given).resolve(given);
	return {
		id,
		type,
		...splitAttributes(attributes),
		children: [
			{ id: makeNodeId(), text: ZERO_WIDTH_SPACE },
			{ id: makeNodeId(), text },
		],
	};
}
