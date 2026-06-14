import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { ELEMENT_CONFIGS } from "./elementConfigs";

export function hydrateConnectorConfig(registry: ConnectorRegistry) {
	return (node: CanvasContentElement): CanvasContentElement => {
		const connectorType = ELEMENT_CONFIGS[node.type]?.connector;
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
