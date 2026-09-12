import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import type {
	CanvasContentElement,
	CanvasElementType,
} from "@/lib/canvas/types";
import { ASSET_URL_FIELDS } from "@/lib/connectors/assetUrl";
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

/** Everything the queue needs to run one node. */
export type GenerationJob = {
	elementId: string;
	elementType: CanvasElementType;
	connectorType: AssetConnectorType;
	model: ModelRef;
	config: ConnectorConfig;
	/** The project state this job's inputs were resolved against. */
	state: ProjectData;
};

type NodeBase = {
	id: NodeId;
	inputs: NodeInputs;
	dependsOn: GenerationNode[];
	/** How the node reads when a dependent has to name it to the user. */
	label?: string;
};

/**
 * A leaf the queue never runs: project state that is read rather than
 * generated, or an orphan whose result was left behind. What a dependent
 * records of it is its identity, settled by the node itself.
 */
export type SourceNode = NodeBase & {
	job: null;
	identity: (results: NodeResults) => string;
};

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

/** What a spec may read while naming its node: project state, and the canvas by id. */
export type BuildContext = {
	state: ProjectData;
	elementById: (id: string) => CanvasContentElement | undefined;
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

export const forElement =
	(element: CanvasContentElement): NodeSpec =>
	() => ({ element });

/**
 * Another element on the canvas, by id. One that has since been deleted still
 * resolves, as an orphan whose snapshot the dependent reads as it was left.
 */
export const forCanvasElement =
	(id: string, label: string): NodeSpec =>
	({ elementById }) => {
		const element = elementById(id);
		return element ? { element, label } : orphanNode(id, label);
	};

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

const DERIVED_PREFIX = "~";

/** Ids for nodes the graph derives; the prefix keeps them off element ids. */
export const derivedNodeId = (kind: string, key: string): NodeId =>
	`${DERIVED_PREFIX}${kind}:${key}`;

/** Never changes once built, so its identity is settled at construction. */
export function sourceNode(
	id: NodeId,
	attributes: Record<string, string | number>,
	label?: string,
): SourceNode {
	const inputs = { prompt: "", attributes };
	const identity = serializeInputs({ ...inputs, dependencies: {} });
	return {
		id,
		inputs,
		dependsOn: [],
		label,
		job: null,
		identity: () => identity,
	};
}

/** A node nothing builds any more; what it is, is the result it left behind. */
export const orphanNode = (id: NodeId, label?: string): SourceNode => ({
	...sourceNode(id, {}, label),
	identity: (results) => resultIdentity(results.getElementSnapshot(id).result),
});

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
		? node.identity(results)
		: resultIdentity(results.getElementSnapshot(node.id).result);
}

export function nodeInputs(
	node: GenerationNode,
	results: NodeResults,
): GenerationInputs {
	return {
		...node.inputs,
		dependencies: Object.fromEntries(
			node.dependsOn.map((dep) => [dep.id, nodeIdentity(dep, results)]),
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
		node.dependsOn.some((dep) => needsGeneration(dep, results)) ||
		!isEqual(nodeInputs(node, results), snapshot.resultInputs)
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
		for (const dep of node.dependsOn) visit(dep);
		ordered.push(node);
	};
	for (const root of roots) visit(root);
	return ordered;
}
