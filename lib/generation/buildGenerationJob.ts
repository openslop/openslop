import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type { ProviderKey } from "@/lib/connectors/types";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ELEMENT_CONFIGS } from "@/lib/canvas/elementConfigs";
import type { GenerationJob } from "./queue";

export function buildGenerationJob(
	element: CanvasContentElement,
	connectorConfig: ConnectorRegistry,
	projectId: string,
): GenerationJob {
	const customAttributes = element.customAttributes ?? {};
	const connectorType = ELEMENT_CONFIGS[element.type].connector;
	const provider = (customAttributes.provider as ProviderKey) ?? "openslop";
	const { config } = getDefaultConnector(connectorConfig, connectorType);

	return {
		elementId: element.id,
		connectorType,
		provider,
		config,
		projectId,
		element,
	};
}
