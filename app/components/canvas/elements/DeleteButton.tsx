import { useSlateStatic } from "slate-react";
import { Trash2 } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { removeElement } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { HeaderIconButton } from "./HeaderIconButton";

export function DeleteButton({ element }: { element: CanvasContentElement }) {
	const editor = useSlateStatic();

	return (
		<SimpleTooltip label="Delete">
			<HeaderIconButton
				ariaLabel="Delete element"
				className="text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
				onClick={() => removeElement(editor, element)}
			>
				<Trash2 size={14} />
			</HeaderIconButton>
		</SimpleTooltip>
	);
}
