import lowerCase from "lodash/lowerCase";
import upperFirst from "lodash/upperFirst";
import {
	isNodeStale,
	needsGeneration,
	nodeInputs,
	parseDerivedId,
	type GenerationNode,
	type NodeId,
	type NodeResults,
} from "./graph";

/** How many changes are named before the rest are counted off. */
const MAX_NAMED = 3;

const SOURCE_LABELS: Record<NodeId, string> = {
	"project:artStyle": "the art style",
	"project:referenceImages": "the reference images",
	"project:aspectRatio": "the aspect ratio",
};

const VOICE_PREFIX = "project:voice:";

const DERIVED_LABELS: Record<string, (key: string) => string> = {
	avatar: (name) => `${name}'s avatar`,
	still: () => "the still frame",
};

/**
 * A dependency reads as what the user recognizes, not as its node id. Derived
 * and project-source ids are a closed set; anything else is another element,
 * whose own id would mean nothing on a badge.
 */
function dependencyLabel(id: NodeId): string {
	const derived = parseDerivedId(id);
	if (derived) {
		const label = DERIVED_LABELS[derived.kind];
		if (label) return label(derived.key);
	}
	if (id.startsWith(VOICE_PREFIX)) {
		const name = id.slice(VOICE_PREFIX.length);
		return name === "narrator" ? "the narrator's voice" : `${name}'s voice`;
	}
	return SOURCE_LABELS[id] ?? "an upstream element";
}

/** Everything about `node` that no longer matches the result it produced. */
function changedInputs(node: GenerationNode, results: NodeResults): string[] {
	const previous = results.getElementSnapshot(node.id).resultInputs;
	if (!previous) return [];
	const current = nodeInputs(node, results);

	const changed: string[] = [];
	if (current.prompt !== previous.prompt) changed.push("the prompt");
	const keys = new Set([
		...Object.keys(current.attributes),
		...Object.keys(previous.attributes),
	]);
	for (const key of keys) {
		if (current.attributes[key] !== previous.attributes[key]) {
			changed.push(lowerCase(key));
		}
	}
	for (const dep of node.dependsOn) {
		if (
			current.dependencies[dep.id] !== previous.dependencies[dep.id] ||
			needsGeneration(dep, results)
		) {
			changed.push(dependencyLabel(dep.id));
		}
	}
	return changed;
}

function joinChanges(changes: string[]): string {
	const named = changes.slice(0, MAX_NAMED);
	const rest = changes.length - named.length;
	if (rest > 0) return `${named.join(", ")} and ${rest} more`;
	if (named.length === 1) return named[0] ?? "";
	return `${named.slice(0, -1).join(", ")} and ${named.at(-1)}`;
}

/**
 * Why the badge is lit, in the user's terms. Staleness has three independent
 * causes and the dependency one has no visible locus, so naming it is the whole
 * point of the tooltip. `null` means the element is not stale.
 */
export function staleReason(
	node: GenerationNode,
	results: NodeResults,
): string | null {
	if (!isNodeStale(node, results)) return null;
	const changes = [...new Set(changedInputs(node, results))];
	const what = changes.length > 0 ? joinChanges(changes) : "its inputs";
	return `${upperFirst(what)} changed — regenerate to update`;
}
