import { useSlateStatic } from "slate-react";
import { DeleteButton as DeleteIconButton } from "@/components/ui/delete-button";
import { removeElement } from "@/app/components/canvas/utils/nodeOps";
import type { SceneElement } from "@/lib/canvas/types";

export function SceneDeleteButton({ scene }: { scene: SceneElement }) {
	const editor = useSlateStatic();

	return (
		<DeleteIconButton
			ariaLabel="Delete scene"
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => removeElement(editor, scene)}
		/>
	);
}
