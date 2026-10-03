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

/** Everything about `node` that no longer matches the result it produced. */
function changedInputs(node: GenerationNode, queue: GenerationQueue): string[] {
	const previous = queue.getElementSnapshot(node.id).resultInputs;
	if (!previous) return [];
	const current = generationInputs(node, queue);

	const changedKeys = (
		now: Record<string, unknown>,
		then: Record<string, unknown>,
	) =>
		union(Object.keys(now), Object.keys(then)).filter(
			(key) => now[key] !== then[key],
		);
	return uniq([
		...(current.prompt !== previous.prompt ? ["the prompt"] : []),
		...changedKeys(current.attributes, previous.attributes).map(lowerCase),
		...changedKeys(current.reads, previous.reads),
		...Object.values(node.dependsOn)
			.filter(
				({ node: dep }) =>
					current.dependencies[dep.id] !== previous.dependencies[dep.id] ||
					needsGeneration(dep, queue),
			)
			.map(({ label }) => label),
	]);
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
