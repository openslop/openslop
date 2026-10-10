import { DEFAULT_MODELS } from "@/lib/connectors/models";
import type { AssetConnectorType } from "@/lib/connectors/types";
import keyBy from "lodash/keyBy";
import type { GenerationNode } from "../graph";
import type { GenerationInputs, NodeInputs } from "../inputs";

/** Dependencies labelled by their node ids. */
export const byId = (dependencies: GenerationNode[]) =>
	keyBy(dependencies, "id");

/** An image job whose prompt is its id unless given one. */
export const jobNode = (
	id: string,
	dependsOn: GenerationNode[] = [],
	{
		prompt = id,
		attributes = {},
		reads = {},
		connectorType = "image",
	}: Partial<NodeInputs> & { connectorType?: AssetConnectorType } = {},
): GenerationNode => ({
	id,
	inputs: { prompt, attributes, reads },
	dependsOn: byId(dependsOn),
	job: {
		elementType: "image",
		connectorType,
		model: DEFAULT_MODELS.image,
		config: {},
	},
});

export const inputsFor = (
	prompt = "p",
	attributes: Record<string, string> = {},
	dependencies: Record<string, string> = {},
): GenerationInputs => ({ prompt, attributes, reads: {}, dependencies });
