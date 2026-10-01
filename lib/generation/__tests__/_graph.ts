import { DEFAULT_MODELS } from "@/lib/connectors/models";
import type { Dependency, GenerationNode, JobNode } from "../graph";

/** Dependencies keyed by node id. A bare node is named by its id. */
export const byId = (dependencies: (GenerationNode | Dependency)[]) =>
	Object.fromEntries(
		dependencies.map((dependency) =>
			"node" in dependency
				? [dependency.node.id, dependency]
				: [dependency.id, { node: dependency, label: dependency.id }],
		),
	);

/** An image job whose prompt is its id. */
export const jobNode = (
	id: string,
	dependsOn: GenerationNode[] = [],
): JobNode => ({
	id,
	inputs: { prompt: id, attributes: {} },
	dependsOn: byId(dependsOn),
	job: {
		elementId: id,
		elementType: "image",
		connectorType: "image",
		model: DEFAULT_MODELS.image,
		config: {},
	},
});
