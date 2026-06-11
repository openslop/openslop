"use client";

import { useCallback, useMemo, KeyboardEvent } from "react";
import { Descendant, Editor, Element } from "slate";
import { Slate, Editable, RenderElementProps } from "slate-react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDragAndDrop } from "./dnd/useDragAndDrop";
import { DragTransferContext } from "./dnd/DragTransferContext";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { SortableScene } from "./dnd/SortableScene";
import { SortableContent } from "./dnd/SortableContent";
import { DragOverlayContent } from "./dnd/DragOverlay";
import Sidebar from "./panel/Sidebar";
import { renderCanvasElement } from "./elements/ElementContainer";
import { AssetsSection } from "./elements/AssetsSection";
import { ViewModeProvider } from "./ViewModeContext";

export default function Canvas({
	editor,
	value,
	setValue,
}: {
	editor: Editor;
	value: Descendant[];
	setValue: (v: Descendant[]) => void;
}) {
	const {
		activeId,
		sceneItems,
		dragTransfer,
		sensors,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	} = useDragAndDrop(editor, value);

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
			return (
				<SortableScene
					{...props}
					element={element}
					renderElement={renderCanvasElement}
				/>
			);
		}
		return (
			<SortableContent
				{...props}
				element={element as CanvasContentElement}
				renderElement={renderCanvasElement}
			/>
		);
	}, []);

	const activeElement = useMemo(() => {
		if (!activeId) {
			return null;
		}
		const [entry] = Editor.nodes(editor, {
			at: [],
			match: (n) => Element.isElement(n) && n.id === activeId,
		});
		return entry?.[0] as Descendant;
	}, [editor, activeId]);

	return (
		<ViewModeProvider sceneIds={sceneItems}>
			<DragTransferContext.Provider value={dragTransfer}>
				<DndContext
					sensors={sensors}
					collisionDetection={pointerWithin}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
					onDragCancel={handleDragCancel}
				>
					<Sidebar />

					<Slate editor={editor} initialValue={value} onChange={setValue}>
						<AssetsSection />
						<SortableContext
							items={sceneItems}
							strategy={verticalListSortingStrategy}
						>
							<Editable
								placeholder="Start typing your story…"
								renderElement={renderElement}
								onKeyDown={handleKeyDown}
								className="font-body text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
							/>
						</SortableContext>
						<DragOverlay>
							{activeElement && <DragOverlayContent element={activeElement} />}
						</DragOverlay>
					</Slate>
				</DndContext>
			</DragTransferContext.Provider>
		</ViewModeProvider>
	);
}
