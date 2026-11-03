"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { RotateCcw } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { keepFocus } from "@/components/ui/keep-focus";
import { applyElementVersion } from "@/lib/canvas/editor-ops";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import { resettableEdits } from "@/lib/generation/stale-reason";
import { useElementGeneration } from "./element-generation-context";

function resetTooltip(staleReason: string | null, resettable: boolean) {
	if (resettable) return "Put the prompt and settings back to match the result";
	if (!staleReason) return "No edits to reset";
	return "Only prompt and setting edits can be reset — regenerate to update";
}

export function ResetEditsButton() {
	const editor = useSlateStatic();
	const queue = useGenerationQueue();
	const { element, node, staleReason } = useElementGeneration();
	const resettable = useQueueSelector((q) => resettableEdits(node, q));

	const reset = useCallback(() => {
		const { resultInputs } = queue.getElementSnapshot(node.id);
		if (!resultInputs) return;
		applyElementVersion(editor, element.id, {
			elementType: element.type,
			inputs: resultInputs,
		});
	}, [queue, editor, node.id, element.id, element.type]);

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className="shrink-0"
			unavailable={!resettable}
			onMouseDown={keepFocus}
			onClick={reset}
			aria-label="Reset edits"
			tooltip={resetTooltip(staleReason, resettable)}
		>
			<RotateCcw aria-hidden="true" />
			Reset edits
		</Button>
	);
}
