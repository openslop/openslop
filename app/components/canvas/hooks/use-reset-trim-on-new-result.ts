import { useEffect } from "react";
import { HistoryEditor } from "slate-history";
import { resetTrim } from "@/lib/canvas/editor-ops";
import type { CanvasEditor } from "@/lib/canvas/types";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";

/** Kept out of undo, which would put the old trim back on the new result. */
export function useResetTrimOnNewResult(editor: CanvasEditor): void {
	const queue = useGenerationQueue();
	useEffect(
		() =>
			queue.onResultReplaced((id) =>
				HistoryEditor.withoutSaving(editor, () => resetTrim(editor, id)),
			),
		[queue, editor],
	);
}
