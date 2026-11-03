import isEqual from "lodash/isEqual";
import lowerCase from "lodash/lowerCase";
import union from "lodash/union";
import uniq from "lodash/uniq";
import upperFirst from "lodash/upperFirst";
import type { GenerationNode } from "./graph";
import type { GenerationQueue } from "./queue";
import { generationInputs, isNodeStale, needsGeneration } from "./staleness";

/** How many changes are named before the rest are counted off. */
const MAX_NAMED = 3;

const list = new Intl.ListFormat("en", { type: "conjunction" });

const changedKeys = (
	current: Record<string, unknown>,
	previous: Record<string, unknown>,
) =>
	union(Object.keys(current), Object.keys(previous)).filter(
		(key) => current[key] !== previous[key],
	);

/** Everything about `node` that no longer matches the result it produced. */
function changedInputs(node: GenerationNode, queue: GenerationQueue): string[] {
	const previous = queue.getElementSnapshot(node.id).resultInputs;
	if (!previous) return [];
	const current = generationInputs(node, queue);
	return uniq([
		...(current.prompt !== previous.prompt ? ["the prompt"] : []),
		...changedKeys(current.attributes, previous.attributes).map(lowerCase),
		...changedKeys(current.reads, previous.reads),
		...changedKeys(current.dependencies, previous.dependencies),
		...Object.entries(node.dependsOn)
			.filter(([, dep]) => needsGeneration(dep, queue))
			.map(([label]) => label),
	]);
}

/** Stale only through its own prompt or attributes, so putting those back clears the marker. */
export function resettableEdits(
	node: GenerationNode,
	queue: GenerationQueue,
): boolean {
	const previous = queue.getElementSnapshot(node.id).resultInputs;
	if (!previous || !isNodeStale(node, queue)) return false;
	const current = generationInputs(node, queue);
	return (
		isEqual(current.reads, previous.reads) &&
		isEqual(current.dependencies, previous.dependencies) &&
		!Object.values(node.dependsOn).some((dep) => needsGeneration(dep, queue))
	);
}

/**
 * Why the badge is lit, in the user's terms. A dependency has no visible locus
 * on the canvas, so naming it is the whole point. `null` means not stale.
 */
export function staleReason(
	node: GenerationNode,
	queue: GenerationQueue,
): string | null {
	if (!isNodeStale(node, queue)) return null;
	const changes = changedInputs(node, queue);
	const named = changes.slice(0, MAX_NAMED);
	const rest = changes.length - named.length;
	if (rest > 0) named.push(`${rest} more`);
	const what = named.length > 0 ? list.format(named) : "its inputs";
	return `${upperFirst(what)} changed — regenerate to update`;
}
