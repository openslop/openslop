import type {
	CanvasContentElement,
	CanvasElementType,
} from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { ELEMENT_CONFIGS } from "./elementConfigs";
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
	const config = ELEMENT_CONFIGS[type];
	const { provider, config: connectorConfig } = getDefaultConnector(
		connectors,
		config.connector,
	);
	const schema = resolveAttributeSchema(
		config.connector,
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
			{ id: makeNodeId(), type, text: (opts.text ?? "").trim() },
		],
	};
}
