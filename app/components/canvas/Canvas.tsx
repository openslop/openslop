"use client";

import {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	KeyboardEvent,
	Ref,
} from "react";
import { Descendant, Editor, Element } from "slate";
import { Slate, Editable, RenderElementProps } from "slate-react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEditorSetup } from "./hooks/useEditorSetup";
import { useScriptSync } from "./hooks/useScriptSync";
import { useMetadataSync } from "./hooks/useMetadataSync";
import { useGenerateAll } from "./hooks/useGenerateAll";
import { useAutosave } from "./hooks/useAutosave";
import { useProjectRehydrate } from "./hooks/useProjectRehydrate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useScriptInitial } from "@/lib/script/ScriptProvider";
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
import { getContentElements } from "@/lib/canvas/scenes";
import { getLayoutKey } from "@/lib/video/layoutKey";
import { useTransitionType } from "@/lib/video/useTransitionType";
import { PreviewCacheProvider } from "./PreviewCacheContext";
import { ViewModeProvider } from "./ViewModeContext";

export interface CanvasHandle {
	generateAll: () => void;
	getEditor: () => import("slate").Editor;
}

export default function Canvas({
	ref,
	onLayoutKeyChange,
}: {
	ref?: Ref<CanvasHandle>;
	onLayoutKeyChange?: (key: string) => void;
}) {
	const { editor, value, setValue } = useEditorSetup();

	const contentElements = useMemo(() => getContentElements(value), [value]);
	const transitionType = useTransitionType();

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

	const { projectId } = useConfig();
	const initialScript = useScriptInitial();
	useProjectRehydrate(editor, initialScript);
	useAutosave(projectId, value);

	useScriptSync(editor);
	useMetadataSync();
	const { generateAll } = useGenerateAll(editor);

	const layoutKey = getLayoutKey(contentElements, transitionType);
	const prevKeyRef = useRef(layoutKey);
	useEffect(() => {
		if (layoutKey !== prevKeyRef.current) {
			prevKeyRef.current = layoutKey;
			onLayoutKeyChange?.(layoutKey);
		}
	}, [layoutKey, onLayoutKeyChange]);

	useImperativeHandle(ref, () => ({ generateAll, getEditor: () => editor }), [
		generateAll,
		editor,
	]);

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
			<PreviewCacheProvider>
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
								{activeElement && (
									<DragOverlayContent element={activeElement} />
								)}
							</DragOverlay>
						</Slate>
					</DndContext>
				</DragTransferContext.Provider>
			</PreviewCacheProvider>
		</ViewModeProvider>
	);
}
