import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type { ProviderKey } from "@/lib/connectors/types";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import type { GenerationJob } from "@/lib/generation/queue";
import { getProjectStore } from "@/lib/project/store";
import type { CanvasContentElement } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { getGenerationInputs } from "./getGenerationInputs";

export function buildGenerationJob(
	element: CanvasContentElement,
	connectorConfig: ConnectorRegistry,
	projectId: string,
	overrides: Partial<GenerationJob> = {},
): GenerationJob | null {
	const { metadata } = getProjectStore(projectId).getState();
	const inputs = getGenerationInputs(element, metadata);
	if (!inputs.prompt) return null;

	const elementConfig = ELEMENT_CONFIGS[element.type];
	const connectorType = elementConfig.connector;
	const { attributes } = inputs;
	const provider = (attributes.provider as ProviderKey) ?? "openslop";
	const { config: baseConfig } = getDefaultConnector(
		connectorConfig,
		connectorType,
	);
	const config = {
		...baseConfig,
		...(attributes.model && { defaultModel: attributes.model }),
	};

	return {
		elementId: element.id,
		connectorType,
		provider,
		config,
		prompt: inputs.prompt,
		extraParams: { ...attributes, projectId },
		inputs,
		...overrides,
	};
}
