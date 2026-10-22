import type { Editor } from "slate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeCharacter } from "@/lib/canvas/asset-ops";

export function deleteCharacter(editor: Editor, name: string): void {
	const restore = removeCharacter(editor, name);
	const id = toast(`Deleted ${name}`, {
		action: (
			<Button
				variant="secondary"
				size="sm"
				onClick={() => {
					restore();
					toast.dismiss(id);
				}}
			>
				Undo
			</Button>
		),
	});
}
