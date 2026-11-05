"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { Undo } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { keepFocus } from "@/components/ui/keep-focus";
import { applyElementVersion } from "@/lib/canvas/editor-ops";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import { hasEditsSinceResult } from "@/lib/generation/stale-reason";
import { useElementGeneration } from "./element-generation-context";

export function ResetEditsButton() {
	const editor = useSlateStatic();
	const queue = useGenerationQueue();
	const { element, node } = useElementGeneration();
	const edited = useQueueSelector((q) => hasEditsSinceResult(node, q));

	const reset = useCallback(() => {
		const { resultInputs } = queue.getElementSnapshot(node.id);
		if (!resultInputs) return;
		applyElementVersion(editor, element.id, {
			elementType: element.type,
			inputs: resultInputs,
		});
	}, [queue, editor, node.id, element.id, element.type]);

	if (!edited) return null;
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			tooltip="Reset any edits made to this element"
			className="shrink-0"
			onMouseDown={keepFocus}
			onClick={reset}
		>
			<Undo aria-hidden="true" />
			<span className="hidden sm:inline">Reset</span>
		</Button>
	);
}
