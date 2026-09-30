import type { Editor } from "slate";
import { shallow } from "zustand/shallow";
import {
	isSameGraph,
	isSourceNode,
	type BuildContext,
	type Edge,
	type GenerationNode,
	type NodeSpec,
} from "./graph";
import { resolver } from "./resolveGraph";

type Revision = {
	document: Editor["children"];
	context: () => BuildContext;
	resolve: (spec: NodeSpec) => GenerationNode;
};

/** Elements may read one source differently, as two narrations do a voice through their own models. */
const keyOf = (node: GenerationNode) =>
	isSourceNode(node) ? `${node.id}\n${node.identity}` : node.id;

/** The same dependencies, by identity, under the same keys and labels. */
const sameEdges = (a: Record<string, Edge>, b: Record<string, Edge>) =>
	shallow(Object.keys(a), Object.keys(b)) &&
	Object.entries(a).every(([key, edge]) => shallow(edge, b[key]));

/** Edges settle before their node, so ones that changed are told apart without a walk into them. */
const readsTheSame = (a: GenerationNode, b: GenerationNode) =>
	sameEdges(a.dependsOn, b.dependsOn) && isSameGraph(a, b);

/**
 * A document's graph as its readers see it. However many read it, a revision
 * of the document is built once, and a node that reads as it did a revision
 * ago is the same object, so a reader tells a change by identity.
 */
export function liveGraph(editor: Editor) {
	let settled = new Map<string, GenerationNode>();
	let revision: Revision | undefined;

	const open = (context: () => BuildContext): Revision => {
		const previous = settled;
		settled = new Map();

		const settle = (node: GenerationNode) => {
			const key = keyOf(node);
			const before = settled.get(key) ?? previous.get(key);
			const kept = before && readsTheSame(before, node) ? before : node;
			settled.set(key, kept);
			return kept;
		};

		return {
			document: editor.children,
			context,
			resolve: resolver(context(), settle),
		};
	};

	/** `context` keeps its identity until what it reads of the project changes. */
	return (spec: NodeSpec, context: () => BuildContext) => {
		if (revision?.document !== editor.children || revision.context !== context)
			revision = open(context);
		return revision.resolve(spec);
	};
}
