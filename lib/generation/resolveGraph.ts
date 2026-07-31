import omit from "lodash/omit";
import { resolveElementConnector } from "@/lib/canvas/elementConnector";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import { getPromptText } from "./inputs";
import {
	isElementNode,
	type ElementNode,
	type GenerationNode,
	type NodeSpec,
} from "./graph";
import type { GenerationJob } from "./queue";
import type { ProjectState } from "./sourceNodes";

/** Builds the node a spec names, along with every node it depends on. */
export type NodeBuilder = (spec: NodeSpec) => GenerationNode;

/** What the element itself contributes, once its dependencies are resolved. */
const toNode = (
	element: CanvasContentElement,
	job: GenerationJob,
	dependsOn: GenerationNode[],
): GenerationNode => ({
	id: element.id,
	inputs: {
		prompt: getPromptText(element),
		attributes: omit(element.customAttributes ?? {}, LAYOUT_ATTRIBUTE_KEYS),
	},
	dependsOn,
	buildJob: () => job,
});

/**
 * Bind a builder to the registry and project state its nodes resolve against.
 * Edges come from the plugin chain each node runs, so the same declaration
 * drives what a job reads, what it waits for, and what makes it stale.
 */
export function nodeBuilder(
	registry: ConnectorRegistry,
	state: ProjectState,
): NodeBuilder {
	return (spec) => {
		// Scoped to one call: it dedupes nodes shared within a single graph and
		// detects cycles. Held across calls it would serve a stale node back once
		// its element changed, since element content is not part of `state`.
		const resolved = new Map<string, GenerationNode>();
		const resolving = new Set<string>();

		const build = ({ element, plugins: override }: ElementNode) => {
			const { id } = element;
			const existing = resolved.get(id);
			if (existing) return existing;
			if (resolving.has(id))
				throw new Error(`Cyclic generation dependency at "${id}"`);
			resolving.add(id);

			const {
				type: connectorType,
				provider,
				config,
			} = resolveElementConnector(element, registry);
			const plugins = override ?? config.plugins ?? [];
			const node = toNode(
				element,
				{
					elementId: id,
					connectorType,
					provider,
					config: { ...config, plugins },
					state,
				},
				plugins.flatMap(
					(plugin) => plugin.dependencies?.(element).map(resolve) ?? [],
				),
			);

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
