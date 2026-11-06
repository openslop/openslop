import { useEffect } from "react";
import type { Editor } from "slate";
import { resetTrim } from "@/lib/canvas/editor-ops";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";

/** A trim is picked for one result, so a new or restored one plays in full. */
export function useResetTrimOnNewResult(editor: Editor): void {
	const queue = useGenerationQueue();
	useEffect(
		() => queue.onResultReplaced((id) => resetTrim(editor, id)),
		[queue, editor],
	);
}
