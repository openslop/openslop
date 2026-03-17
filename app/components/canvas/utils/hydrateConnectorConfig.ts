import type { CanvasElement } from "../types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";

export function hydrateConnectorConfig(connectors: ConnectorRegistry) {
  return (node: CanvasElement): CanvasElement => {
    const connectorType = ELEMENT_CONFIGS[node.type]?.connector;
    const config = connectors[connectorType];
    if (!config?.model) return node;
    return {
      ...node,
      customAttributes: {
        ...node.customAttributes,
        model: config.model,
        provider: config.provider,
      },
    };
  };
}
