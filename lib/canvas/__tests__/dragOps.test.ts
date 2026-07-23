import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { moveDraggedElement } from "../dragOps";

function content(id: string): CanvasContentElement {
	return {
		id,
		type: "narration",
		children: [{ id: `${id}-t`, type: "narration", text: "" }],
	};
}

function scene(id: string, children: CanvasContentElement[]): SceneElement {
	return { id, type: "scene", children };
}

function makeEditor(scenes: SceneElement[]) {
	const editor = createEditor();
	editor.children = scenes;
	return editor;
}

const layout = (editor: ReturnType<typeof makeEditor>) =>
	(editor.children as SceneElement[]).map((s) => [
		s.id,
		s.children.map((c) => c.id),
	]);

describe("moveDraggedElement", () => {
	it("reorders content within a scene", () => {
		const editor = makeEditor([scene("s1", [content("a"), content("b")])]);
		moveDraggedElement(editor, "b", "a");
		expect(layout(editor)).toEqual([["s1", ["b", "a"]]]);
	});

	it("appends content dropped onto another scene", () => {
		const editor = makeEditor([
			scene("s1", [content("a"), content("b")]),
			scene("s2", [content("c")]),
		]);
		moveDraggedElement(editor, "a", "s2");
		expect(layout(editor)).toEqual([
			["s1", ["b"]],
			["s2", ["c", "a"]],
		]);
	});

	it("moves content into the target's slot in another scene", () => {
		const editor = makeEditor([
			scene("s1", [content("a"), content("z")]),
			scene("s2", [content("b"), content("c")]),
		]);
		moveDraggedElement(editor, "a", "c");
		expect(layout(editor)).toEqual([
			["s1", ["z"]],
			["s2", ["b", "a", "c"]],
		]);
	});

	it("reorders scenes", () => {
		const editor = makeEditor([
			scene("s1", [content("a")]),
			scene("s2", [content("b")]),
		]);
		moveDraggedElement(editor, "s2", "s1");
		expect(layout(editor)).toEqual([
			["s2", ["b"]],
			["s1", ["a"]],
		]);
	});

	it("targets the parent scene when a scene is dropped on content", () => {
		const editor = makeEditor([
			scene("s1", [content("a")]),
			scene("s2", [content("b")]),
		]);
		moveDraggedElement(editor, "s2", "a");
		expect(layout(editor)).toEqual([
			["s2", ["b"]],
			["s1", ["a"]],
		]);
	});

	it("no-ops when a scene is dropped on its own content", () => {
		const editor = makeEditor([
			scene("s1", [content("a")]),
			scene("s2", [content("b")]),
		]);
		moveDraggedElement(editor, "s1", "a");
		expect(layout(editor)).toEqual([
			["s1", ["a"]],
			["s2", ["b"]],
		]);
	});

	it("no-ops when either id is missing", () => {
		const editor = makeEditor([scene("s1", [content("a")])]);
		moveDraggedElement(editor, "a", "gone");
		moveDraggedElement(editor, "gone", "a");
		expect(layout(editor)).toEqual([["s1", ["a"]]]);
	});
});
