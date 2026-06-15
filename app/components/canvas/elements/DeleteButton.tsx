import { Trash2 } from "@/components/ui/icon";
import { Transforms } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import { IconButton } from "@/components/ui/icon-button";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import type { CanvasElement } from "@/lib/canvas/types";

export function DeleteButton({ element }: { element: CanvasElement }) {
	const editor = useSlateStatic();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<IconButton
					ariaLabel="Delete element"
					className="hover:text-destructive"
					onMouseDown={(e) => {
						e.preventDefault();
						const path = ReactEditor.findPath(editor, element);
						Transforms.removeNodes(editor, { at: path });
					}}
				>
					<Trash2 className="h-4 w-4" strokeWidth={1.5} />
				</IconButton>
			</TooltipTrigger>
			<TooltipContent>Delete</TooltipContent>
		</Tooltip>
	);
}
