import type { ElementOf, ElementType } from "@/lib/canvas/types";
import type { ConnectorModels } from "@/lib/connectors/models";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import { ZERO_WIDTH_SPACE } from "./constants";
import { attributeSchemaFor, fixedIdOf, modelFor } from "./elementConnector";
import { makeNodeId } from "./nodeUtils";

export type CreateElementOptions = {
	id?: string;
	attrs?: Record<string, string>;
	text?: string;
	/** The models a new element takes its own from, already resolved by scope. */
	defaultModels?: ConnectorModels;
};

export function createCanvasElement<T extends ElementType>(
	type: T,
	opts: CreateElementOptions = {},
): ElementOf<T> {
	const defaults = opts.defaultModels ?? {};
	const given = opts.attrs ?? {};
	const attrs = { ...given, ...modelFor(type, given, defaults) };
	const attributes = attributeSchemaFor(type, attrs).resolve(attrs, defaults);
	return {
		id: fixedIdOf(type, given.name) ?? opts.id ?? makeNodeId(),
		type,
		...splitAttributes(attributes),
		children: [
			{ id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
			{ id: makeNodeId(), type, text: (opts.text ?? "").trim() },
		],
	};
}
