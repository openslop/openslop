import {
	ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "@/lib/canvas/types";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { resolveModel, type ConnectorModels } from "@/lib/connectors/models";
import { splitAttributes } from "@/lib/video/elementAttributes";
import { ZERO_WIDTH_SPACE } from "./constants";
import { makeNodeId } from "./nodeUtils";

type Opts = {
	id?: string;
	attrs?: Record<string, string>;
	text?: string;
	/** The models a new element takes its own from, already resolved by scope. */
	defaultModels?: ConnectorModels;
};

export function createCanvasNode(
	type: CanvasElementType,
	opts: Opts = {},
): CanvasContentElement {
	const { connector } = ELEMENT_TYPES[type];
	const attrs = opts.attrs ?? {};
	const defaults = opts.defaultModels ?? {};
	const schema = resolveAttributeSchema(
		connector,
		resolveModel(connector, attrs, defaults[connector]),
	);
	const models = Object.fromEntries(
		schema.modelPicks.flatMap(({ key, providerAttr, type: picks }) => {
			const { provider, model } = resolveModel(
				picks,
				{ provider: attrs[providerAttr], model: attrs[key] },
				defaults[picks],
			);
			return [
				[providerAttr, provider],
				[key, model],
			];
		}),
	);
	const attributes = schema.resolve({ ...attrs, ...models });
	return {
		id: opts.id ?? makeNodeId(),
		type,
		...splitAttributes(attributes),
		children: [
			{ id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
			{ id: makeNodeId(), type, text: (opts.text ?? "").trim() },
		],
	};
}
