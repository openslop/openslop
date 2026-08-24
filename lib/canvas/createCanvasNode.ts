import {
	ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { getDefaultConnector } from "@/lib/connectors/registry";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { splitAttributes } from "@/lib/video/elementAttributes";
import { ZERO_WIDTH_SPACE } from "./constants";
import { makeNodeId } from "./nodeUtils";

type Opts = {
	id?: string;
	attrs?: Record<string, string>;
	text?: string;
};

export function createCanvasNode(
	type: CanvasElementType,
	connectors: ConnectorRegistry,
	opts: Opts = {},
): CanvasContentElement {
	const { connector } = ELEMENT_TYPES[type];
	const { provider, config: connectorConfig } = getDefaultConnector(
		connectors,
		connector,
	);
	const schema = resolveAttributeSchema(
		connector,
		provider,
		connectorConfig?.defaultModel,
	);
	const attributes: Record<string, string> = {
		...schema.defaultAttributes,
		...opts.attrs,
	};
	if (connectorConfig?.defaultModel) {
		attributes.model = connectorConfig.defaultModel;
		attributes.provider = provider;
	}
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
