import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withChunking } from "../plugins/withChunking";
import {
	SCENE_TYPE,
	type CanvasEditor,
	type SceneElement,
} from "@/lib/canvas/types";

function makeEditor(): CanvasEditor {
	return withChunking(withReact(createEditor()) as CanvasEditor);
}

const scene: SceneElement = {
	id: "s",
	type: SCENE_TYPE,
	children: [
		{
			id: "n",
			type: "narration",
			children: [{ id: "t", type: "narration", text: "hi" }],
		},
	],
};

describe("withChunking", () => {
	it("chunks the editor's scenes", () => {
		const editor = makeEditor();
		expect(editor.getChunkSize(editor)).toBeGreaterThan(0);
	});

	it("leaves a scene's elements unchunked", () => {
		const editor = makeEditor();
		expect(editor.getChunkSize(scene)).toBeNull();
	});
});
