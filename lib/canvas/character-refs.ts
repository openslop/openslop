import sumBy from "lodash/sumBy";
import { matchSorter } from "match-sorter";
import { Editor, Range, Transforms } from "slate";
import { ASSET_KINDS, type AssetKind } from "./assets";
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

/** Names whose start, a word start, or letters in order match `query`, best first; ties keep the given order. */
export const matchNames = (names: string[], query: string) =>
	matchSorter(names, query, { baseSort: (a, b) => a.index - b.index });

/** `start` is the index its first name has among every group's names. */
export type MentionGroup = { kind: AssetKind; names: string[]; start: number };

/** Each kind's names matching `query`, best first, leaving out kinds with none. */
export function mentionGroups(
	names: Record<AssetKind, string[]>,
	query: string,
): MentionGroup[] {
	const matched = ASSET_KINDS.map((kind) => ({
		kind,
		names: matchNames(names[kind], query),
	})).filter((group) => group.names.length > 0);
	return matched.map((group, i) => ({
		...group,
		start: sumBy(matched.slice(0, i), (prior) => prior.names.length),
	}));
}

const MENTION = /(?:^|[^\p{L}\p{N}_@])@([^\s@]*)$/u;

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
	const query = MENTION.exec(typed)?.[1];
	if (query === undefined) return undefined;
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
