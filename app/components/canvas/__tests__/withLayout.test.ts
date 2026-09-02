import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import type { CanvasContentElement, CanvasEditor } from "@/lib/canvas/types";
import { DEFAULT_MODELS, type ConnectorModels } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/video/elementAttributes";
import { withLayout } from "../plugins/withLayout";

const seeded = (defaultModels: ConnectorModels) => {
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

	// Speech takes its model from the voice in metadata, not the element.
	it("seeds it without a model of its own", () => {
		const attrs = flatAttributes(seeded({ tts: DEFAULT_MODELS.tts }));
		expect(attrs.provider).toBeUndefined();
		expect(attrs.model).toBeUndefined();
	});
});
