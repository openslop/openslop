import { useSlateStatic } from "slate-react";
import { DuplicateButton as DuplicateIconButton } from "@/components/ui/duplicate-button";
import { keepFocus } from "@/components/ui/keep-focus";
import { duplicateElement } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";

export function DuplicateButton({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	const queue = useGenerationQueue();

	return (
		<DuplicateIconButton
			ariaLabel="Duplicate element"
			size="header"
			onMouseDown={keepFocus}
			onClick={() =>
				queue.duplicate(element.id, duplicateElement(editor, element.id))
			}
		/>
	);
}
