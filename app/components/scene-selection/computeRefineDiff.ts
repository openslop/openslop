import type { RefineOp } from "@/lib/script/refine/types";
import type { RefineChanges } from "./RefineChangesContext";

/**
 * Build the per-node diff for a refine preview:
 * - ids in `afterIds` but not `beforeIds` were **added**,
 * - `set`-op targets that still exist were **modified**,
 * - `remove`-op targets are **removed** (these nodes are kept in the document
 *   during the preview so the deletion can be reviewed, so they still appear in
 *   `afterIds`; the remove pass marks them last and wins over add/modify).
 */
export function computeRefineDiff(
	beforeIds: ReadonlySet<string>,
	afterIds: readonly string[],
	ops: readonly RefineOp[],
): RefineChanges {
	const modifiedIds = new Set(
		ops.filter((op) => op.op === "set").map((op) => op.id),
	);

	const diff: RefineChanges = {};
	for (const id of afterIds) {
		if (!beforeIds.has(id)) diff[id] = "added";
		else if (modifiedIds.has(id)) diff[id] = "modified";
	}
	for (const op of ops) {
		if (op.op === "remove") diff[op.id] = "removed";
	}
	return diff;
}
