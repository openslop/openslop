import { createConnector } from "@/lib/connectors/factory";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationNode } from "./graph";

export function generateForElement(
	{ job, inputs }: GenerationNode,
	dependencies: Record<string, AssetResult>,
	signal?: AbortSignal,
): Promise<AssetResult> {
	return createConnector(job.connectorType, job.model, job.config).generate(
		{ prompt: inputs.prompt, ...inputs.attributes },
		{ dependencies, reads: inputs.reads, signal },
	);
}
