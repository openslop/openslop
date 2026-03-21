import type {
  ConnectorConfig,
  ConnectorType,
  ProviderKey,
} from "@/lib/connectors/types";
import type { ConnectorRegistry } from "./ConfigProvider";

export function getDefaultConnector(
  registry: ConnectorRegistry,
  type: ConnectorType,
): { provider: ProviderKey; config: ConnectorConfig } {
  const providers = registry[type];
  for (const [provider, config] of Object.entries(providers)) {
    if (config.isDefault) {
      return { provider: provider as ProviderKey, config };
    }
  }
  const [provider, config] = Object.entries(providers)[0];
  return { provider: provider as ProviderKey, config };
}
