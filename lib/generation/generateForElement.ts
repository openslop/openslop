import { createConnector } from "@/lib/connectors/factory";
import type {
  AssetResult,
  ConnectorConfig,
  ConnectorType,
  GenerationResult,
  ProviderKey,
} from "@/lib/connectors/types";

export async function generateForElement(
  connectorType: ConnectorType,
  provider: ProviderKey,
  config: ConnectorConfig,
  prompt: string,
  extraParams: Record<string, unknown>,
): Promise<GenerationResult> {
  const connector = createConnector(connectorType, provider, config);
  const result = await connector.generate({
    prompt,
    model: config.defaultModel,
    ...extraParams,
  });
  return { kind: connector.resultKind!, src: (result as AssetResult).url };
}
