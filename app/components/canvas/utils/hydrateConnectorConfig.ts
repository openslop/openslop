import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { ELEMENT_METADATA } from "@/lib/canvas/elementMetadata";

export function hydrateConnectorConfig(registry: ConnectorRegistry) {
	return (node: CanvasContentElement): CanvasContentElement => {
		const connectorType = ELEMENT_METADATA[node.type]?.connector;
		const { provider, config } = getDefaultConnector(registry, connectorType);
		if (!config?.defaultModel) return node;
		return {
			...node,
			customAttributes: {
				...node.customAttributes,
				model: config.defaultModel,
				provider,
			},
		};
	};
}
