import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import type { CanvasContentElement, CanvasEditor } from "@/lib/canvas/types";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/video/elementAttributes";
import { withLayout } from "../plugins/withLayout";

const seeded = (defaultModels: Record<string, string>) => {
	const editor = withLayout(() => defaultModels)(
		withReact(createEditor()) as CanvasEditor,
	);
	editor.children = [];
	editor.normalize({ force: true });
	return editor.children[0] as CanvasContentElement;
};

describe("withLayout", () => {
	it("seeds an empty document with one narration", () => {
		expect(seeded({})).toMatchObject({ type: "narration" });
	});

	it("seeds it with the model the project configured", () => {
		expect(flatAttributes(seeded({ tts: "Slop TTS v1" }))).toMatchObject({
			model: "Slop TTS v1",
		});
	});

	it("falls back to the catalog when the project configured none", () => {
		expect(flatAttributes(seeded({}))).toMatchObject({
			model: MODEL_CATALOGS.tts.defaultModel,
		});
	});
});
