import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import memoizeOne from "memoize-one";
import { ASSET_URL_FIELDS } from "../connectors/assetUrl";
import type { AssetResult } from "../connectors/types";
import { isSourceNode, type GenerationNode } from "./graph";
import type { GenerationInputs } from "./inputs";
import type { GenerationQueue } from "./queue";
import type { HeldResult } from "./snapshots";

const resultIdentity = (result: AssetResult | null): string =>
	result
		? compact(ASSET_URL_FIELDS.map((field) => result[field])).join("|")
		: "";

/**
 * What a dependent records about `node`. A source node's output is its input,
 * so its identity is settled when it is built; a job node's is the result held
 * for it now, which arrives after the graph is built.
 */
const identityOf = (node: GenerationNode, queue: GenerationQueue): string =>
	isSourceNode(node)
		? node.identity
		: resultIdentity(queue.getElementSnapshot(node.id).result);

export function generationInputs(
	node: GenerationNode,
	queue: GenerationQueue,
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

function judge(node: GenerationNode, queue: GenerationQueue): boolean {
	if (isSourceNode(node)) return false;
	const snapshot: HeldResult = queue.getElementSnapshot(node.id);
	if (!snapshot.result) return true;
	// The user supplied this result; drifting project state must not replace it.
	if (snapshot.pinned) return false;
	return (
		Object.values(node.dependsOn).some(({ node: dep }) =>
			needsGeneration(dep, queue),
		) || !isEqual(generationInputs(node, queue), snapshot.resultInputs)
	);
}

// Every card asks on every queue update; judge a node once per set of results, not once per dependent.
const verdictsFor = memoizeOne(
	(_queue: GenerationQueue, _resultVersion: number) =>
		new WeakMap<GenerationNode, boolean>(),
);

export function needsGeneration(
	node: GenerationNode,
	queue: GenerationQueue,
): boolean {
	const verdicts = verdictsFor(queue, queue.getResultVersion());
	const known = verdicts.get(node);
	if (known !== undefined) return known;
	const verdict = judge(node, queue);
	verdicts.set(node, verdict);
	return verdict;
}

export const isNodeStale = (
	node: GenerationNode,
	queue: GenerationQueue,
): boolean =>
	Boolean(queue.getElementSnapshot(node.id).result) &&
	needsGeneration(node, queue);
