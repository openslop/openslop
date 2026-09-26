import { createConnector } from "@/lib/connectors/factory";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationInputs } from "./inputs";
import type { BuildContext, GenerationJob } from "./graph";

export async function generateForElement(
	job: GenerationJob,
	inputs: GenerationInputs,
	dependencies: Record<string, AssetResult>,
	{ state, registry }: BuildContext,
	signal?: AbortSignal,
): Promise<AssetResult> {
	const connector = createConnector(job.connectorType, job.model, job.config);
	return connector.generate(
		{ prompt: inputs.prompt, ...inputs.attributes },
		{
			dependencies,
			state,
			signal,
			speech: (model) => createConnector("tts", model, registry.tts),
		},
	);
}
