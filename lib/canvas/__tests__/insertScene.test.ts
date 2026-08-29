import { describe, expect, it, vi } from "vitest";
import { createEditor, Editor } from "slate";

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: () => ({
		defaultAttributes: {},
		keys: [],
	}),
}));

import { isSceneElement } from "../scenes";
import { insertScene } from "../insertScene";

function makeEditor() {
	const editor = createEditor();
	editor.children = [
		{
			id: "scene-1",
			type: "scene",
			children: [
				{
					id: "img-1",
					type: "image",
					children: [{ id: "t1", type: "image", text: "a cat" }],
				},
			],
		},
	];
	return editor;
}

describe("insertScene", () => {
	it("inserts a scene holding one foreground element", () => {
		const editor = makeEditor();
		Editor.withoutNormalizing(editor, () => {
			insertScene(editor, [0]);
		});

		const inserted = editor.children[0];
		expect(isSceneElement(inserted)).toBe(true);
		if (!isSceneElement(inserted)) return;
		expect(inserted.children).toHaveLength(1);
		expect(inserted.children[0].type).toBe("image");
	});

	it("inserts at the given path", () => {
		const editor = makeEditor();
		let id = "";
		Editor.withoutNormalizing(editor, () => {
			id = insertScene(editor, [1]);
		});

		expect(editor.children).toHaveLength(2);
		const inserted = editor.children[1];
		expect(isSceneElement(inserted) && inserted.id).toBe(id);
	});
});
