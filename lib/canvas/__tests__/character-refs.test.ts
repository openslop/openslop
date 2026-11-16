import { describe, expect, it } from "vitest";
import { Editor, Transforms } from "slate";
import { matchCharacterNames, mentionAt } from "../character-refs";
import { ZERO_WIDTH_SPACE } from "../constants";
import { SCENE_TYPE, type ContentElement } from "../types";
import { element, makeEditor } from "./_assets";

const caretAtEnd = (content: ContentElement) => {
	const editor = makeEditor([
		{ id: "s", type: SCENE_TYPE, children: [content] },
	]);
	Transforms.select(editor, Editor.end(editor, []));
	return editor;
};

describe("mentionAt", () => {
	it("finds the @ before the caret in a visual, with what is typed after it", () => {
		const editor = caretAtEnd(element("i", "image", "A field with @Gr"));

		expect(mentionAt(editor)).toEqual({
			query: "Gr",
			range: {
				anchor: { path: [0, 0, 0], offset: 13 },
				focus: { path: [0, 0, 0], offset: 16 },
			},
		});
	});

	it("finds a bare @, before anything is typed after it", () => {
		const editor = caretAtEnd(element("i", "image", "A field with @"));

		expect(mentionAt(editor)?.query).toBe("");
	});

	it.each([
		["after the caret marker", `${ZERO_WIDTH_SPACE}@`],
		["before the caret marker", `@${ZERO_WIDTH_SPACE}`],
	])("finds an @ typed first in a prompt, %s", (_, marker) => {
		const editor = caretAtEnd(element("i", "image", marker));
		Transforms.select(editor, {
			path: [0, 0, 0],
			offset: marker.indexOf("@") + 1,
		});

		expect(mentionAt(editor)?.query).toBe("");
	});

	it.each([
		["a closing bracket", "A field with (@)"],
		["a possessive", "A field with @'s basket"],
		["a comma", "A field with @, a road"],
		["an existing word", "A field with @Granny"],
	])("finds an @ followed by %s", (_, text) => {
		const editor = caretAtEnd(element("i", "image", text));
		Transforms.select(editor, {
			path: [0, 0, 0],
			offset: text.indexOf("@") + 1,
		});

		expect(mentionAt(editor)?.query).toBe("");
	});

	it("finds what is typed between the @ and a caret inside a word", () => {
		const editor = caretAtEnd(element("i", "image", "A field with @Granny"));
		Transforms.move(editor, { distance: 4, reverse: true });

		expect(mentionAt(editor)).toEqual({
			query: "Gr",
			range: {
				anchor: { path: [0, 0, 0], offset: 13 },
				focus: { path: [0, 0, 0], offset: 16 },
			},
		});
	});

	it.each([
		["speech", element("n", "speech", "Mail me @Gr")],
		["an @ inside a word", element("i", "image", "me@Gr")],
		["an @ right after another", element("i", "image", "A field with @@")],
	])("finds nothing in %s", (_, content) => {
		expect(mentionAt(caretAtEnd(content))).toBeUndefined();
	});
});

describe("matchCharacterNames", () => {
	const names = ["Grace", "Granny Smith", "Gregory", "Bob"];

	it("lists every character, in their own order, for an empty query", () => {
		expect(matchCharacterNames(names, "")).toEqual(names);
	});

	it("finds a name by the start of a later word", () => {
		expect(matchCharacterNames(names, "smi")).toEqual(["Granny Smith"]);
	});

	it("finds a name from letters typed with some skipped", () => {
		expect(matchCharacterNames(["Granny", "Bob"], "grny")).toEqual(["Granny"]);
	});

	it("ignores case", () => {
		expect(matchCharacterNames(names, "BOB")).toEqual(["Bob"]);
	});

	it("ranks names starting with the query above word-start and fuzzy hits", () => {
		expect(
			matchCharacterNames(["Old Gran", "Gertrude Rae Annie", "Gran"], "gra"),
		).toEqual(["Gran", "Old Gran", "Gertrude Rae Annie"]);
	});

	it("keeps the characters' own order among equally good matches", () => {
		expect(matchCharacterNames(["Gregory", "Grace"], "gr")).toEqual([
			"Gregory",
			"Grace",
		]);
	});

	it("lists nothing when no name holds the typed letters in order", () => {
		expect(matchCharacterNames(names, "zq")).toEqual([]);
	});
});
