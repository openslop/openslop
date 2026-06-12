import type {
	CanvasContentElement,
	CanvasElementType,
} from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { ELEMENT_CONFIGS } from "./elementConfigs";
import { ZERO_WIDTH_SPACE } from "./constants";
import { makeNodeId } from "./nodeUtils";
import { hydrateConnectorConfig } from "./hydrateConnectorConfig";

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
	const node: CanvasContentElement = {
		id: opts.id ?? makeNodeId(),
		type,
		customAttributes: { ...config?.defaultAttributes, ...opts.attrs },
		children: [
			{ id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
			{ id: makeNodeId(), type, text: (opts.text ?? "").trim() },
		],
	};
	return hydrateConnectorConfig(connectors)(node);
}
