import { useSlateStatic } from "slate-react";
import { DeleteButton as DeleteIconButton } from "@/components/ui/delete-button";
import { removeBlock } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";

export function DeleteButton({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();

	return (
		<DeleteIconButton
			ariaLabel="Delete element"
			size="header"
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => removeBlock(editor, element.id)}
		/>
	);
}
