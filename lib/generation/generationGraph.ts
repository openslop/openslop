import isEqual from "lodash/isEqual";
import pickBy from "lodash/pickBy";
import memoizeOne from "memoize-one";
import { shallow } from "zustand/shallow";
import { resolveElementConnector } from "@/lib/canvas/elementConnector";
import {
	isGenerated,
	type GeneratedElement,
	type CanvasElement,
} from "@/lib/canvas/types";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { getPromptText } from "./inputs";
import type { BuildContext, GenerationNode, NodeId } from "./graph";

export const generatedById = (canvas: CanvasElement[], id: string) =>
	canvas.find(
		(element): element is GeneratedElement =>
			isGenerated(element) && element.id === id,
	);

const isPresent = <T>(value: T | undefined): value is T => Boolean(value);

/** What the plugins read off the canvas and the settings; an empty or missing value is left out. */
export const pluginReads = (
	plugins: ConnectorPlugin[],
	element: GeneratedElement,
	ctx: BuildContext,
): Record<string, string> =>
	pickBy(
		Object.assign({}, ...plugins.map((plugin) => plugin.reads?.(element, ctx))),
		isPresent,
	);

/** The elements the plugins depend on, by label; one they found none of is left out. */
export const pluginDependencies = (
	plugins: ConnectorPlugin[],
	element: GeneratedElement,
	ctx: BuildContext,
): [string, GeneratedElement][] =>
	plugins.flatMap((plugin) =>
		Object.entries(pickBy(plugin.dependencies?.(element, ctx), isPresent)),
	);

/** `job` is not compared: it is how a node runs, not what it reads. */
const isUnchanged = (before: GenerationNode, after: GenerationNode) =>
	shallow(before.dependsOn, after.dependsOn) &&
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

	resolve = (element: GeneratedElement): GenerationNode =>
		this.nodes.get(element.id) ??
		this.build(generatedById(this.ctx.canvas, element.id) ?? element);

	private build(element: GeneratedElement): GenerationNode {
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
					reads: pluginReads(plugins, element, this.ctx),
				},
				dependsOn: this.dependenciesOf(element, plugins),
				job: {
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

	private dependenciesOf(
		element: GeneratedElement,
		plugins: ConnectorPlugin[],
	) {
		const dependsOn: Record<string, GenerationNode> = {};
		for (const [label, target] of pluginDependencies(
			plugins,
			element,
			this.ctx,
		)) {
			if (Object.hasOwn(dependsOn, label))
				throw new Error(
					`Two dependencies of "${element.id}" share the label "${label}"`,
				);
			dependsOn[label] = this.build(target);
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
	return memoizeOne(
		(buildContext: () => BuildContext, ..._revision: unknown[]) => {
			graph = new GenerationGraph(buildContext(), graph);
			return graph;
		},
	);
};

export async function prepareNode(
	node: GenerationNode,
	context: () => BuildContext,
	signal: AbortSignal,
): Promise<GenerationNode> {
	const ctx = context();
	const element = generatedById(ctx.canvas, node.id);
	if (!element) throw new Error(`Element "${node.id}" left the canvas`);
	const writes = await Promise.all(
		(node.job.config.plugins ?? []).map(
			(plugin) => plugin.prepare?.(element, ctx) ?? [],
		),
	);
	signal.throwIfAborted();
	for (const write of writes.flat()) ctx.setAsset(write);
	return buildNode(element, context());
}

export const buildNode = (
	element: GeneratedElement,
	ctx: BuildContext,
): GenerationNode => new GenerationGraph(ctx).resolve(element);

export const buildNodes = (
	elements: GeneratedElement[],
	ctx: BuildContext,
): GenerationNode[] => elements.map(new GenerationGraph(ctx).resolve);
