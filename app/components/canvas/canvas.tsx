"use client";

import { useCallback, useMemo } from "react";
import { Editable, RenderElementProps, useSlateStatic } from "slate-react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop } from "./dnd/use-drag-and-drop";
import { DragTransferContext } from "./dnd/drag-transfer-context";
import { findBlockById } from "@/lib/canvas/editor-ops";
import { isAssetElement } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import { SortableScene } from "./dnd/sortable-scene";
import { SortableContent } from "./dnd/sortable-content";
import { DragOverlayPreview } from "./dnd/drag-overlay";

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

	const renderElement = useCallback((props: RenderElementProps) => {
		const { element } = props;
		if (isAssetElement(element))
			return (
				<div {...props.attributes} hidden>
					{props.children}
				</div>
			);
		if (isScene(element))
			return (
				<SortableScene attributes={props.attributes} scene={element}>
					{props.children}
				</SortableScene>
			);
		return <SortableContent {...props} element={element} />;
	}, []);

	const activeBlock = useMemo(
		() =>
			activeId ? (findBlockById(editor, String(activeId))?.[0] ?? null) : null,
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
				<SortableContext
					items={sceneItems}
					strategy={verticalListSortingStrategy}
				>
					<Editable
						placeholder="Start typing your story…"
						renderElement={renderElement}
						className="font-body text-body leading-relaxed focus-ring"
					/>
				</SortableContext>
				<DragOverlay>
					{activeBlock && <DragOverlayPreview block={activeBlock} />}
				</DragOverlay>
			</DndContext>
		</DragTransferContext>
	);
}
