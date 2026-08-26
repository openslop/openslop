import {
	ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { getDefaultConnector } from "@/lib/connectors/registry";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import type { ConnectorType, ProviderKey } from "@/lib/connectors/types";
import { splitAttributes } from "@/lib/video/elementAttributes";
import { ZERO_WIDTH_SPACE } from "./constants";
import { makeNodeId } from "./nodeUtils";

type Opts = {
	id?: string;
	attrs?: Record<string, string>;
	text?: string;
};

/**
 * Incoming attributes name the provider and model to generate with — a stored
 * element carries the pair it was authored with — but only the registry decides
 * what is generatable. A provider or model it does not know falls back to the
 * type's default, so a node can never point at a connector that is gone.
 */
function resolveConnector(
	connectors: ConnectorRegistry,
	connector: ConnectorType,
	attrs: Record<string, string>,
) {
	const requested = connectors[connector]?.[attrs.provider as ProviderKey];
	const { provider, config } = requested
		? { provider: attrs.provider as ProviderKey, config: requested }
		: getDefaultConnector(connectors, connector);
	return {
		provider,
		model: config?.models.includes(attrs.model)
			? attrs.model
			: config?.defaultModel,
	};
}

export function createCanvasNode(
	type: CanvasElementType,
	connectors: ConnectorRegistry,
	opts: Opts = {},
): CanvasContentElement {
	const { connector } = ELEMENT_TYPES[type];
	const attrs = opts.attrs ?? {};
	const { provider, model } = resolveConnector(connectors, connector, attrs);
	const schema = resolveAttributeSchema(connector, provider, model);
	const attributes: Record<string, string> = {
		...schema.defaultAttributes,
		...attrs,
		...(model ? { model, provider } : null),
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
