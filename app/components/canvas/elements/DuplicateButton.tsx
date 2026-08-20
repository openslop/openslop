import { useSlateStatic } from "slate-react";
import { DuplicateButton as DuplicateIconButton } from "@/components/ui/duplicate-button";
import { duplicateElement } from "@/app/components/canvas/utils/nodeOps";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import type { CanvasContentElement } from "@/lib/canvas/types";

export function DuplicateButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const editor = useSlateStatic();
	const queue = useGenerationQueue();

	return (
		<DuplicateIconButton
			ariaLabel="Duplicate element"
			onMouseDown={(e) => {
				e.preventDefault();
				queue.duplicate(element.id, duplicateElement(editor, element));
			}}
		/>
	);
}
