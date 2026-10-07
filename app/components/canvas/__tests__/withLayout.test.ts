import { describe, expect, it } from "vitest";
import { createEditor, Editor, Node, Transforms, type Descendant } from "slate";
import { withReact } from "slate-react";
import type { ConnectorModels } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import { isContentElement } from "@/lib/canvas/guards";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { withLayout } from "../plugins/withLayout";
import { content, scene } from "./fixtures";

const ASSETS = [
	createCanvasNode("asset_style", { text: "noir" }),
	createCanvasNode("asset_avatar", {
		attrs: { name: "Mia" },
		text: "a girl",
	}),
];

const SCRIPT = [scene([content("narration", "n1", "hello")])];

const normalized = (
	children: Descendant[],
	defaultModels: ConnectorModels = {},
) => {
	const editor = withLayout(withReact(createEditor()));
	editor.defaultModels = () => defaultModels;
	editor.children = children;
	editor.normalize({ force: true });
	return editor.children;
};

describe("withLayout", () => {
	it("seeds an empty document with one narration", () => {
		expect(normalized([])).toMatchObject([{ type: "narration" }]);
	});

	it("seeds a document that holds only assets with one narration, after the last of them", () => {
		const children = normalized([...ASSETS]);

		expect(children.slice(0, -1)).toEqual(ASSETS);
		expect(children.at(-1)).toMatchObject({ type: "narration" });
	});

	it("seeds the narration with the model the project speaks in", () => {
		const pinned = { provider: "cartesia", model: "Sonic 3.6" } as const;
		const narration = normalized([], { tts: pinned }).at(-1);

		expect(
			isContentElement(narration) && flatAttributes(narration),
		).toMatchObject(pinned);
	});

	it("leaves a document that holds a script alone", () => {
		const children = [...ASSETS, ...SCRIPT];

		expect(normalized(children)).toEqual(children);
	});

	it("keeps a soft break inside its element", () => {
		const editor = withLayout(withReact(createEditor()));
		editor.children = [scene([content("narration", "n1", "hello")])];
		Transforms.select(editor, Editor.end(editor, [0]));

		editor.insertSoftBreak();

		expect(editor.children).toHaveLength(1);
		expect(Node.string(editor.children[0])).toBe("hello\n");
	});
});
