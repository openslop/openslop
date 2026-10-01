import isEqual from "lodash/isEqual";
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
	/** Keyed by the name the declaring plugin gave the dependency, which is how its result reaches that plugin. */
	dependsOn: Record<string, Dependency>;
};

/**
 * Project state that is read rather than generated. It has no edges and never
 * changes once built, so its identity is settled at construction rather than
 * re-serialized for every dependent that asks.
 */
export type SourceNode = NodeBase & { identity: string };

/** A unit of generation: something the queue can run. */
export type JobNode = NodeBase & { job: GenerationJob };

export type GenerationNode = SourceNode | JobNode;

/** Each dependent names `node` its own way, so `label` lives on the edge. */
export type Dependency = { node: GenerationNode; label: string };

/** `plugins` replaces the registry chain. */
export type UnbuiltElement = {
	element: CanvasContentElement;
	plugins?: ConnectorPlugin[];
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
 * registry and the state.
 */
export type NodeSpec = (ctx: BuildContext) => UnbuiltElement | SourceNode;

/**
 * The element as the canvas being built has it. The given one stands in only
 * when it is not on that canvas, as a character's avatar is not.
 */
export const forElement =
	(element: CanvasContentElement): NodeSpec =>
	({ canvas }) => ({ element: elementById(canvas, element.id) ?? element });

export const isSourceNode = (node: GenerationNode): node is SourceNode =>
	!("job" in node);

export const isUnbuiltElement = (
	target: UnbuiltElement | SourceNode,
): target is UnbuiltElement => "element" in target;

/** A node with no prompt has nothing to generate from. */
export const hasPrompt = (node: GenerationNode) => Boolean(node.inputs.prompt);

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
