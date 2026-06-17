import { Transforms } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import { DeleteButton as DeleteIconButton } from "@/components/ui/delete-button";
import type { CanvasElement } from "@/lib/canvas/types";

export function DeleteButton({ element }: { element: CanvasElement }) {
	const editor = useSlateStatic();

	return (
		<DeleteIconButton
			ariaLabel="Delete element"
			onMouseDown={(e) => {
				e.preventDefault();
				const path = ReactEditor.findPath(editor, element);
				Transforms.removeNodes(editor, { at: path });
			}}
		/>
	);
}
