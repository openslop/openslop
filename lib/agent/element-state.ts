import type { ElementSnapshot } from "@/lib/generation/snapshots";

export type ElementState = {
	id: string;
	state:
		| "ungenerated"
		| "queued"
		| "generating"
		| "generated"
		| "stale"
		| "failed"
		| "pinned";
	/** The stale reason or the failure error, in the words the canvas shows. */
	detail?: string;
};

export function elementState(
	id: string,
	{ status, error, result, pinned }: ElementSnapshot,
	staleReason: string | null,
): ElementState {
	if (status !== "idle") return { id, state: status };
	if (error) return { id, state: "failed", detail: error };
	if (!result) return { id, state: "ungenerated" };
	if (pinned) return { id, state: "pinned" };
	if (staleReason) return { id, state: "stale", detail: staleReason };
	return { id, state: "generated" };
}
