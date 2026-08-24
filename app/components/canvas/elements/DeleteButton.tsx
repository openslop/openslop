import { useSlateStatic } from "slate-react";
import { DeleteButton as DeleteIconButton } from "@/components/ui/delete-button";
import { removeElement } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";

export function DeleteButton({ element }: { element: CanvasContentElement }) {
	const editor = useSlateStatic();

	return (
		<DeleteIconButton
			ariaLabel="Delete element"
			size="header"
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => removeElement(editor, element)}
		/>
	);
}
