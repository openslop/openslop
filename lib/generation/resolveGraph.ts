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
	type BuildContext,
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
	dependsOn: GenerationNode[],
	{ state, canvas }: BuildContext,
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
		state,
		canvas,
	},
});

/** The label is used for staleness messaging */
const labelled = (node: JobNode, label: string | undefined): JobNode =>
	label === undefined ? node : { ...node, label };

/**
 * Edges come from the plugin chain each node runs, so one declaration drives
 * what a job reads, what it waits for, and what makes it stale.
 */
export function nodeBuilder(
	registry: ConnectorRegistry,
	state: ProjectData,
	canvas: () => CanvasContentElement[],
): NodeBuilder {
	// Nodes are shared between builds against the same canvas, so a document
	// edit, which is a new canvas, is the only thing that builds an element again.
	const revisions = new WeakMap<CanvasContentElement[], Map<string, JobNode>>();
	return (spec) => {
		// Read once per build, so every node in the graph sees the same canvas.
		const ctx: BuildContext = { state, canvas: canvas() };
		const resolved = revisions.get(ctx.canvas) ?? new Map<string, JobNode>();
		revisions.set(ctx.canvas, resolved);
		const resolving = new Set<string>();

		const build = ({ element, plugins: override, label }: ElementNode) => {
			const { id } = element;
			const existing = resolved.get(id);
			if (existing) return labelled(existing, label);
			if (resolving.has(id))
				throw new Error(`Cyclic generation dependency at "${id}"`);
			resolving.add(id);

			const connector = resolveElementConnector(element, registry, state);
			const plugins = override ?? connector.config.plugins ?? [];
			const dependsOn = plugins.flatMap(
				(plugin) => plugin.dependencies?.(element).map(resolve) ?? [],
			);
			const node = toNode(element, connector, plugins, dependsOn, ctx);

			resolving.delete(id);
			resolved.set(id, node);
			return labelled(node, label);
		};

		const resolve = (dep: NodeSpec): GenerationNode => {
			const declared = dep(ctx);
			return isElementNode(declared) ? build(declared) : declared;
		};

		return resolve(spec);
	};
}
