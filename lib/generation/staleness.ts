import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import { ASSET_URL_FIELDS } from "../connectors/assetUrl";
import type { AssetResult } from "../connectors/types";
import { isSourceNode, type GenerationNode } from "./graph";
import type { GenerationInputs } from "./inputs";
import type { ElementSnapshot } from "./snapshots";

/** All that staleness reads of the queue. */
export type SnapshotReader = {
	getElementSnapshot: (id: string) => ElementSnapshot;
};

const resultIdentity = (result: AssetResult | null): string =>
	result
		? compact(ASSET_URL_FIELDS.map((field) => result[field])).join("|")
		: "";

/**
 * What a dependent records about `node`. A source node's output is its input,
 * so its identity is settled when it is built; a job node's is the result held
 * for it now, which arrives after the graph is built.
 */
const identityOf = (node: GenerationNode, queue: SnapshotReader): string =>
	isSourceNode(node)
		? node.identity
		: resultIdentity(queue.getElementSnapshot(node.id).result);

export function generationInputs(
	node: GenerationNode,
	queue: SnapshotReader,
): GenerationInputs {
	return {
		...node.inputs,
		dependencies: Object.fromEntries(
			Object.values(node.dependsOn).map(({ node: dep }) => [
				dep.id,
				identityOf(dep, queue),
			]),
		),
	};
}

export function needsGeneration(
	node: GenerationNode,
	queue: SnapshotReader,
): boolean {
	if (isSourceNode(node)) return false;
	const snapshot = queue.getElementSnapshot(node.id);
	if (!snapshot.result) return true;
	// The user supplied this result; drifting project state must not replace it.
	if (snapshot.pinned) return false;
	return (
		Object.values(node.dependsOn).some(({ node: dep }) =>
			needsGeneration(dep, queue),
		) || !isEqual(generationInputs(node, queue), snapshot.resultInputs)
	);
}

export const isNodeStale = (
	node: GenerationNode,
	queue: SnapshotReader,
): boolean =>
	Boolean(queue.getElementSnapshot(node.id).result) &&
	needsGeneration(node, queue);
