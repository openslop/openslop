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

/** One graph's worth of state: nodes shared within it, and the cycle guard. */
const resolver = (ctx: BuildContext) => {
	const resolved = new Map<string, JobNode>();
	const resolving = new Set<string>();

	const build = ({ element, plugins: override, label }: ElementNode) => {
		const { id } = element;
		const existing = resolved.get(id);
		if (existing) return existing;
		if (resolving.has(id))
			throw new Error(`Cyclic generation dependency at "${id}"`);
		resolving.add(id);

		const connector = resolveElementConnector(element, ctx.registry, ctx.state);
		const plugins = override ?? connector.config.plugins ?? [];
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
			throw new Error(`Two dependencies of "${id}" share the key "${shared}"`);
		const node = toNode(
			element,
			connector,
			plugins,
			Object.fromEntries(edges),
			label,
		);

		resolving.delete(id);
		resolved.set(id, node);
		return node;
	};

	const resolve = (dep: NodeSpec): GenerationNode => {
		const named = dep(ctx);
		return isElementNode(named) ? build(named) : named;
	};

	return resolve;
};

export const buildNode = (spec: NodeSpec, ctx: BuildContext): GenerationNode =>
	resolver(ctx)(spec);

/** One graph, so a shared node is built once and a root reached as a dependency keeps no label. */
export const buildNodes = (
	specs: NodeSpec[],
	ctx: BuildContext,
): GenerationNode[] => specs.map(resolver(ctx));
