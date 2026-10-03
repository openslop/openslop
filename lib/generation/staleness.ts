import compact from "lodash/compact";
import isEqual from "lodash/isEqual";
import memoizeOne from "memoize-one";
import { ASSET_URL_FIELDS } from "../connectors/assetUrl";
import type { GenerationNode } from "./graph";
import type { GenerationInputs } from "./inputs";
import type { GenerationQueue } from "./queue";
import type { HeldResult } from "./snapshots";

/** What a dependent records about `node`: the result held for it now, which arrives after the graph is built. */
const identityOf = (node: GenerationNode, queue: GenerationQueue): string => {
	const { result } = queue.getElementSnapshot(node.id);
	return result
		? compact(ASSET_URL_FIELDS.map((field) => result[field])).join("|")
		: "";
};

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
