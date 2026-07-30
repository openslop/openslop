import omit from "lodash/omit";
import { resolveElementConnector } from "@/lib/canvas/elementConnector";
import { ELEMENT_TYPES } from "@/lib/canvas/types";
import {
	getDefaultConnector,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import { getPromptText } from "./inputs";
import {
	isElementNode,
	type ElementNode,
	type GenerationNode,
	type NodeSpec,
} from "./graph";
import type { ProjectState } from "./sourceNodes";

/** Builds the node a spec names, along with every node it depends on. */
export type NodeBuilder = (spec: NodeSpec) => GenerationNode;

/**
 * Bind a builder to the registry and project state its nodes resolve against.
 * Edges come from the plugin chain each node runs, so the same declaration
 * drives what a job reads, what it waits for, and what makes it stale.
 */
export function nodeBuilder(
	registry: ConnectorRegistry,
	state: ProjectState,
): NodeBuilder {
	const resolved = new Map<string, GenerationNode>();
	const resolving = new Set<string>();

	const build = ({
		element,
		plugins: override,
	}: ElementNode): GenerationNode => {
		const { id } = element;
		const existing = resolved.get(id);
		if (existing) return existing;
		if (resolving.has(id))
			throw new Error(`Cyclic generation dependency at "${id}"`);
		resolving.add(id);

		const connectorType = ELEMENT_TYPES[element.type].connector;
		// Derived nodes (avatars, stills) are not authored elements, so they take
		// the registry default rather than resolving a provider pinned on one.
		const { provider, config } = override
			? getDefaultConnector(registry, connectorType)
			: resolveElementConnector(element, registry);
		const plugins = override ?? config.plugins ?? [];
		const job = {
			elementId: id,
			connectorType,
			provider,
			config: { ...config, plugins },
			state,
		};
		const node: GenerationNode = {
			id,
			inputs: {
				prompt: getPromptText(element),
				attributes: omit(element.customAttributes ?? {}, LAYOUT_ATTRIBUTE_KEYS),
			},
			dependsOn: plugins.flatMap(
				(plugin) => plugin.dependencies?.(element).map(buildNode) ?? [],
			),
			buildJob: () => job,
		};

		resolving.delete(id);
		resolved.set(id, node);
		return node;
	};

	const buildNode: NodeBuilder = (spec) => {
		const declared = spec(state);
		return isElementNode(declared) ? build(declared) : declared;
	};

	return buildNode;
}
