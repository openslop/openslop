import { createConnector } from "@/lib/connectors/factory";
import type {
	AssetResult,
	ConnectorConfig,
	ConnectorType,
	ProviderKey,
} from "@/lib/connectors/types";

export async function generateForElement(
	connectorType: ConnectorType,
	provider: ProviderKey,
	config: ConnectorConfig,
	prompt: string,
	extraParams: Record<string, unknown>,
): Promise<AssetResult> {
	const connector = createConnector(connectorType, provider, config);
	return connector.generate({
		prompt,
		model: config.defaultModel,
		...extraParams,
	}) as Promise<AssetResult>;
}
