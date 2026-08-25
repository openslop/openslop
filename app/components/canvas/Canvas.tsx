"use client";

import { useCallback, useMemo, KeyboardEvent } from "react";
import { Editable, RenderElementProps, useSlateStatic } from "slate-react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop } from "./dnd/useDragAndDrop";
import { DragTransferContext } from "./dnd/DragTransferContext";
import { findElementById } from "@/lib/canvas/editorOps";
import { isSceneElement } from "@/lib/canvas/scenes";
import { SortableScene } from "./dnd/SortableScene";
import { SortableContent } from "./dnd/SortableContent";
import { DragOverlayContent } from "./dnd/DragOverlay";
import { AssetsSection } from "./elements/AssetsSection";

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

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (event.shiftKey && event.key === "Enter") {
				event.preventDefault();
				editor.insertText("\n");
			}
		},
		[editor],
	);

	const renderElement = useCallback((props: RenderElementProps) => {
		const { element } = props;
		if (isSceneElement(element)) {
			return <SortableScene {...props} element={element} />;
		}
		return <SortableContent {...props} element={element} />;
	}, []);

	const activeElement = useMemo(
		() =>
			activeId
				? (findElementById(editor, String(activeId))?.[0] ?? null)
				: null,
		[editor, activeId],
	);

	return (
		<DragTransferContext value={dragTransferStore}>
			<DndContext
				sensors={sensors}
				collisionDetection={pointerWithin}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
			>
				<AssetsSection />
				<SortableContext
					items={sceneItems}
					strategy={verticalListSortingStrategy}
				>
					<Editable
						placeholder="Start typing your story…"
						renderElement={renderElement}
						onKeyDown={handleKeyDown}
						className="font-body text-body leading-relaxed focus-ring"
					/>
				</SortableContext>
				<DragOverlay>
					{activeElement && <DragOverlayContent element={activeElement} />}
				</DragOverlay>
			</DndContext>
		</DragTransferContext>
	);
}
