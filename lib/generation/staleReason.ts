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
import type { GenerationInputs } from "./inputs";

/** How many changes are named before the rest are counted off. */
const MAX_NAMED = 3;

const UNLABELLED = "an upstream element";

const list = new Intl.ListFormat("en", { type: "conjunction" });

/** Everything in `current` that differs from `previous`, in the user's terms. */
export function changedInputs(
	current: GenerationInputs,
	previous: GenerationInputs,
	labelOf: (dependencyId: string) => string | undefined,
): string[] {
	const attributeKeys = union(
		Object.keys(current.attributes),
		Object.keys(previous.attributes),
	);
	return uniq([
		...(current.prompt !== previous.prompt ? ["the prompt"] : []),
		...attributeKeys
			.filter((key) => current.attributes[key] !== previous.attributes[key])
			.map(lowerCase),
		...Object.keys(current.dependencies)
			.filter((id) => current.dependencies[id] !== previous.dependencies[id])
			.map((id) => labelOf(id) ?? UNLABELLED),
	]);
}

/** How `node` names one of its dependencies, when it has a name for it. */
export const dependencyLabel = (node: GenerationNode) => (id: string) =>
	node.dependsOn.find((dep) => dep.id === id)?.label;

/** Everything about `node` that no longer matches the result it produced. */
function staleChanges(node: GenerationNode, results: NodeResults): string[] {
	const previous = results.getElementSnapshot(node.id).resultInputs;
	if (!previous) return [];
	return uniq([
		...changedInputs(
			nodeInputs(node, results),
			previous,
			dependencyLabel(node),
		),
		...node.dependsOn
			.filter((dep) => needsGeneration(dep, results))
			.map((dep) => dep.label ?? UNLABELLED),
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
	const changes = staleChanges(node, results);
	const named = changes.slice(0, MAX_NAMED);
	const rest = changes.length - named.length;
	if (rest > 0) named.push(`${rest} more`);
	const what = named.length > 0 ? list.format(named) : "its inputs";
	return `${upperFirst(what)} changed — regenerate to update`;
}
