import { createConnector } from "@/lib/connectors/factory";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationInputs } from "./generationInputs";
import type { ElementSnapshot, GenerationJob } from "./queue";

export async function generateForElement(
	job: GenerationJob,
	inputs: GenerationInputs,
	prior?: ElementSnapshot,
): Promise<AssetResult> {
	const connector = createConnector(
		job.connectorType,
		job.provider,
		job.config,
	);
	return connector.generate(
		{
			prompt: inputs.prompt,
			model: job.config.defaultModel,
			...inputs.attributes,
		},
		prior,
	);
}
