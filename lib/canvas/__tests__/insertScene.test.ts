import { describe, expect, it, vi } from "vitest";
import { Editor } from "slate";

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: () => ({
		defaultAttributes: {},
		keys: [],
		resolve: (attrs: Record<string, string>) => attrs,
	}),
}));

import type { ConnectorModels } from "@/lib/connectors/models";
import { isScene } from "../scenes";
import { insertScene } from "../insertScene";
import { flatAttributes } from "../elementAttributes";
import { makeEditor } from "./_assets";

const seededEditor = (defaultModels: ConnectorModels = {}) =>
	makeEditor(
		[
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
		],
		defaultModels,
	);

describe("insertScene", () => {
	it("inserts a scene holding one foreground element", () => {
		const editor = seededEditor();
		Editor.withoutNormalizing(editor, () => {
			insertScene(editor, [0]);
		});

		const inserted = editor.children[0];
		expect(isScene(inserted)).toBe(true);
		if (!isScene(inserted)) return;
		expect(inserted.children).toHaveLength(1);
		expect(inserted.children[0].type).toBe("image");
	});

	it("starts the scene's element on the editor's default model", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const editor = seededEditor({ image: pinned });
		Editor.withoutNormalizing(editor, () => {
			insertScene(editor, [0]);
		});

		const inserted = editor.children[0];
		if (!isScene(inserted)) throw new Error("expected a scene");
		expect(flatAttributes(inserted.children[0])).toMatchObject(pinned);
	});

	it("inserts at the given path", () => {
		const editor = seededEditor();
		let id = "";
		Editor.withoutNormalizing(editor, () => {
			id = insertScene(editor, [1]);
		});

		expect(editor.children).toHaveLength(2);
		const inserted = editor.children[1];
		expect(isScene(inserted) && inserted.id).toBe(id);
	});
});
