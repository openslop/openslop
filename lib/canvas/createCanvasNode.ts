import {
	assetId,
	connectorOf,
	type CanvasNode,
	type ElementType,
} from "@/lib/canvas/types";
import { resolveModel, type ConnectorModels } from "@/lib/connectors/models";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import { ZERO_WIDTH_SPACE } from "./constants";
import { isAssetType } from "./guards";
import { attributeSchemaFor } from "./elementConnector";
import { makeNodeId } from "./nodeUtils";

export type CreateNodeOptions = {
	id?: string;
	attrs?: Record<string, string>;
	text?: string;
	/** The models a new element takes its own from, already resolved by scope. */
	defaultModels?: ConnectorModels;
};

export function createCanvasNode<T extends ElementType>(
	type: T,
	opts: CreateNodeOptions = {},
): CanvasNode<T> {
	const connector = connectorOf(type);
	const defaults = opts.defaultModels ?? {};
	const attrs = {
		...opts.attrs,
		...(connector && resolveModel(connector, opts.attrs, defaults[connector])),
	};
	const attributes = attributeSchemaFor(type, attrs).resolve(attrs, defaults);
	return {
		id: isAssetType(type)
			? assetId(type, opts.attrs?.name)
			: (opts.id ?? makeNodeId()),
		type,
		...splitAttributes(attributes),
		children: [
			{ id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
			{ id: makeNodeId(), type, text: (opts.text ?? "").trim() },
		],
	};
}
