import { describe, expect, it } from "vitest";
import { createEditor, type Editor } from "slate";
import type { CanvasElement, SceneElement } from "../types";
import { parentSceneId, sceneIndexOf } from "../scenes";

const scene = (id: string): SceneElement => ({
	id,
	type: "scene",
	children: [],
});

const text = (id: string): CanvasElement => ({
	id,
	type: "narration",
	children: [],
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
		const nodes = [text("t1"), scene("a"), text("t2"), scene("b")];
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
		const editor = editorWith([
			scene("s1"),
			{
				...scene("s2"),
				children: [{ id: "n1", type: "narration" as const, children: [] }],
			},
		]);
		expect(parentSceneId(editor, [1, 0])).toBe("s2");
	});

	it("throws when the parent is not a scene", () => {
		const editor = editorWith([scene("s1")]);
		expect(() => parentSceneId(editor, [0])).toThrow(/not inside a scene/);
	});
});
