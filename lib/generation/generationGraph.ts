import isEqual from "lodash/isEqual";
import memoizeOne from "memoize-one";
import { shallow } from "zustand/shallow";
import { resolveElementConnector } from "@/lib/canvas/elementConnector";
import type { ScriptElement } from "@/lib/canvas/types";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { getPromptText } from "./inputs";
import type { BuildContext, Dependency, GenerationNode, NodeId } from "./graph";

const sameDependencies = (
	a: Record<string, Dependency>,
	b: Record<string, Dependency>,
) =>
	shallow(Object.keys(a), Object.keys(b)) &&
	Object.entries(a).every(([key, dependency]) => shallow(dependency, b[key]));

/** `job` is not compared: it is how a node runs, not what it reads. */
const isUnchanged = (before: GenerationNode, after: GenerationNode) =>
	sameDependencies(before.dependsOn, after.dependsOn) &&
	isEqual(before.inputs, after.inputs);

export class GenerationGraph {
	private readonly nodes = new Map<NodeId, GenerationNode>();
	private readonly previousNodes: Map<NodeId, GenerationNode>;
	private readonly visiting = new Set<NodeId>();

	constructor(
		private readonly ctx: BuildContext,
		previous?: GenerationGraph,
	) {
		this.previousNodes = previous?.nodes ?? new Map();
	}

	resolve = (element: ScriptElement): GenerationNode =>
		this.nodes.get(element.id) ??
		this.build(this.ctx.canvas.find(({ id }) => id === element.id) ?? element);

	private build(element: ScriptElement): GenerationNode {
		const { id } = element;
		const cached = this.nodes.get(id);
		if (cached) return cached;
		if (this.visiting.has(id))
			throw new Error(`Cyclic generation dependency at "${id}"`);
		this.visiting.add(id);

		try {
			const { registry, canvas } = this.ctx;
			const connector = resolveElementConnector(element, registry, canvas);
			const plugins = connector.config.plugins ?? [];
			return this.intern({
				id,
				inputs: {
					prompt: getPromptText(element),
					attributes: element.generationAttributes ?? {},
					reads: Object.assign(
						{},
						...plugins.map((plugin) => plugin.reads?.(element, this.ctx)),
					),
				},
				dependsOn: this.dependenciesOf(element, plugins),
				job: {
					elementId: id,
					elementType: element.type,
					connectorType: connector.type,
					model: connector.model,
					config: connector.config,
				},
			});
		} finally {
			this.visiting.delete(id);
		}
	}

	private dependenciesOf(element: ScriptElement, plugins: ConnectorPlugin[]) {
		const declared = plugins
			.flatMap((plugin) => plugin.dependencies ?? [])
			.flatMap((declaration) => declaration.edges(element, this.ctx));
		const dependsOn: Record<string, Dependency> = {};
		for (const [key, target, label] of declared) {
			if (Object.hasOwn(dependsOn, key))
				throw new Error(
					`Two dependencies of "${element.id}" share the key "${key}"`,
				);
			dependsOn[key] = { node: this.build(target), label };
		}
		return dependsOn;
	}

	private intern(node: GenerationNode) {
		const previous = this.previousNodes.get(node.id);
		const kept = previous && isUnchanged(previous, node) ? previous : node;
		this.nodes.set(node.id, kept);
		return kept;
	}
}

export const createGraphFor = () => {
	let graph: GenerationGraph | undefined;
	return memoizeOne((_document: unknown, buildContext: () => BuildContext) => {
		graph = new GenerationGraph(buildContext(), graph);
		return graph;
	});
};

/** Writes what the node's plugins settle, then builds it again from the canvas as written. */
export async function prepareNode(
	node: GenerationNode,
	context: () => BuildContext,
): Promise<GenerationNode> {
	const ctx = context();
	const element = ctx.canvas.find(({ id }) => id === node.id);
	if (!element) throw new Error(`Element "${node.id}" left the canvas`);
	const writes = await Promise.all(
		(node.job.config.plugins ?? []).map(
			(plugin) => plugin.prepare?.(element, ctx) ?? [],
		),
	);
	for (const write of writes.flat()) ctx.setAsset(write);
	return buildNode(element, context());
}

export const buildNode = (
	element: ScriptElement,
	ctx: BuildContext,
): GenerationNode => new GenerationGraph(ctx).resolve(element);

export const buildNodes = (
	elements: ScriptElement[],
	ctx: BuildContext,
): GenerationNode[] => elements.map(new GenerationGraph(ctx).resolve);
