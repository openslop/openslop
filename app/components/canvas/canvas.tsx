"use client";

import { useMemo } from "react";
import {
	Editable,
	useSlateStatic,
	type RenderPlaceholderProps,
} from "slate-react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop } from "./dnd/use-drag-and-drop";
import { DragTransferContext } from "./dnd/drag-transfer-context";
import { findBlockById } from "@/lib/canvas/editor-ops";
import { SortableScene } from "./dnd/sortable-scene";
import { SortableContent } from "./dnd/sortable-content";
import { DragOverlayPreview } from "./dnd/drag-overlay";
import {
	CharacterMentionMenu,
	optionId,
} from "./elements/character-mention-menu";
import { renderCanvasElement } from "./render-canvas-element";
import { useCharacterMention } from "./hooks/use-character-mention";

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
	const { mention, options, active, listboxId, select, dismiss, onKeyDown } =
		useCharacterMention();

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
						renderPlaceholder={renderPlaceholder}
						renderElement={renderElement}
						onKeyDown={onKeyDown}
						aria-controls={mention && listboxId}
						aria-activedescendant={mention && optionId(listboxId, active)}
						className="font-body text-body leading-relaxed focus-ring"
					/>
				</SortableContext>
				{mention && (
					<CharacterMentionMenu
						mention={mention}
						options={options}
						active={active}
						listboxId={listboxId}
						onSelect={select}
						onDismiss={dismiss}
					/>
				)}
				<DragOverlay>
					{activeBlock && <DragOverlayPreview block={activeBlock} />}
				</DragOverlay>
			</DndContext>
		</DragTransferContext>
	);
}
