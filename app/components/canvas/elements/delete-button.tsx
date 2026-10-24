import { useSlateStatic } from "slate-react";
import { DeleteButton as DeleteIconButton } from "@/components/ui/delete-button";
import { keepFocus } from "@/components/ui/keep-focus";
import { removeBlock } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";

export function DeleteButton({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();

	return (
		<DeleteIconButton
			ariaLabel="Delete element"
			size="header"
			onMouseDown={keepFocus}
			onClick={() => removeBlock(editor, element.id)}
		/>
	);
}
