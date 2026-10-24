import { Editor, Range, Text, Transforms, type Path } from "slate";
import { createCharacterRef } from "@/lib/canvas/character-refs";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import {
	castsCharacters,
	isCharacterRef,
	isContentElement,
} from "@/lib/canvas/guards";
import { makeNodeId } from "@/lib/canvas/node-utils";
import type { CanvasEditor, ContentElement } from "@/lib/canvas/types";
import { findCharacterRef } from "@/lib/connectors/character-refs";

const LINE_START_MARKER = `\n${ZERO_WIDTH_SPACE}`;

/**
 * A chip right after a soft break leaves nothing editable at the start of its
 * line, so the browser moves the caret to the end of the line above. A caret
 * marker after the break gives the caret somewhere to sit. Returns where the
 * leaf needs a marker inserted or a stale one deleted, if anywhere.
 */
const lineStartMarkerFix = (
	text: string,
	{ first, beforeChip }: { first: boolean; beforeChip: boolean },
): { insert: number } | { remove: number } | undefined => {
	if (beforeChip && text.endsWith("\n")) return { insert: text.length };
	for (
		let at = text.indexOf(ZERO_WIDTH_SPACE, first ? 1 : 0);
		at !== -1;
		at = text.indexOf(ZERO_WIDTH_SPACE, at + 1)
	) {
		const afterBreak = text[at - 1] === "\n";
		const endsBeforeChip = beforeChip && at === text.length - 1;
		if (afterBreak !== endsBeforeChip) return { remove: at };
	}
	return undefined;
};

export const withCharacterRefs = (editor: CanvasEditor): CanvasEditor => {
	const { deleteBackward, isInline, isVoid, normalizeNode } = editor;

	editor.isInline = (element) => isCharacterRef(element) || isInline(element);
	editor.isVoid = (element) => isCharacterRef(element) || isVoid(element);

	const chip = ({ children }: ContentElement, path: Path) => {
		for (const [index, child] of children.entries()) {
			const found = Text.isText(child) && findCharacterRef(child.text);
			if (!found) continue;
			const at = { path: [...path, index], offset: found.start };
			Transforms.delete(editor, {
				at: { anchor: at, focus: { ...at, offset: found.end } },
			});
			Transforms.insertNodes(editor, createCharacterRef(found.name), { at });
			return true;
		}
		return false;
	};

	const unchip = ({ type, children }: ContentElement, path: Path) => {
		for (const [index, child] of children.entries()) {
			if (!isCharacterRef(child)) continue;
			const at = [...path, index];
			Editor.withoutNormalizing(editor, () => {
				Transforms.removeNodes(editor, { at });
				Transforms.insertNodes(
					editor,
					{ id: makeNodeId(), type, text: child.name },
					{ at },
				);
			});
			return true;
		}
		return false;
	};

	const markLineStarts = ({ children }: ContentElement, path: Path) => {
		for (const [index, child] of children.entries()) {
			if (!Text.isText(child)) continue;
			const next = children[index + 1];
			const fix = lineStartMarkerFix(child.text, {
				first: index === 0,
				beforeChip: !!next && isCharacterRef(next),
			});
			if (!fix) continue;
			const at = [...path, index];
			if ("insert" in fix) {
				Transforms.insertText(editor, ZERO_WIDTH_SPACE, {
					at: { path: at, offset: fix.insert },
				});
			} else {
				Transforms.delete(editor, { at: { path: at, offset: fix.remove } });
			}
			return true;
		}
		return false;
	};

	editor.deleteBackward = (unit) => {
		const { selection } = editor;
		if (unit === "character" && selection && Range.isCollapsed(selection)) {
			const { path, offset } = selection.anchor;
			const typed = Editor.string(editor, {
				anchor: Editor.start(editor, path),
				focus: selection.anchor,
			});
			if (typed.endsWith(LINE_START_MARKER)) {
				Transforms.delete(editor, {
					at: { anchor: { path, offset: offset - 2 }, focus: selection.anchor },
				});
				return;
			}
		}
		deleteBackward(unit);
	};

	editor.normalizeNode = (entry, options) => {
		const [node, path] = entry;
		if (isContentElement(node)) {
			if (castsCharacters(node)) {
				if (chip(node, path) || markLineStarts(node, path)) return;
			} else if (unchip(node, path)) return;
		}
		normalizeNode(entry, options);
	};

	return editor;
};
