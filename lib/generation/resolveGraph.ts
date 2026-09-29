import identity from "lodash/identity";
import {
	resolveElementConnector,
	type ElementConnector,
} from "@/lib/canvas/elementConnector";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { getPromptText } from "./inputs";
import {
	isElementNode,
	type BuildContext,
	type ElementNode,
	type GenerationNode,
	type JobNode,
	type NodeSpec,
} from "./graph";

/** The node an element becomes, and the job that generates it. */
const toNode = (
	element: CanvasContentElement,
	connector: ElementConnector,
	plugins: ConnectorPlugin[],
	dependsOn: Record<string, GenerationNode>,
	label: string | undefined,
): JobNode => ({
	id: element.id,
	label,
	inputs: {
		prompt: getPromptText(element),
		attributes: element.generationAttributes ?? {},
	},
	dependsOn,
	job: {
		elementId: element.id,
		elementType: element.type,
		connectorType: connector.type,
		model: connector.model,
		config: { ...connector.config, plugins },
	},
});

/** An id alone does not name a node: it carries the label it was reached under. */
export const nodeKey = (id: string, ...rest: (string | undefined)[]) =>
	[id, ...rest].join("\n");

/**
 * One graph's worth of state: nodes shared within it, and the cycle guard.
 * `settle` has the last word on every node built, which is how a graph hands
 * back a node it already holds.
 */
export const resolver = (
	ctx: BuildContext,
	settle: (node: GenerationNode) => GenerationNode = identity,
) => {
	const resolved = new Map<string, GenerationNode>();
	const resolving = new Set<string>();

	const edgesOf = (
		element: CanvasContentElement,
		plugins: ConnectorPlugin[],
	) => {
		const edges = plugins.flatMap((plugin) =>
			(plugin.dependencies ?? []).flatMap((declared) =>
				declared
					.specs(element)
					.map(([key, spec]) => [key, resolve(spec)] as const),
			),
		);
		const keys = edges.map(([key]) => key);
		const shared = keys.find((key, i) => keys.indexOf(key) !== i);
		if (shared)
			throw new Error(
				`Two dependencies of "${element.id}" share the key "${shared}"`,
			);
		return Object.fromEntries(edges);
	};

	const build = ({ element, plugins: override, label }: ElementNode) => {
		const { id } = element;
		const key = nodeKey(id, label);
		const existing = resolved.get(key);
		if (existing) return existing;
		if (resolving.has(id))
			throw new Error(`Cyclic generation dependency at "${id}"`);
		resolving.add(id);

		// A graph outlives a build that throws, and the next one must throw the same.
		try {
			const connector = resolveElementConnector(
				element,
				ctx.registry,
				ctx.state,
			);
			const plugins = override ?? connector.config.plugins ?? [];
			const node = settle(
				toNode(element, connector, plugins, edgesOf(element, plugins), label),
			);
			resolved.set(key, node);
			return node;
		} finally {
			resolving.delete(id);
		}
	};

	const resolve = (dep: NodeSpec): GenerationNode => {
		const named = dep(ctx);
		return isElementNode(named) ? build(named) : settle(named);
	};

	return resolve;
};

export const buildNode = (spec: NodeSpec, ctx: BuildContext): GenerationNode =>
	resolver(ctx)(spec);

/** One graph, so a node two roots share is built once. */
export const buildNodes = (
	specs: NodeSpec[],
	ctx: BuildContext,
): GenerationNode[] => specs.map(resolver(ctx));
