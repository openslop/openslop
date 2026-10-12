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
import { isAssetElement, isCharacterRef } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import { SortableScene } from "./dnd/sortable-scene";
import { SortableContent } from "./dnd/sortable-content";
import { DragOverlayPreview } from "./dnd/drag-overlay";
import {
	CharacterMentionMenu,
	optionId,
} from "./elements/character-mention-menu";
import { CharacterRef } from "./elements/character-ref";
import { useCharacterMention } from "./hooks/use-character-mention";
import { ELEMENT_CONFIGS } from "./elements/element-configs";
import { ElementErrorBoundary } from "./elements/element-error-boundary";

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

	const renderElement = useCallback((props: RenderElementProps) => {
		const { element } = props;
		if (isCharacterRef(element))
			return <CharacterRef {...props} element={element} />;
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
		return (
			<ElementErrorBoundary
				label={ELEMENT_CONFIGS[element.type].label}
				attributes={props.attributes}
				leaves={props.children}
			>
				<SortableContent {...props} element={element} />
			</ElementErrorBoundary>
		);
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
