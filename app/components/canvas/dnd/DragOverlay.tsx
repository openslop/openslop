import { GripVertical, Plus } from "@/components/ui/icon";
import { useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { renderCanvasElement } from "../elements/ElementContainer";
import styles from "../styles/sortable.module.css";

export function DragOverlayContent({ element }: { element: Descendant }) {
	const editor = useMemo(() => withReact(createEditor()), []);
	const value = useMemo<Descendant[]>(
		() => [structuredClone(element)],
		[element],
	);

	return (
		<div className={styles.dragOverlay}>
			<Slate editor={editor} initialValue={value}>
				<div className={styles.actions}>
					<button
						aria-label="Add element"
						className="inline-flex items-center rounded-md p-0.5 text-foreground"
					>
						<Plus size={18} />
					</button>
					<button
						aria-label="Drag handle"
						className="inline-flex items-center rounded-md p-0.5 text-foreground"
					>
						<GripVertical size={22} />
					</button>
				</div>
				<Editable
					readOnly={true}
					renderElement={renderCanvasElement}
					className="text-xl leading-relaxed text-center break-all"
				/>
			</Slate>
		</div>
	);
}
