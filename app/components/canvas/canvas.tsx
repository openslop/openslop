"use client";

import { useMemo } from "react";
import { useSlateStatic, type RenderPlaceholderProps } from "slate-react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop } from "./dnd/use-drag-and-drop";
import { canvasCollisionDetection } from "./dnd/collision-detection";
import { DragTransferContext } from "./dnd/drag-transfer-context";
import { findBlockById } from "@/lib/canvas/editor-ops";
import { SortableScene } from "./dnd/sortable-scene";
import { SortableContent } from "./dnd/sortable-content";
import { DragOverlayPreview } from "./dnd/drag-overlay";
import { MentionEditable } from "./elements/mention-editable";
import {
	CANVAS_TEXT_CLASS,
	renderCanvasElement,
} from "./render-canvas-element";

const renderElement = renderCanvasElement({
	Scene: SortableScene,
	Content: SortableContent,
});

// Slate pins its placeholder to `top: 0`, above the input box's padding.
const renderPlaceholder = ({
	attributes,
	children,
}: RenderPlaceholderProps) => (
	<span
		{...attributes}
		style={{ ...attributes.style, top: undefined, opacity: undefined }}
		className="top-2.5 text-muted-foreground"
	>
		{children}
	</span>
);

export default function Canvas() {
	const editor = useSlateStatic();
	const {
		activeId,
		sceneItems,
		dragTransferStore,
		sensors,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	} = useDragAndDrop(editor);

	const activeBlock = useMemo(
		() =>
			activeId ? (findBlockById(editor, String(activeId))?.[0] ?? null) : null,
		[editor, activeId],
	);

	return (
		<DragTransferContext value={dragTransferStore}>
			<DndContext
				sensors={sensors}
				collisionDetection={canvasCollisionDetection}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
			>
				<SortableContext
					items={sceneItems}
					strategy={verticalListSortingStrategy}
				>
					<MentionEditable
						placeholder="Start typing your story…"
						renderPlaceholder={renderPlaceholder}
						renderElement={renderElement}
						className={`${CANVAS_TEXT_CLASS} focus-ring`}
					/>
				</SortableContext>
				<DragOverlay>
					{activeBlock && <DragOverlayPreview block={activeBlock} />}
				</DragOverlay>
			</DndContext>
		</DragTransferContext>
	);
}
