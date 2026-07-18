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
import { Descendant, Editor, Element, Path, Transforms } from "slate";
import { isSceneElement } from "@/lib/canvas/scenes";
import type { DragTransfer } from "./DragTransferContext";

/**
 * Resolves the cross-scene transfer a drag is currently proposing, or `null`
 * when there is none. Every caller assigns the result unconditionally: bailing
 * out early would leave the previous target's insert gap wedged open once the
 * pointer moves off it.
 */
export function resolveDragTransfer(
	editor: Editor,
	event: DragOverEvent,
): DragTransfer {
	const { active, over } = event;
	if (!over?.id || active.id === over.id) return null;
	if (active.data.current?.type === "scene") return null;

	const fromSceneId = active.data.current?.sceneId;
	const toSceneId = over.data.current?.sceneId;
	if (!fromSceneId || !toSceneId || fromSceneId === toSceneId) return null;

	const [overEntry] = Editor.nodes(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.id === over.id,
	});
	if (!overEntry) return null;

	const [overNode, overPath] = overEntry;
	return {
		itemId: active.id as string,
		fromSceneId,
		toSceneId,
		atIndex: isSceneElement(overNode)
			? overNode.children.length
			: overPath[overPath.length - 1],
	};
}

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
		(event: DragOverEvent) =>
			setDragTransfer(resolveDragTransfer(editor, event)),
		[editor],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveId(null);
			setDragTransfer(null);

			if (!over?.id || active.id === over.id) return;

			const [activeEntry] = Editor.nodes(editor, {
				at: [],
				match: (n) => Element.isElement(n) && n.id === active.id,
			});
			const [overEntry] = Editor.nodes(editor, {
				at: [],
				match: (n) => Element.isElement(n) && n.id === over.id,
			});
			if (!activeEntry || !overEntry) return;

			const [activeNode, activePath] = activeEntry;
			const [overNode, overPath] = overEntry;

			if (isSceneElement(activeNode)) {
				const targetPath = isSceneElement(overNode)
					? overPath
					: Path.parent(overPath);
				if (!Path.equals(activePath, targetPath)) {
					Transforms.moveNodes(editor, { at: activePath, to: targetPath });
				}
				return;
			}

			if (isSceneElement(overNode)) {
				Transforms.moveNodes(editor, {
					at: activePath,
					to: [...overPath, overNode.children.length],
				});
				return;
			}

			Transforms.moveNodes(editor, { at: activePath, to: overPath });
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
