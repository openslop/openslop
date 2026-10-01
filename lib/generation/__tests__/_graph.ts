import type { Dependency, GenerationNode } from "../graph";

/** Dependencies keyed by node id. A bare node is named by its id. */
export const byId = (dependencies: (GenerationNode | Dependency)[]) =>
	Object.fromEntries(
		dependencies.map((dependency) =>
			"node" in dependency
				? [dependency.node.id, dependency]
				: [dependency.id, { node: dependency, label: dependency.id }],
		),
	);
