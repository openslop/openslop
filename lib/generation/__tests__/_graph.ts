import { DEFAULT_MODELS } from "@/lib/connectors/models";
import keyBy from "lodash/keyBy";
import type { GenerationNode } from "../graph";

/** Dependencies labelled by their node ids. */
export const byId = (dependencies: GenerationNode[]) =>
	keyBy(dependencies, "id");

/** An image job whose prompt is its id. */
export const jobNode = (
	id: string,
	dependsOn: GenerationNode[] = [],
	reads: Record<string, string> = {},
): GenerationNode => ({
	id,
	inputs: { prompt: id, attributes: {}, reads },
	dependsOn: byId(dependsOn),
	job: {
		elementId: id,
		elementType: "image",
		connectorType: "image",
		model: DEFAULT_MODELS.image,
		config: {},
	},
});
