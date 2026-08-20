import { useCallback, useMemo, useState } from "react";
import {
	DragEndEvent,
	DragOverEvent,
	DragStartEvent,
	UniqueIdentifier,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import { moveDraggedElement } from "@/lib/canvas/dragOps";
import { findElementById } from "@/lib/canvas/editorOps";
import { isSceneElement } from "@/lib/canvas/scenes";
import { createDragTransferStore } from "./DragTransferContext";

const SCENE_ID_SEPARATOR = ",";

// Selecting the ids rather than the document keeps the canvas off the
// per-keystroke render path: it re-renders only when the scene order changes.
const selectSceneIdKey = (editor: Editor) =>
	editor.children
		.filter(isSceneElement)
		.map((s) => s.id)
		.join(SCENE_ID_SEPARATOR);

export function useDragAndDrop(editor: Editor) {
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [dragTransferStore] = useState(createDragTransferStore);

	const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

	const sceneIdKey = useSlateSelector(selectSceneIdKey);
	const sceneItems = useMemo<string[]>(
		() => sceneIdKey.split(SCENE_ID_SEPARATOR).filter(Boolean),
		[sceneIdKey],
	);

	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id);
	}, []);

	const handleDragOver = useCallback(
		(event: DragOverEvent) => {
			const { active, over } = event;
			if (!over?.id || active.id === over.id) return;
			if (active.data.current?.type === "scene") return;

			const fromSceneId = active.data.current?.sceneId;
			const toSceneId = over.data.current?.sceneId;

			if (!fromSceneId || !toSceneId) return;

			if (fromSceneId === toSceneId) {
				dragTransferStore.set(null);
				return;
			}

			const overEntry = findElementById(editor, String(over.id));
			if (!overEntry) return;

			const [overNode, overPath] = overEntry;
			const atIndex = isSceneElement(overNode)
				? overNode.children.length
				: overPath[overPath.length - 1];
			dragTransferStore.set({
				itemId: active.id as string,
				fromSceneId,
				toSceneId,
				atIndex,
			});
		},
		[dragTransferStore, editor],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveId(null);
			dragTransferStore.set(null);

			if (!over?.id || active.id === over.id) return;

			moveDraggedElement(editor, String(active.id), String(over.id));
		},
		[dragTransferStore, editor],
	);

	const handleDragCancel = useCallback(() => {
		setActiveId(null);
		dragTransferStore.set(null);
	}, [dragTransferStore]);

	return {
		activeId,
		sceneItems,
		dragTransferStore,
		sensors,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	};
}
