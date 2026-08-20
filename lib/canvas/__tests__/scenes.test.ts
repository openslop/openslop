import { describe, expect, it } from "vitest";
import { createEditor, type Editor } from "slate";
import { ZERO_WIDTH_SPACE } from "../constants";
import type {
	CanvasContentElement,
	CanvasElement,
	SceneElement,
} from "../types";
import { isScriptEmpty, parentSceneId, sceneIndexOf } from "../scenes";

const scene = (
	id: string,
	children: CanvasContentElement[] = [],
): SceneElement => ({
	id,
	type: "scene",
	children,
});

const narration = (id: string, body = ""): CanvasContentElement => ({
	id,
	type: "narration",
	children: [
		{ id: `${id}-marker`, type: "narration", text: ZERO_WIDTH_SPACE },
		{ id: `${id}-body`, type: "narration", text: body },
	],
});

describe("isScriptEmpty", () => {
	it("treats a canvas with no scenes as empty", () => {
		expect(isScriptEmpty([])).toBe(true);
	});

	it("treats the normalized placeholder element as empty", () => {
		const nodes = [scene("s1", [narration("n1", "")])];
		expect(isScriptEmpty(nodes)).toBe(true);
	});

	it("treats whitespace-only text as empty", () => {
		const nodes = [scene("s1", [narration("n1", "  \n")])];
		expect(isScriptEmpty(nodes)).toBe(true);
	});

	it("sees authored text anywhere on the canvas", () => {
		const nodes = [
			scene("s1", [narration("n1", "")]),
			scene("s2", [narration("n2", "A story begins.")]),
		];
		expect(isScriptEmpty(nodes)).toBe(false);
	});
});

describe("sceneIndexOf", () => {
	it("returns 0 for an empty list", () => {
		expect(sceneIndexOf([], "anything")).toBe(0);
	});

	it("returns 0 when the id is not found", () => {
		expect(sceneIndexOf([scene("a"), scene("b")], "missing")).toBe(0);
	});

	it("returns the 1-based position of the matching scene", () => {
		expect(sceneIndexOf([scene("a"), scene("b"), scene("c")], "a")).toBe(1);
		expect(sceneIndexOf([scene("a"), scene("b"), scene("c")], "b")).toBe(2);
		expect(sceneIndexOf([scene("a"), scene("b"), scene("c")], "c")).toBe(3);
	});

	it("ignores non-scene siblings when counting", () => {
		const nodes = [narration("t1"), scene("a"), narration("t2"), scene("b")];
		expect(sceneIndexOf(nodes, "a")).toBe(1);
		expect(sceneIndexOf(nodes, "b")).toBe(2);
	});
});

describe("parentSceneId", () => {
	const editorWith = (children: CanvasElement[]): Editor => {
		const editor = createEditor();
		editor.children = children;
		return editor;
	};

	it("returns the id of the scene holding the node", () => {
		const editor = editorWith([scene("s1"), scene("s2", [narration("n1")])]);
		expect(parentSceneId(editor, [1, 0])).toBe("s2");
	});

	it("throws when the parent is not a scene", () => {
		const editor = editorWith([scene("s1")]);
		expect(() => parentSceneId(editor, [0])).toThrow(/not inside a scene/);
	});
});
