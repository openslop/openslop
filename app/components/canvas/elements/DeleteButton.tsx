import { useSlateStatic } from "slate-react";
import { DeleteButton as DeleteIconButton } from "@/components/ui/delete-button";
import { removeElement } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasElement } from "@/lib/canvas/types";

export function DeleteButton({ element }: { element: CanvasElement }) {
	const editor = useSlateStatic();

	return (
		<DeleteIconButton
			ariaLabel="Delete element"
			onMouseDown={(e) => {
				e.preventDefault();
				removeElement(editor, element);
			}}
		/>
	);
}
