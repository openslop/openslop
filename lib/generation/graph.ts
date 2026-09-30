import isEqual from "lodash/isEqual";
import isEqualWith from "lodash/isEqualWith";
import type {
	CanvasContentElement,
	CanvasElementType,
} from "@/lib/canvas/types";
import { elementById } from "@/lib/canvas/scenes";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type {
	AssetConnectorType,
	ConnectorConfig,
	ConnectorPlugin,
	ModelRef,
} from "@/lib/connectors/types";
import type { ProjectData, ProjectStore } from "@/lib/project/store";
import {
	serializeInputs,
	type GenerationInputs,
	type NodeInputs,
} from "./inputs";
import type { GenerationQueue } from "./queue";

export type NodeId = string;

/** How a node runs: the connector and its configuration. */
export type GenerationJob = {
	elementId: string;
	elementType: CanvasElementType;
	connectorType: AssetConnectorType;
	model: ModelRef;
	config: ConnectorConfig;
};

type NodeBase = {
	id: NodeId;
	inputs: NodeInputs;
	/** Keyed by the name the declaring plugin gave the edge, which is how its result reaches that plugin. */
	dependsOn: Record<string, Edge>;
};

/**
 * Project state that is read rather than generated. It has no edges and never
 * changes once built, so its identity is settled at construction rather than
 * re-serialized for every dependent that asks.
 */
export type SourceNode = NodeBase & { job: null; identity: string };

/** A unit of generation: something the queue can run. */
export type JobNode = NodeBase & { job: GenerationJob };

/** A node and its edges. */
export type GenerationNode = SourceNode | JobNode;

/**
 * A dependency as its dependent reaches it. The label is how the dependent
 * names it to the user, so one node can read differently to each dependent:
 * an image is "the previous visual" only to the video after it.
 */
export type Edge = { node: GenerationNode; label?: string };

/** A node still to be built. `plugins` replaces the registry chain. */
export type ElementNode = {
	element: CanvasContentElement;
	plugins?: ConnectorPlugin[];
	/** Carried onto the edge that reaches it; see `Edge`. */
	label?: string;
};

/**
 * What a build reads: project state, the canvas in document order, and the
 * registry that gives each element its connector and plugins. `state` is a
 * snapshot of `store`, so a job generates from the state its inputs were
 * recorded against, however long it waits in the queue.
 */
export type BuildContext = {
	store: ProjectStore;
	state: ProjectData;
	canvas: CanvasContentElement[];
	registry: ConnectorRegistry;
};

/**
 * Declares which node to build without saying how; only the builder knows the
 * registry and the state. A source-node spec returns its edge directly.
 */
export type NodeSpec = (ctx: BuildContext) => ElementNode | Edge;

/** Only an unbuilt node carries an element; never add one to `Edge`. */
export const isElementNode = (
	value: ElementNode | Edge,
): value is ElementNode => "element" in value;

/**
 * The element as the canvas being built has it. The given one stands in only
 * when it is not on that canvas, as a character's avatar is not.
 */
export const forElement =
	(element: CanvasContentElement): NodeSpec =>
	({ canvas }) => ({ element: elementById(canvas, element.id) ?? element });

export const isSourceNode = (node: GenerationNode): node is SourceNode =>
	node.job === null;

const ignoringJob = (_a: unknown, _b: unknown, key?: unknown) =>
	key === "job" ? true : undefined;

/**
 * Whether two builds read the same thing: the same nodes, inputs and edges.
 * The job, which is how a node runs, is not compared.
 */
export const isSameGraph = (
	a: GenerationNode | GenerationNode[] | null,
	b: GenerationNode | GenerationNode[],
): boolean => isEqualWith(a, b, ignoringJob);

const DERIVED_PREFIX = "~";

/** Ids for nodes the graph derives; the prefix keeps them off element ids. */
export const derivedNodeId = (kind: string, key: string): NodeId =>
	`${DERIVED_PREFIX}${kind}:${key}`;

export function sourceNode(
	id: NodeId,
	attributes: Record<string, string | number>,
): SourceNode {
	const inputs = { prompt: "", attributes };
	return {
		id,
		inputs,
		dependsOn: {},
		job: null,
		identity: serializeInputs({ ...inputs, dependencies: {} }),
	};
}

export function nodeInputs(
	node: GenerationNode,
	queue: GenerationQueue,
): GenerationInputs {
	return {
		...node.inputs,
		dependencies: Object.fromEntries(
			Object.values(node.dependsOn).map(({ node: dep }) => [
				dep.id,
				queue.identityOf(dep),
			]),
		),
	};
}

export function needsGeneration(
	node: GenerationNode,
	queue: GenerationQueue,
): boolean {
	if (isSourceNode(node)) return false;
	const snapshot = queue.getElementSnapshot(node.id);
	if (!snapshot.result) return true;
	// The user supplied this result; drifting project state must not replace it.
	if (snapshot.pinned) return false;
	return (
		Object.values(node.dependsOn).some(({ node: dep }) =>
			needsGeneration(dep, queue),
		) || !isEqual(nodeInputs(node, queue), snapshot.resultInputs)
	);
}

export const isNodeStale = (
	node: GenerationNode,
	queue: GenerationQueue,
): boolean =>
	Boolean(queue.getElementSnapshot(node.id).result) &&
	needsGeneration(node, queue);

/** Every node reachable from `roots`, dependencies before their dependents. */
export function flattenGraph(roots: GenerationNode[]): GenerationNode[] {
	const ordered: GenerationNode[] = [];
	const seen = new Set<NodeId>();
	const visit = (node: GenerationNode) => {
		if (seen.has(node.id)) return;
		seen.add(node.id);
		for (const { node: dep } of Object.values(node.dependsOn)) visit(dep);
		ordered.push(node);
	};
	for (const root of roots) visit(root);
	return ordered;
}
