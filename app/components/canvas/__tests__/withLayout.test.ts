import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import type { CanvasContentElement, CanvasEditor } from "@/lib/canvas/types";
import type { ConnectorModels } from "@/lib/connectors/models";
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

	it("seeds it with the model the project speaks in", () => {
		const pinned = { provider: "cartesia", model: "Sonic 3.5" } as const;
		expect(flatAttributes(seeded({ tts: pinned }))).toMatchObject(pinned);
	});
});
