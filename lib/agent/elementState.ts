import type { GenerationNode, NodeResults } from "@/lib/generation/graph";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { changedInputs, dependencyLabel } from "@/lib/generation/staleReason";
import {
	currentVersionIndex,
	type ElementVersion,
} from "@/lib/generation/versions";

/** Where an element stands, in one word the model can act on. */
export type ElementStateWord =
	| "ungenerated"
	| "queued"
	| "generating"
	| "generated"
	| "stale"
	| "failed"
	| "pinned";

/** An element's generation state as the model may read it: never a url or an input identity. */
export type ElementState = {
	id: string;
	state: ElementStateWord;
	/** Why it is stale, in the words the canvas badge shows. */
	reason?: string;
	/** How long the generated media runs, for audio and video. */
	durationSec?: number;
	error?: string;
};

/** One take an element has produced, as the model may read it. */
export type ElementVersionSummary = {
	/** Counted from 1, as the history panel numbers them. */
	index: number;
	createdAt: string;
	prompt: string;
	attributes: Record<string, string | number>;
	/** Supplied by the user rather than generated. */
	pinned: boolean;
	durationSec?: number;
	current: boolean;
	/** What differs from the take before it, in the user's terms. */
	changed: string[];
};

/** A still has a length of 0, which is no length at all. */
const mediaLength = (result: ElementSnapshot["result"]) =>
	result?.durationSec || undefined;

const stateOf = (
	{ status, error, result, pinned }: ElementSnapshot,
	whyStale: () => string | null,
): Pick<ElementState, "state" | "reason" | "error"> => {
	if (status !== "idle") return { state: status };
	if (error) return { state: "failed", error };
	if (!result) return { state: "ungenerated" };
	if (pinned) return { state: "pinned" };
	const reason = whyStale();
	return reason ? { state: "stale", reason } : { state: "generated" };
};

/** `whyStale` is only asked once a settled result could have drifted, since it costs a graph build. */
export function elementState(
	id: string,
	snapshot: ElementSnapshot,
	whyStale: () => string | null,
): ElementState {
	return {
		id,
		durationSec: mediaLength(snapshot.result),
		...stateOf(snapshot, whyStale),
	};
}

export function summarizeVersions(
	node: GenerationNode,
	versions: readonly ElementVersion[],
	results: NodeResults,
): ElementVersionSummary[] {
	const current = currentVersionIndex(
		versions,
		results.getElementSnapshot(node.id),
	);
	const labelOf = dependencyLabel(node);
	return versions.map((version, i) => {
		const previous = i > 0 ? versions[i - 1] : undefined;
		return {
			index: i + 1,
			createdAt: version.createdAt,
			prompt: version.inputs.prompt,
			attributes: version.inputs.attributes,
			pinned: version.pinned,
			durationSec: mediaLength(version.result),
			current: i === current,
			changed: previous
				? changedInputs(version.inputs, previous.inputs, labelOf)
				: [],
		};
	});
}
