import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ASSET_URL_FIELDS } from "@/lib/connectors/assetUrl";
import type {
	AssetConnectorType,
	AssetResult,
	ConnectorConfig,
	ConnectorPlugin,
	ProviderKey,
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
	connectorType: AssetConnectorType;
	provider: ProviderKey;
	config: ConnectorConfig;
	/** The project state this job's inputs were resolved against. */
	state: ProjectData;
};

type NodeBase = {
	id: NodeId;
	inputs: NodeInputs;
	dependsOn: GenerationNode[];
};

/** Project state that is read rather than generated; its identity is its inputs. */
export type SourceNode = NodeBase & { job: null };

/** A unit of generation: something the queue can run. */
export type JobNode = NodeBase & { job: GenerationJob };

/** A node and its edges. */
export type GenerationNode = SourceNode | JobNode;

/** A node still to be built. `plugins` replaces the registry chain. */
export type ElementNode = {
	element: CanvasContentElement;
	plugins?: ConnectorPlugin[];
};

/**
 * Declares which node to build without saying how; only the builder knows the
 * registry and the state. A source-node spec returns its node directly.
 */
export type NodeSpec = (state: ProjectData) => ElementNode | GenerationNode;

/** Only an unbuilt node carries an element; never add one to `GenerationNode`. */
export const isElementNode = (
	value: ElementNode | GenerationNode,
): value is ElementNode => "element" in value;

export const forElement =
	(element: CanvasContentElement): NodeSpec =>
	() => ({ element });

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

export function sourceNode(
	id: NodeId,
	attributes: Record<string, string | number>,
): SourceNode {
	return {
		id,
		inputs: { prompt: "", attributes },
		dependsOn: [],
		job: null,
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
		? serializeInputs(nodeInputs(node, results))
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
