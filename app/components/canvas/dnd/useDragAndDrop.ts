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
import { Descendant, Editor } from "slate";
import { moveDraggedElement } from "@/lib/canvas/dragOps";
import { findElementById } from "@/lib/canvas/editorOps";
import { isSceneElement } from "@/lib/canvas/scenes";
import type { DragTransfer } from "./DragTransferContext";

export function useDragAndDrop(editor: Editor, value: Descendant[]) {
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [dragTransfer, setDragTransfer] = useState<DragTransfer>(null);

	const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

	const sceneItems = useMemo<string[]>(
		() => value.filter(isSceneElement).map((s) => s.id),
		[value],
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
				setDragTransfer(null);
				return;
			}

			const overEntry = findElementById(editor, String(over.id));
			if (!overEntry) return;

			const [overNode, overPath] = overEntry;
			const atIndex = isSceneElement(overNode)
				? overNode.children.length
				: overPath[overPath.length - 1];
			setDragTransfer({
				itemId: active.id as string,
				fromSceneId,
				toSceneId,
				atIndex,
			});
		},
		[editor],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveId(null);
			setDragTransfer(null);

			if (!over?.id || active.id === over.id) return;

			moveDraggedElement(editor, String(active.id), String(over.id));
		},
		[editor],
	);

	const handleDragCancel = useCallback(() => {
		setActiveId(null);
		setDragTransfer(null);
	}, []);

	return {
		activeId,
		sceneItems,
		dragTransfer,
		sensors,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	};
}
