import isEqual from "lodash/isEqual";
import memoizeOne from "memoize-one";
import { shallow } from "zustand/shallow";
import {
	resolveElementConnector,
	type ElementConnector,
} from "@/lib/canvas/elementConnector";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { getPromptText } from "./inputs";
import {
	isSourceNode,
	isUnbuiltElement,
	type BuildContext,
	type Dependency,
	type UnbuiltElement,
	type GenerationNode,
	type JobNode,
	type NodeId,
	type NodeSpec,
} from "./graph";

const toJobNode = (
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

/** Two elements may read one source differently, as two narrations do a voice. */
const keyOf = (node: GenerationNode) =>
	isSourceNode(node) ? `${node.id}\n${node.identity}` : node.id;

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
	private readonly nodes = new Map<string, GenerationNode>();
	private readonly previousNodes: Map<string, GenerationNode>;
	private readonly visiting = new Set<NodeId>();

	constructor(
		private readonly ctx: BuildContext,
		previous?: GenerationGraph,
	) {
		this.previousNodes = previous?.nodes ?? new Map();
	}

	resolve = (spec: NodeSpec): GenerationNode => {
		const target = spec(this.ctx);
		return isUnbuiltElement(target)
			? this.buildElement(target)
			: this.intern(target);
	};

	private buildElement({ element, plugins: override }: UnbuiltElement) {
		const { id } = element;
		const cached = this.nodes.get(id);
		if (cached) return cached;
		if (this.visiting.has(id))
			throw new Error(`Cyclic generation dependency at "${id}"`);
		this.visiting.add(id);

		try {
			const connector = resolveElementConnector(
				element,
				this.ctx.registry,
				this.ctx.state,
			);
			const plugins = override ?? connector.config.plugins ?? [];
			return this.intern(
				toJobNode(
					element,
					connector,
					plugins,
					this.dependenciesOf(element, plugins),
				),
			);
		} finally {
			this.visiting.delete(id);
		}
	}

	private dependenciesOf(
		element: CanvasContentElement,
		plugins: ConnectorPlugin[],
	) {
		const dependencies = plugins.flatMap((plugin) =>
			(plugin.dependencies ?? []).flatMap((declared) =>
				declared
					.specs(element)
					.map(
						([key, spec, label]) =>
							[key, { node: this.resolve(spec), label }] as const,
					),
			),
		);
		const keys = dependencies.map(([key]) => key);
		const duplicate = keys.find((key, i) => keys.indexOf(key) !== i);
		if (duplicate)
			throw new Error(
				`Two dependencies of "${element.id}" share the key "${duplicate}"`,
			);
		return Object.fromEntries(dependencies);
	}

	private intern(node: GenerationNode) {
		const key = keyOf(node);
		const cached = this.nodes.get(key);
		if (cached) return cached;
		const previous = this.previousNodes.get(key);
		const kept = previous && isUnchanged(previous, node) ? previous : node;
		this.nodes.set(key, kept);
		return kept;
	}
}

export const createGraphFor = () => {
	let graph: GenerationGraph | undefined;
	return memoizeOne((_document: unknown, context: () => BuildContext) => {
		graph = new GenerationGraph(context(), graph);
		return graph;
	});
};

export const buildNode = (spec: NodeSpec, ctx: BuildContext): GenerationNode =>
	new GenerationGraph(ctx).resolve(spec);

export const buildNodes = (
	specs: NodeSpec[],
	ctx: BuildContext,
): GenerationNode[] => specs.map(new GenerationGraph(ctx).resolve);
