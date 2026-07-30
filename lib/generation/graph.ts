import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ASSET_URL_FIELDS } from "@/lib/connectors/assetUrl";
import type { AssetResult, ConnectorPlugin } from "@/lib/connectors/types";
import type { ProjectState } from "./sourceNodes";
import {
	serializeNodeInputs,
	type GenerationInputs,
	type NodeInputs,
} from "./inputs";
import type { ElementSnapshot, GenerationJob } from "./queue";

export type NodeId = string;

/**
 * A unit of generation and its edges. `buildJob` is null for source nodes, which
 * stand for project state (reference images, art style) that is read rather than
 * generated: they are always resolved, and their identity is their own inputs.
 */
export type GenerationNode = {
	id: NodeId;
	inputs: NodeInputs;
	dependsOn: GenerationNode[];
	buildJob: (() => GenerationJob) | null;
};

/** A node still to be built. `plugins` replaces the registry chain. */
export type ElementNode = {
	element: CanvasContentElement;
	plugins?: ConnectorPlugin[];
};

/**
 * Declares which node to build, without saying how. Callers and plugins name a
 * spec; only the builder knows the registry, the state, and what a node is made
 * of. Source-node specs return their node directly, having nothing to build.
 */
export type NodeSpec = (state: ProjectState) => ElementNode | GenerationNode;

/** Only an unbuilt node carries an element; never add one to `GenerationNode`. */
export const isElementNode = (
	value: ElementNode | GenerationNode,
): value is ElementNode => "element" in value;

/** The node for an authored canvas element. */
export const forElement =
	(element: CanvasContentElement): NodeSpec =>
	() => ({ element });

/** Read surface `GenerationQueue` satisfies; keeps the graph free of the queue. */
export type NodeResults = {
	getElementSnapshot(id: NodeId): ElementSnapshot;
};

export const isSourceNode = (node: GenerationNode) => node.buildJob === null;

const DERIVED_PREFIX = "~";

/**
 * Ids for nodes the graph derives rather than the user authoring, such as
 * character avatars and the stills behind animated images. The prefix is what
 * keeps them from ever colliding with an element id, and what element-facing UI
 * filters on.
 */
export const derivedNodeId = (kind: string, key: string): NodeId =>
	`${DERIVED_PREFIX}${kind}:${key}`;

export const isDerivedNodeId = (id: NodeId) => id.startsWith(DERIVED_PREFIX);

export function sourceNode(
	id: NodeId,
	attributes: Record<string, string | number>,
): GenerationNode {
	return {
		id,
		inputs: { prompt: "", attributes },
		dependsOn: [],
		buildJob: null,
	};
}

/** A source node stands for state that is read, so asking it to generate is a bug. */
export function requireJob(node: GenerationNode): GenerationJob {
	if (!node.buildJob)
		throw new Error(`Source node "${node.id}" cannot be generated`);
	return node.buildJob();
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
		? serializeNodeInputs(node.inputs)
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

/**
 * A node needs generating when it has no result, its own inputs drifted, or
 * anything it depends on needs generating. Source nodes are always resolved.
 */
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

/** Stale is "needs generating despite already having a result". */
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
