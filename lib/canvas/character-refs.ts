import { Editor, Range, Transforms } from "slate";
import { castsCharacters } from "./guards";
import { makeNodeId } from "./node-utils";
import { CHARACTER_REF_TYPE, type CharacterRefElement } from "./types";

export const createCharacterRef = (name: string): CharacterRefElement => ({
	id: makeNodeId(),
	type: CHARACTER_REF_TYPE,
	name,
	children: [{ id: makeNodeId(), text: "" }],
});

export type Mention = { range: Range; query: string };

const MENTION = /(?:^|\s)@([^\s@]*)$/;
const WORD_END = /^(\s|$)/;

export function mentionAt(editor: Editor): Mention | undefined {
	const { selection } = editor;
	if (!selection || !Range.isCollapsed(selection)) return undefined;
	const visual = Editor.above(editor, { match: castsCharacters });
	if (!visual) return undefined;
	const caret = selection.anchor;
	const typed = Editor.string(editor, {
		anchor: Editor.start(editor, caret.path),
		focus: caret,
	});
	const rest = Editor.string(editor, {
		anchor: caret,
		focus: Editor.end(editor, caret.path),
	});
	const query = MENTION.exec(typed)?.[1];
	if (query === undefined || !WORD_END.test(rest)) return undefined;
	const at = { path: caret.path, offset: caret.offset - query.length - 1 };
	return { range: { anchor: at, focus: caret }, query };
}

export function insertCharacterRef(
	editor: Editor,
	{ range }: Mention,
	name: string,
): void {
	Transforms.select(editor, range);
	Transforms.insertNodes(editor, createCharacterRef(name));
	Transforms.move(editor);
}
