import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { ProviderKey } from "@/lib/connectors/types";
import { getDefaultConnector } from "@/lib/connectors/registry";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import type { GenerationJob } from "./queue";

export function buildGenerationJob(
	element: CanvasContentElement,
	connectorConfig: ConnectorRegistry,
	projectId: string,
): GenerationJob {
	const customAttributes = element.customAttributes ?? {};
	const connectorType = ELEMENT_TYPES[element.type].connector;
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
