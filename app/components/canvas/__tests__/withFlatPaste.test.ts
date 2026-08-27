import { describe, expect, it } from "vitest";
import { createEditor, Editor, Element } from "slate";
import { withReact } from "slate-react";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import { withNodeId } from "../plugins/withNodeId";
import { CanvasEditor } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { content, scene, seedScene } from "./fixtures";

function makeEditor(): CanvasEditor {
	return withNodeId(withFlatPaste(withScenes(withReact(createEditor()))));
}

function shape(editor: Editor): string[][] {
	return editor.children.map((s) =>
		isSceneElement(s)
			? s.children.map((c) => c.type)
			: [`!${(s as Element).type}`],
	);
}

function hasNestedScene(editor: Editor): boolean {
	return editor.children.some(
		(n) =>
			isSceneElement(n) && n.children.some((c) => isSceneElement(c as Element)),
	);
}

describe("withFlatPaste", () => {
	it("flattens scene wrappers in pasted fragments", () => {
		const editor = makeEditor();
		seedScene(editor, scene([content("narration", "n0")]));

		editor.insertFragment([
			scene([content("image", "i1"), content("narration", "n1")], "ps1"),
		]);

		expect(hasNestedScene(editor)).toBe(false);
	});

	it("passes through bare content elements unchanged", () => {
		const editor = makeEditor();
		seedScene(editor, scene([content("narration", "n0")]));

		editor.insertFragment([content("sound", "snd1")]);

		const types = shape(editor).flat();
		expect(types).toContain("sound");
		expect(hasNestedScene(editor)).toBe(false);
	});

	it("handles a mixed fragment of scenes and bare content", () => {
		const editor = makeEditor();
		seedScene(editor, scene([content("narration", "n0")]));

		editor.insertFragment([
			scene([content("image", "i1")], "ps1"),
			content("music", "m1"),
			scene([content("clip", "c1")], "ps2"),
		]);

		const types = shape(editor).flat();
		expect(types).toContain("image");
		expect(types).toContain("music");
		expect(types).toContain("clip");
		expect(hasNestedScene(editor)).toBe(false);
	});
});
