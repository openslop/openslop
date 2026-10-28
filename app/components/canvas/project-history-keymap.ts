import { useEffect } from "react";
import isHotkey from "is-hotkey";
import type { CanvasEditor } from "@/lib/canvas/types";

const isUndoHotkey = isHotkey("mod+z");
const isRedoHotkey = isHotkey(["mod+shift+z", "mod+y"]);
const TEXT_INPUT_TYPES = new Set([
	"text",
	"search",
	"url",
	"tel",
	"email",
	"password",
	"number",
]);

const isTextEntryTarget = (target: EventTarget | null): boolean =>
	target instanceof HTMLTextAreaElement ||
	(target instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(target.type)) ||
	(target instanceof HTMLElement && target.isContentEditable);

function handleProjectHistoryKeyDown(
	event: KeyboardEvent,
	editor: CanvasEditor,
): void {
	if (event.defaultPrevented || event.altKey || event.isComposing) return;

	const isUndo = isUndoHotkey(event);
	if (!isUndo && !isRedoHotkey(event)) return;
	if (isTextEntryTarget(event.target)) return;

	event.preventDefault();
	if (isUndo) editor.undo();
	else editor.redo();
}

export function useProjectHistoryHotkeys(editor: CanvasEditor): void {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) =>
			handleProjectHistoryKeyDown(event, editor);

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [editor]);
}
