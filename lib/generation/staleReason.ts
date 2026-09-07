import lowerCase from "lodash/lowerCase";
import union from "lodash/union";
import uniq from "lodash/uniq";
import upperFirst from "lodash/upperFirst";
import {
	isNodeStale,
	needsGeneration,
	nodeInputs,
	type GenerationNode,
	type NodeResults,
} from "./graph";

/** How many changes are named before the rest are counted off. */
const MAX_NAMED = 3;

const list = new Intl.ListFormat("en", { type: "conjunction" });

/** Everything about `node` that no longer matches the result it produced. */
function changedInputs(node: GenerationNode, results: NodeResults): string[] {
	const previous = results.getElementSnapshot(node.id).resultInputs;
	if (!previous) return [];
	const current = nodeInputs(node, results);

	const attributeKeys = union(
		Object.keys(current.attributes),
		Object.keys(previous.attributes),
	);
	return uniq([
		...(current.prompt !== previous.prompt ? ["the prompt"] : []),
		...attributeKeys
			.filter((key) => current.attributes[key] !== previous.attributes[key])
			.map(lowerCase),
		...node.dependsOn
			.filter(
				(dep) =>
					current.dependencies[dep.id] !== previous.dependencies[dep.id] ||
					needsGeneration(dep, results),
			)
			.map((dep) => dep.label ?? "an upstream element"),
	]);
}

/**
 * Why the badge is lit, in the user's terms. A dependency has no visible locus
 * on the canvas, so naming it is the whole point. `null` means not stale.
 */
export function staleReason(
	node: GenerationNode,
	results: NodeResults,
): string | null {
	if (!isNodeStale(node, results)) return null;
	const changes = changedInputs(node, results);
	const named = changes.slice(0, MAX_NAMED);
	const rest = changes.length - named.length;
	if (rest > 0) named.push(`${rest} more`);
	const what = named.length > 0 ? list.format(named) : "its inputs";
	return `${upperFirst(what)} changed — regenerate to update`;
}
