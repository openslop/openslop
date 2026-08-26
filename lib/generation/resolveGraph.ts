import {
	resolveElementConnector,
	type ElementConnector,
} from "@/lib/canvas/elementConnector";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { getPromptText } from "./inputs";
import {
	isElementNode,
	type ElementNode,
	type GenerationNode,
	type JobNode,
	type NodeSpec,
} from "./graph";
import type { ProjectData } from "@/lib/project/store";

/** Builds the node a spec names, along with every node it depends on. */
export type NodeBuilder = (spec: NodeSpec) => GenerationNode;

/** The node an element becomes, and the job that generates it. */
const toNode = (
	element: CanvasContentElement,
	connector: ElementConnector,
	plugins: ConnectorPlugin[],
	state: ProjectData,
	dependsOn: GenerationNode[],
): JobNode => ({
	id: element.id,
	inputs: {
		prompt: getPromptText(element),
		attributes: element.generationAttributes ?? {},
	},
	dependsOn,
	job: {
		elementId: element.id,
		elementType: element.type,
		connectorType: connector.type,
		provider: connector.provider,
		config: { ...connector.config, plugins },
		state,
	},
});

/**
 * Edges come from the plugin chain each node runs, so one declaration drives
 * what a job reads, what it waits for, and what makes it stale.
 */
export function nodeBuilder(
	registry: ConnectorRegistry,
	state: ProjectData,
): NodeBuilder {
	return (spec) => {
		// Scoped to one call: it dedupes nodes shared within a single graph and
		// detects cycles. Held across calls it would serve a stale node back once
		// its element changed, since element content is not part of `state`.
		const resolved = new Map<string, JobNode>();
		const resolving = new Set<string>();

		const build = ({ element, plugins: override }: ElementNode) => {
			const { id } = element;
			const existing = resolved.get(id);
			if (existing) return existing;
			if (resolving.has(id))
				throw new Error(`Cyclic generation dependency at "${id}"`);
			resolving.add(id);

			const connector = resolveElementConnector(element, registry);
			const plugins = override ?? connector.config.plugins ?? [];
			const dependsOn = plugins.flatMap(
				(plugin) => plugin.dependencies?.(element).map(resolve) ?? [],
			);
			const node = toNode(element, connector, plugins, state, dependsOn);

			resolving.delete(id);
			resolved.set(id, node);
			return node;
		};

		const resolve = (dep: NodeSpec): GenerationNode => {
			const declared = dep(state);
			return isElementNode(declared) ? build(declared) : declared;
		};

		return resolve(spec);
	};
}
