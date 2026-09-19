import { createConnector } from "@/lib/connectors/factory";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationInputs } from "./inputs";
import type { BuildContext, GenerationJob, NodeId } from "./graph";

export async function generateForElement(
	job: GenerationJob,
	inputs: GenerationInputs,
	dependencies: Record<NodeId, AssetResult>,
	{ state, canvas }: BuildContext,
	signal?: AbortSignal,
): Promise<AssetResult> {
	const connector = createConnector(job.connectorType, job.model, job.config);
	return connector.generate(
		{ prompt: inputs.prompt, ...inputs.attributes },
		{ elementId: job.elementId, dependencies, state, canvas, signal },
	);
}
