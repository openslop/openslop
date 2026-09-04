import { createConnector } from "@/lib/connectors/factory";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationInputs } from "./inputs";
import type { NodeId } from "./graph";
import type { GenerationJob } from "./graph";

export async function generateForElement(
	job: GenerationJob,
	inputs: GenerationInputs,
	dependencies: Record<NodeId, AssetResult>,
): Promise<AssetResult> {
	const connector = createConnector(job.connectorType, job.model, job.config);
	return connector.generate(
		{ prompt: inputs.prompt, ...inputs.attributes },
		{ elementId: job.elementId, dependencies, state: job.state },
	);
}
