import { describe, expect, it } from "vitest";
import { createEditor, Editor } from "slate";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { findNodeById, updateNodeText, setNodeAttrs } from "../editorOps";

function content(
	type: CanvasContentElement["type"],
	id: string,
	text = "",
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type,
		...(customAttributes && { customAttributes }),
		children: [{ id: `${id}-t`, type, text }],
	};
}

function scene(children: CanvasContentElement[], id = "s1"): SceneElement {
	return { id, type: "scene", children };
}

function makeEditor(scenes: SceneElement[]) {
	const editor = createEditor();
	editor.children = scenes;
	return editor;
}

describe("findNodeById", () => {
	it("finds a content element by id", () => {
		const editor = makeEditor([
			scene([content("narration", "n1"), content("image", "img1")]),
		]);

		const entry = findNodeById(editor, "img1");
		expect(entry).not.toBeNull();
		expect((entry?.[0] as CanvasContentElement).id).toBe("img1");
		expect(entry?.[1]).toEqual([0, 1]);
	});

	it("returns null for nonexistent id", () => {
		const editor = makeEditor([scene([content("narration", "n1")])]);
		expect(findNodeById(editor, "nope")).toBeNull();
	});

	it("does not match scene elements", () => {
		const editor = makeEditor([scene([content("narration", "n1")], "s1")]);
		expect(findNodeById(editor, "s1")).toBeNull();
	});
});

describe("updateNodeText", () => {
	it("no-ops when text is identical", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const before = JSON.stringify(editor.children);
		updateNodeText(editor, [0, 0], "hello");
		expect(JSON.stringify(editor.children)).toBe(before);
	});

	it("appends diff when new text is a prefix extension", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hel")])]);
		updateNodeText(editor, [0, 0], "hello world");
		expect(Editor.string(editor, [0, 0])).toBe("hello world");
	});

	it("replaces full text when not a prefix extension", () => {
		const editor = makeEditor([
			scene([content("narration", "n1", "old text")]),
		]);
		updateNodeText(editor, [0, 0], "new text");
		expect(Editor.string(editor, [0, 0])).toBe("new text");
	});
});

describe("setNodeAttrs", () => {
	it("merges new attrs into existing", () => {
		const el = content("character", "n1", "", { name: "Lyra" });
		const editor = makeEditor([scene([el])]);

		setNodeAttrs(editor, [0, 0], el, { emotion: "excited" });

		const node = editor.children[0] as SceneElement;
		expect(node.children[0].customAttributes).toEqual({
			name: "Lyra",
			emotion: "excited",
		});
	});

	it("removes attrs set to null", () => {
		const el = content("character", "n1", "", {
			name: "Lyra",
			emotion: "excited",
		});
		const editor = makeEditor([scene([el])]);

		setNodeAttrs(editor, [0, 0], el, { emotion: null });

		const node = editor.children[0] as SceneElement;
		expect(node.children[0].customAttributes).toEqual({ name: "Lyra" });
	});

	it("handles element with no existing customAttributes", () => {
		const el = content("narration", "n1");
		const editor = makeEditor([scene([el])]);

		setNodeAttrs(editor, [0, 0], el, { emotion: "calm" });

		const node = editor.children[0] as SceneElement;
		expect(node.children[0].customAttributes).toEqual({ emotion: "calm" });
	});
});
