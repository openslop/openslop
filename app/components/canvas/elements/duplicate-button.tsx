import { useSlateStatic } from "slate-react";
import { DuplicateButton as DuplicateIconButton } from "@/components/ui/duplicate-button";
import { duplicateElement } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";

export function DuplicateButton({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();

	return (
		<DuplicateIconButton
			ariaLabel="Duplicate element"
			size="header"
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => duplicateElement(editor, element.id)}
		/>
	);
}
