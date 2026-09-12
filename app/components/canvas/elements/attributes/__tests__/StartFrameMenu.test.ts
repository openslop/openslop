import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { visualOptions } from "../StartFrameMenu";

const visual = (
	id: string,
	type: "image" | "clip",
	startFrame?: string,
): CanvasContentElement => ({
	id,
	type,
	generationAttributes: startFrame ? { startFrame } : {},
	children: [{ id: `${id}-t`, type, text: `${id} prompt` }],
});

const editorWith = (...scenes: CanvasContentElement[][]) => {
	const editor = createEditor();
	editor.children = scenes.map((children, i) => ({
		id: `s${i}`,
		type: "scene",
		children,
	}));
	return editor;
};

describe("visualOptions", () => {
	it("offers every other visual, named by scene", () => {
		const editor = editorWith([visual("a", "image")], [visual("b", "clip")]);
		expect(visualOptions(editor, "b").map((o) => o.value)).toEqual(["a"]);
		expect(visualOptions(editor, "b")[0]?.label).toMatch(/^Scene 1 image/);
	});

	it("never offers a visual whose chain already leads back", () => {
		const editor = editorWith([
			visual("a", "clip", "b"),
			visual("b", "clip", "c"),
			visual("c", "clip"),
			visual("d", "image"),
		]);
		expect(visualOptions(editor, "c").map((o) => o.value)).toEqual(["d"]);
		expect(visualOptions(editor, "a").map((o) => o.value)).toEqual([
			"b",
			"c",
			"d",
		]);
	});
});
