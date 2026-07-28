import { resolveElementConnector } from "@/lib/canvas/elementConnector";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { GenerationJob } from "./queue";

export function buildGenerationJob(
	element: CanvasContentElement,
	connectorConfig: ConnectorRegistry,
	projectId: string,
): GenerationJob {
	const { type, provider, config } = resolveElementConnector(
		element,
		connectorConfig,
	);

	return {
		elementId: element.id,
		connectorType: type,
		provider,
		config,
		projectId,
		element,
	};
}
