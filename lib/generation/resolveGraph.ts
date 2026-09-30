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
	type Dependency,
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
	dependsOn: Record<string, Dependency>,
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
		model: connector.model,
		config: { ...connector.config, plugins },
	},
});

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

	const dependenciesOf = (
		element: CanvasContentElement,
		plugins: ConnectorPlugin[],
	) => {
		const dependencies = plugins.flatMap((plugin) =>
			(plugin.dependencies ?? []).flatMap((declared) =>
				declared
					.specs(element)
					.map(
						([key, spec, label]) =>
							[key, { node: resolve(spec), label }] as const,
					),
			),
		);
		const keys = dependencies.map(([key]) => key);
		const shared = keys.find((key, i) => keys.indexOf(key) !== i);
		if (shared)
			throw new Error(
				`Two dependencies of "${element.id}" share the key "${shared}"`,
			);
		return Object.fromEntries(dependencies);
	};

	const build = ({ element, plugins: override }: ElementNode) => {
		const { id } = element;
		const existing = resolved.get(id);
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
				toNode(element, connector, plugins, dependenciesOf(element, plugins)),
			);
			resolved.set(id, node);
			return node;
		} finally {
			resolving.delete(id);
		}
	};

	const resolve = (spec: NodeSpec): GenerationNode => {
		const named = spec(ctx);
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
