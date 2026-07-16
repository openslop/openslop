import {
	ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
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
	const customAttributes: Record<string, string> = {
		...schema.defaultAttributes,
		...opts.attrs,
	};
	if (connectorConfig?.defaultModel) {
		customAttributes.model = connectorConfig.defaultModel;
		customAttributes.provider = provider;
	}
	return {
		id: opts.id ?? makeNodeId(),
		type,
		customAttributes,
		children: [
			{ id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
			{
				id: makeNodeId(),
				type,
				// Strip ZWSPs that older serializer versions leaked into saved text.
				text: (opts.text ?? "").replaceAll(ZERO_WIDTH_SPACE, "").trim(),
			},
		],
	};
}
