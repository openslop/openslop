import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import isEqualWith from "lodash/isEqualWith";
import type {
	CanvasContentElement,
	CanvasElementType,
} from "@/lib/canvas/types";
import { elementById } from "@/lib/canvas/scenes";
import { ASSET_URL_FIELDS } from "@/lib/connectors/assetUrl";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type {
	AssetConnectorType,
	AssetResult,
	ConnectorConfig,
	ConnectorPlugin,
	ModelRef,
} from "@/lib/connectors/types";
import type { ProjectData } from "@/lib/project/store";
import {
	serializeInputs,
	type GenerationInputs,
	type NodeInputs,
} from "./inputs";

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
	dependsOn: Record<string, GenerationNode>;
	/** How the node reads when a dependent has to name it to the user. */
	label?: string;
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

/** A node still to be built. `plugins` replaces the registry chain. */
export type ElementNode = {
	element: CanvasContentElement;
	plugins?: ConnectorPlugin[];
	label?: string;
};

/**
 * What a build reads: project state, the canvas in document order, and the
 * registry that gives each element its connector and plugins.
 */
export type BuildContext = {
	state: ProjectData;
	canvas: CanvasContentElement[];
	registry: ConnectorRegistry;
};

/**
 * Declares which node to build without saying how; only the builder knows the
 * registry and the state. A source-node spec returns its node directly.
 */
export type NodeSpec = (ctx: BuildContext) => ElementNode | GenerationNode;

/** Only an unbuilt node carries an element; never add one to `GenerationNode`. */
export const isElementNode = (
	value: ElementNode | GenerationNode,
): value is ElementNode => "element" in value;

/**
 * The element as the canvas being built has it. The given one stands in only
 * when it is not on that canvas, as a character's avatar is not.
 */
export const forElement =
	(element: CanvasContentElement): NodeSpec =>
	({ canvas }) => ({ element: elementById(canvas, element.id) ?? element });

/** What the graph reads back about a node the queue has settled. */
export type NodeResult = {
	result: AssetResult | null;
	resultInputs: GenerationInputs | null;
	/** The result was supplied rather than generated, so it is never regenerated. */
	pinned: boolean;
};

/** The read half of the queue, declared here so the graph depends on nothing. */
export type NodeResults = {
	getElementSnapshot(id?: string): NodeResult;
};

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
	label?: string,
): SourceNode {
	const inputs = { prompt: "", attributes };
	return {
		id,
		inputs,
		dependsOn: {},
		label,
		job: null,
		identity: serializeInputs({ ...inputs, dependencies: {} }),
	};
}

/** What a dependent records about a dependency's output. */
export function resultIdentity(result: AssetResult | null): string {
	if (!result) return "";
	return compact(ASSET_URL_FIELDS.map((field) => result[field])).join("|");
}

export function nodeIdentity(
	node: GenerationNode,
	results: NodeResults,
): string {
	return isSourceNode(node)
		? node.identity
		: resultIdentity(results.getElementSnapshot(node.id).result);
}

export function nodeInputs(
	node: GenerationNode,
	results: NodeResults,
): GenerationInputs {
	return {
		...node.inputs,
		dependencies: Object.fromEntries(
			Object.values(node.dependsOn).map((dep) => [
				dep.id,
				nodeIdentity(dep, results),
			]),
		),
	};
}

export function needsGeneration(
	node: GenerationNode,
	results: NodeResults,
): boolean {
	if (isSourceNode(node)) return false;
	const snapshot = results.getElementSnapshot(node.id);
	if (!snapshot.result) return true;
	// The user supplied this result; drifting project state must not replace it.
	if (snapshot.pinned) return false;
	return (
		Object.values(node.dependsOn).some((dep) =>
			needsGeneration(dep, results),
		) || !isEqual(nodeInputs(node, results), snapshot.resultInputs)
	);
}

export const isNodeStale = (
	node: GenerationNode,
	results: NodeResults,
): boolean =>
	Boolean(results.getElementSnapshot(node.id).result) &&
	needsGeneration(node, results);

/** Every node reachable from `roots`, dependencies before their dependents. */
export function flattenGraph(roots: GenerationNode[]): GenerationNode[] {
	const ordered: GenerationNode[] = [];
	const seen = new Set<NodeId>();
	const visit = (node: GenerationNode) => {
		if (seen.has(node.id)) return;
		seen.add(node.id);
		for (const dep of Object.values(node.dependsOn)) visit(dep);
		ordered.push(node);
	};
	for (const root of roots) visit(root);
	return ordered;
}
