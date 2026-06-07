import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type { ProviderKey } from "@/lib/connectors/types";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import type { GenerationJob } from "@/lib/generation/queue";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ELEMENT_METADATA } from "@/lib/canvas/elementMetadata";

export function buildGenerationJob(
	element: CanvasContentElement,
	connectorConfig: ConnectorRegistry,
	projectId: string,
): GenerationJob {
	const customAttributes = element.customAttributes ?? {};
	const connectorType = ELEMENT_METADATA[element.type].connector;
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
