import { useCallback, useMemo } from "react";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import {
	forElement,
	isNodeStale,
	needsGeneration,
} from "@/lib/generation/graph";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import type { CanvasContentElement } from "@/lib/canvas/types";

export type GenerateScope = {
	/** Nothing in scope carries a prompt, so there is nothing to generate. */
	empty: boolean;
	/** Something in scope is queued or running.  */
	active: boolean;
	/** Elements with no result, or whose result no longer matches its inputs. */
	pending: number;
	/** Pending elements that already have a result, so a run redoes them. */
	stale: number;
	/** Queues what is missing or out of date. */
	run: () => void;
	/** Tooltip text: what a click would do. */
	description: string;
};

export type GenerateSubject = "project" | "scene";

export type GenerateCounts = Pick<
	GenerateScope,
	"empty" | "active" | "pending" | "stale"
>;

const noun = (count: number) => (count === 1 ? "element" : "elements");

/** Covers every reason there is no work: no elements, none with a prompt, or a
 * script still being written. */
export const NOTHING_TO_GENERATE = "Nothing to generate right now";

/** Button-sized version of {@link describe}. */
export const countPhrase = ({ pending, stale }: GenerateCounts): string =>
	`${stale === pending ? "Regenerate" : "Generate"} ${pending} ${noun(pending)}`;

function describe(
	{ empty, active, pending, stale }: GenerateCounts,
	subject: GenerateSubject,
): string {
	if (empty) return NOTHING_TO_GENERATE;
	if (active) return `Generating this ${subject}…`;
	if (pending === 0) return `Everything in this ${subject} is generated`;

	const fresh = pending - stale;
	if (stale === 0) return `Generate ${fresh} ${noun(fresh)} in this ${subject}`;
	if (fresh === 0)
		return `Regenerate ${stale} stale ${noun(stale)} in this ${subject}`;
	return `Generate ${fresh} ${noun(fresh)} and regenerate ${stale} stale in this ${subject}`;
}

/**
 * The generate control for any slice of the document. `subject` names that
 * slice, so what a control says and what it queues are decided in one place.
 */
export function useGenerateScope(
	elements: CanvasContentElement[],
	subject: GenerateSubject,
): GenerateScope {
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();

	const nodes = useMemo(
		() =>
			elements
				.map((element) => buildNode(forElement(element)))
				.filter((node) => node.inputs.prompt),
		[elements, buildNode],
	);

	const active = useQueueSelector((q) =>
		nodes.some((node) =>
			isGenerationActive(q.getElementSnapshot(node.id).status),
		),
	);
	const pending = useQueueSelector(
		(q) => nodes.filter((node) => needsGeneration(node, q)).length,
	);
	// Always a subset of `pending`, so `fresh` below cannot go negative.
	const stale = useQueueSelector(
		(q) => nodes.filter((node) => isNodeStale(node, q)).length,
	);

	const run = useCallback(() => {
		queue.enqueueGraph(nodes.filter((node) => needsGeneration(node, queue)));
	}, [queue, nodes]);

	const counts = { empty: nodes.length === 0, active, pending, stale };

	return { ...counts, run, description: describe(counts, subject) };
}
