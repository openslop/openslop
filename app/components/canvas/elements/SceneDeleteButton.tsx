import { useSlateStatic } from "slate-react";
import { DeleteButton as DeleteIconButton } from "@/components/ui/delete-button";
import { removeBlock } from "@/app/components/canvas/utils/blockOps";
import type { Scene } from "@/lib/canvas/types";

export function SceneDeleteButton({ scene }: { scene: Scene }) {
	const editor = useSlateStatic();

	return (
		<DeleteIconButton
			ariaLabel="Delete scene"
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => removeBlock(editor, scene)}
		/>
	);
}
