"use client";

import { cn } from "@/lib/utils";
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

export function ResetButton({
	tooltip,
	onClick,
	className,
}: {
	tooltip: string;
	onClick: () => void;
	className?: string;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			tooltip={tooltip}
			className={cn("shrink-0", className)}
			onMouseDown={keepFocus}
			onClick={onClick}
		>
			<Undo />
			<span className="@max-sm/element:hidden">Reset</span>
		</Button>
	);
}

export function ResetEditsButton() {
	const editor = useSlateStatic();
	const queue = useGenerationQueue();
	const { element, node } = useElementGeneration();
	const edited = useQueueSelector((q) => hasEditsSinceResult(node, q));

	const reset = () => {
		const { resultInputs } = queue.getElementSnapshot(node.id);
		if (!resultInputs) return;
		applyElementVersion(editor, element.id, { inputs: resultInputs });
	};

	if (!edited) return null;
	return (
		<ResetButton
			tooltip="Reset any edits made to this element"
			onClick={reset}
		/>
	);
}
