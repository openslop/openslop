import { createEditor, Transforms } from "slate";
import { withHistory } from "slate-history";
import { describe, expect, it } from "vitest";
import { serializeOSMLWithScenes } from "@/lib/canvas/osml-serializer";
import { getAssets } from "@/lib/canvas/assets";
import { isScene } from "@/lib/canvas/scenes";
import {
	PLAYGROUND_CONTENT_TYPES,
	SCENE_TYPE,
	type Scene,
} from "@/lib/canvas/types";
import { applyScriptToEditor } from "../apply-script";

const sceneWithId = (id: string): Scene => ({
	id,
	type: SCENE_TYPE,
	children: [
		{
			id: `${id}-narration`,
			type: "narration",
			children: [{ id: `${id}-text`, text: "hello" }],
		},
	],
});

const scene = sceneWithId("scene-id");

const historyEditor = () =>
	Object.assign(withHistory(createEditor()), { defaultModels: () => ({}) });

describe("applyScriptToEditor", () => {
	it("does not save project load operations to undo history", () => {
		const editor = historyEditor();
		const osml = serializeOSMLWithScenes([scene]);

		applyScriptToEditor(editor, osml);

		expect(editor.children.filter(isScene)).toHaveLength(1);
		expect(editor.history.undos).toEqual([]);
	});

	it("gives a loaded document every playground draft, once", () => {
		const editor = historyEditor();
		const osml = serializeOSMLWithScenes([scene]);
		applyScriptToEditor(editor, osml);

		applyScriptToEditor(editor, serializeOSMLWithScenes(editor.children));

		expect(
			getAssets(editor.children)
				.map((asset) => asset.type)
				.sort(),
		).toEqual(
			PLAYGROUND_CONTENT_TYPES.map((type) => `asset_playground_${type}`).sort(),
		);
	});

	it("drops undo entries that point into the replaced document", () => {
		const editor = historyEditor();
		const two = serializeOSMLWithScenes([sceneWithId("a"), sceneWithId("b")]);
		applyScriptToEditor(editor, two);

		const last = editor.children.length - 1;
		Transforms.insertText(editor, "!", {
			at: { path: [last, 0, 0], offset: 5 },
		});
		expect(editor.history.undos.length).toBeGreaterThan(0);

		applyScriptToEditor(editor, serializeOSMLWithScenes([sceneWithId("a")]));

		expect(editor.history.undos).toEqual([]);
		expect(() => {
			editor.undo();
		}).not.toThrow();
	});
});
