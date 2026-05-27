import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type { ProviderKey } from "@/lib/connectors/types";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import type { GenerationJob } from "@/lib/generation/queue";
import { getProjectStore } from "@/lib/project/store";
import type { CanvasContentElement } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { getGenerationInputs } from "./getGenerationInputs";
import { getPromptText } from "./getPromptText";

export function buildGenerationJob(
	element: CanvasContentElement,
	connectorConfig: ConnectorRegistry,
	projectId: string,
	overrides: Partial<GenerationJob> = {},
): GenerationJob | null {
	const prompt = getPromptText(element);
	if (!prompt) return null;

	const customAttributes = element.customAttributes ?? {};
	const connectorType = ELEMENT_CONFIGS[element.type].connector;
	const provider = (customAttributes.provider as ProviderKey) ?? "openslop";
	const { config: baseConfig } = getDefaultConnector(
		connectorConfig,
		connectorType,
	);
	const config = {
		...baseConfig,
		...(customAttributes.model && { defaultModel: customAttributes.model }),
	};

	return {
		elementId: element.id,
		connectorType,
		provider,
		config,
		prompt,
		resolve: () => {
			const { metadata } = getProjectStore(projectId).getState();
			const inputs = getGenerationInputs(element, metadata);
			return { inputs, extraParams: { ...inputs.attributes, projectId } };
		},
		...overrides,
	};
}
