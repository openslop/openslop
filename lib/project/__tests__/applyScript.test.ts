import { createEditor, Transforms } from "slate";
import { withHistory } from "slate-history";
import { describe, expect, it } from "vitest";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { SCENE_TYPE, type SceneElement } from "@/lib/canvas/types";
import { applyScriptToEditor } from "../applyScript";

const sceneWithId = (id: string): SceneElement => ({
	id,
	type: SCENE_TYPE,
	children: [
		{
			id: `${id}-narration`,
			type: "narration",
			children: [{ id: `${id}-text`, type: "narration", text: "hello" }],
		},
	],
});

const scene = sceneWithId("scene-id");

describe("applyScriptToEditor", () => {
	it("does not save project load operations to undo history", () => {
		const editor = withHistory(createEditor());
		const osml = serializeOSMLWithScenes([scene]);

		applyScriptToEditor(editor, osml);

		expect(editor.children).toHaveLength(1);
		expect(editor.history.undos).toEqual([]);
	});

	it("drops undo entries that point into the replaced document", () => {
		const editor = withHistory(createEditor());
		const two = serializeOSMLWithScenes([sceneWithId("a"), sceneWithId("b")]);
		applyScriptToEditor(editor, two);

		Transforms.insertText(editor, "!", { at: { path: [1, 0, 0], offset: 5 } });
		expect(editor.history.undos.length).toBeGreaterThan(0);

		applyScriptToEditor(editor, serializeOSMLWithScenes([sceneWithId("a")]));

		expect(editor.history.undos).toEqual([]);
		expect(() => {
			editor.undo();
		}).not.toThrow();
	});
});
