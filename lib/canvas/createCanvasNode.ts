import {
	ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "@/lib/canvas/types";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { MODEL_CATALOGS, type ConnectorModels } from "@/lib/connectors/models";
import { splitAttributes } from "@/lib/video/elementAttributes";
import { ZERO_WIDTH_SPACE } from "./constants";
import { makeNodeId } from "./nodeUtils";

type Opts = {
	id?: string;
	attrs?: Record<string, string>;
	text?: string;
	/** The project's configured models, which a new element takes its own from. */
	projectModels?: ConnectorModels;
};

export function createCanvasNode(
	type: CanvasElementType,
	opts: Opts = {},
): CanvasContentElement {
	const { connector } = ELEMENT_TYPES[type];
	const catalog = MODEL_CATALOGS[connector];
	const model = catalog.resolve(
		opts.attrs?.model,
		opts.projectModels?.[connector],
	);
	const provider = catalog.providerFor(model);
	const schema = resolveAttributeSchema(connector, provider, model);
	const attributes: Record<string, string> = {
		...schema.defaultAttributes,
		...opts.attrs,
		model,
	};
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
