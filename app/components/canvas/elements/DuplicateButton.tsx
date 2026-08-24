import { useSlateStatic } from "slate-react";
import { Copy } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { duplicateElement } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { HeaderIconButton } from "./HeaderIconButton";

export function DuplicateButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const editor = useSlateStatic();

	return (
		<SimpleTooltip label="Duplicate">
			<HeaderIconButton
				ariaLabel="Duplicate element"
				onClick={() => duplicateElement(editor, element)}
			>
				<Copy size={14} />
			</HeaderIconButton>
		</SimpleTooltip>
	);
}
